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

namespace App\Controller\Upload;

use App\Controller\BaseController;
use App\Entity\File;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\FileUploader\PublicFilesUploader;
use Exception;
use League\Flysystem\FileExistsException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AvatarUploadController extends BaseController
{
    private $uploader;
    private $uploadsUrl;

    public function __construct(PublicFilesUploader $uploader, string $uploadsUrl)
    {
        $this->uploader = $uploader;
        $this->uploadsUrl = $uploadsUrl;
    }

    /**
     * @Route("/avatar-upload/{user}", name="avatar_upload", methods={"POST"})
     *
     * @throws Exception
     */
    public function uploadPublicFile(Request $request, User $user): Response
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        if ($currentUser->getId() !== $user->getId()) {
            return new Response('Forbidden', 403);
        }

        if (1 < $request->files->count()) {
            throw new Exception('This route accepts only one file.');
        }

        $fileToReplace = null;
        /** @var File $previousFile */
        if (null !== $previousFile = $user->getAvatar()) {
            $fileToReplace = $previousFile->getName();
        }

        $relativePath = $user->getAvatarRelativePath();

        /** @var UploadedFile $uploadedFile */
        foreach ($request->files->all() as $uploadedFile) {
            [$nameWithoutExtension, $extension] = $this->uploader->upload($relativePath, $uploadedFile, $fileToReplace);

            $file = (new File())
                ->setNameWithoutExtension($nameWithoutExtension)
                ->setExtension($extension)
                ->setOriginalNameWithoutExtension(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_BASENAME))
                ->setSize($uploadedFile->getSize());
            $user->setAvatar($file);
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($user);
        $em->flush();

        return new JsonResponse([
            'url' => $this->uploadsUrl . '/' . $user->getAvatarUrl(),
        ], 201, [
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
