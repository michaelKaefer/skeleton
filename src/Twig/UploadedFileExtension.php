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

namespace App\Twig;

use Symfony\Component\Asset\Context\RequestStackContext;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

// USAGE
//{# Get the original file #}
//   <img src="{{ uploaded_file(user.avatarUrl) }}">
//{# Get a filtered file with LiipImagineBundle (the bundle knows the path to the file via Flysytem #}
//  <img src="{{ user.avatarUrl|imagine_filter('squared_thumbnail_small') }}">
//
class UploadedFileExtension extends AbstractExtension
{
    private $uploadsUrl;

    private $requestStackContext;

    public function __construct(string $uploadsUrl, RequestStackContext $requestStackContext)
    {
        $this->uploadsUrl = $uploadsUrl;
        $this->requestStackContext = $requestStackContext;
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('uploaded_file', [$this, 'getUrlOfUploadedFile']),
        ];
    }

    public function getUrlOfUploadedFile(string $filename): string
    {
        return $this->uploadsUrl
            .'/'
            .$this->requestStackContext->getBasePath()
            .$filename;
    }
}
