<?php

namespace App\Service;

use App\FileUploader;
use Psr\Log\LoggerInterface;
use League\Flysystem\FilesystemInterface;

class PrivateFilesUploader extends FileUploader
{
    public function __construct(FilesystemInterface $privateUploadsFilesystem, LoggerInterface $logger)
    {
        parent::__construct($privateUploadsFilesystem, $logger);
    }
}
