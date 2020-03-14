<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    /**
     * @Route("/", name="home")
     */
    public function index()
    {
        return $this->render('pages/home.html.twig');
    }

//    /**
//     * @Route("/product/{id}/download/image")
//     * @IsGranted(...)
//     */
//    public function downloadProductImage(Product $product, PrivateFilesDownloader $downloader)
//    {
//        return $downloader->createStreamedResponse(
//            Product::RELATIVE_PATH_TO_UPLOADED_IMAGES . $product->getMainImage()->getFilename(),
//            $product->getMainImage()->getMimeType(),
//            $product->getMainImage()->getOriginalFilename()
//        );
//    }


//    public function foo(Request $request, FileUploader $uploader): Response
//    {
//        // ...
//
//        if ($form->isSubmitted() && $form->isValid()) {
//            /** @var UploadedFile|null $file */
//            if (null !== $file = $form['avatar']->getData()) {
//                $filename = $uploader->upload(
//                    User::RELATIVE_PATH_TO_UPLOADED_AVATARS,
//                    $file,
//                    $user->getAvatar()
//                );
//                $user->setAvatar($filename);
//            }
//
//            // ...
//        }
//
//        // ...
//    }
}
