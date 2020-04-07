<?php

declare(strict_types=1);

namespace App\Service\FileUploader;

use Psr\Log\LoggerInterface;
use League\Flysystem\FilesystemInterface;

class PrivateFilesUploader extends FileUploader
{
    public function __construct(FilesystemInterface $privateUploadsFilesystem, LoggerInterface $logger)
    {
        parent::__construct($privateUploadsFilesystem, $logger);
    }
}
