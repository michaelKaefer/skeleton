<?php

declare(strict_types=1);

namespace App\Service\FileUploader;

use Psr\Log\LoggerInterface;
use League\Flysystem\FilesystemInterface;

class PublicFilesUploader extends FileUploader
{
    public function __construct(FilesystemInterface $publicUploadsFilesystem, LoggerInterface $logger)
    {
        parent::__construct($publicUploadsFilesystem, $logger);
    }
}
