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

namespace App\Service\FileUploader;

use League\Flysystem\FilesystemInterface;
use Psr\Log\LoggerInterface;

class PublicFilesUploader extends FileUploader
{
    public function __construct(FilesystemInterface $publicUploadsFilesystem, LoggerInterface $logger)
    {
        parent::__construct($publicUploadsFilesystem, $logger);
    }
}
