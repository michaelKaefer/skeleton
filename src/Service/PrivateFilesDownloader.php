<?php

declare(strict_types=1);

/*
 * This file is part of Skeleton.
 *
 * (c) Michael Käfer <michael.kaefer1@gmx.at>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Service;

use League\Flysystem\FileNotFoundException;
use League\Flysystem\FilesystemInterface;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
    ): StreamedResponse {
        $response = new StreamedResponse(function () use ($internalFilename) {
            $outputStream = fopen('php://output', 'w');
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
     * @throws FileNotFoundException
     *
     * @return resource
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
