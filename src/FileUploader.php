<?php

namespace App;

use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Psr\Log\LoggerInterface;
use League\Flysystem\FilesystemInterface;
use League\Flysystem\FileExistsException;
use League\Flysystem\FileNotFoundException;

abstract class FileUploader
{
    private $filesystem;
    private $logger;

    public function __construct(FilesystemInterface $filesystem, LoggerInterface $logger)
    {
        $this->filesystem = $filesystem;
        $this->logger = $logger;
    }

    /**
     * @param string $relativeDestinationPath  Relative path from the uploads directory to the file. Without the
     *                                         filename, optionally can include a trailing slash.
     * @param File $file                    The uploaded file.
     * @param string|null $fileToReplace    The name of the file which gets replaced by the uploaded file, so that
     *                                      it can be deleted. Just the filename without the absolute and without
     *                                      the relative path.
     *
     * @return string
     *
     * @throws FileExistsException
     */
    public function upload(string $relativeDestinationPath, File $file, ?string $fileToReplace)
    {
        $relativeDestinationPath = rtrim($relativeDestinationPath, '/');

        $filename = $this->createFilename($file);

        $stream = fopen($file->getPathname(), 'r');

        $status = $this->filesystem->writeStream(
            $relativeDestinationPath . '/' . $filename,
            $stream
        );

        if (false === $status) {
            throw new \RuntimeException(sprintf('Could not create file "%s".', $filename));
        }

        // Not all flysystem adapters close the stream
        if (is_resource($stream)) {
            fclose($stream);
        }

        if (null !== $fileToReplace) {
            $this->deleteFile($relativeDestinationPath, $fileToReplace);
        }

        // Return the filename without the path so that e.g. it can be stored on an entity
        return $filename;
    }

    private function createFilename(File $file): string
    {
        if ($file instanceof UploadedFile) {
            $originalFilename = $file->getClientOriginalName();
        } else {
            // This will only be used by fixtures
            $originalFilename = $file->getFilename();
        }

        // Take the name of the uploaded file's name but ignore the file extension
        $originalFilenameWithoutExtension = pathinfo($originalFilename, PATHINFO_FILENAME);

        // Remove characters to create a safe name
        $name = transliterator_transliterate(
            'Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()',
            $originalFilenameWithoutExtension
        );

        /**
         * @var string $extension
         * The original file extension of the uploaded file cannot be trusted. For example it is
         * easy to rename a file from "foo.sh" to "foo.png" before uploading it. File::guessExtension()
         * guesses the extension from the content of the file not from the sent name which we ignore.
         */
        $extension = $file->guessExtension();

        $hash = uniqid();

        return "$name-$hash.$extension";
    }

    private function deleteFile(string $relativePath, string $filename)
    {
        $filename = $relativePath . '/' . $filename;

        try {
            $status = $this->filesystem->delete($filename);

            if (false === $status) {
                throw new \RuntimeException(sprintf('Could not delete file "%s".', $filename));
            }
        } catch (FileNotFoundException $exception) {
            $this->logger->alert(sprintf('Could not delete file "%s" because it does not exist.', $filename));
        }
    }
}
