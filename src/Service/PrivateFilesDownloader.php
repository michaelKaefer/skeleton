<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\StreamedResponse;
use League\Flysystem\FilesystemInterface;
use League\Flysystem\FileNotFoundException;

class PrivateFilesDownloader
{
    private $filesystem;

    public function __construct(FilesystemInterface $privateUploadsFilesystem)
    {
        $this->filesystem = $privateUploadsFilesystem;
    }

    public function createStreamedResponse(
        string $internalFilename,
        string $mimeType,
        string $publicFilename
    ): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($internalFilename) {
            $outputStream = fopen('php://output', 'wb');
            $fileStream = $this->readStream($internalFilename);

            stream_copy_to_stream($fileStream, $outputStream);
        });

        $response->headers->set('Content-Type', $mimeType);
        $response->headers->set('Content-Disposition', HeaderUtils::makeDisposition(
            HeaderUtils::DISPOSITION_ATTACHMENT,
            $publicFilename
        ));

        return $response;
    }

    /**
     * @param string $filename
     *
     * @return resource
     *
     * @throws FileNotFoundException
     */
    public function readStream(string $filename)
    {
        $resource = $this->filesystem->readStream($filename);

        if (false === $resource) {
            throw new \RuntimeException(sprintf('Could not open stream for file "%s".', $filename));
        }

        return $resource;
    }
}
