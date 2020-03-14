<?php

namespace App\Service;

use App\FileUploader;
use Psr\Log\LoggerInterface;
use League\Flysystem\FilesystemInterface;

class PublicFilesUploader extends FileUploader
{
    public function __construct(FilesystemInterface $publicUploadsFilesystem, LoggerInterface $logger)
    {
        parent::__construct($publicUploadsFilesystem, $logger);
    }
}
