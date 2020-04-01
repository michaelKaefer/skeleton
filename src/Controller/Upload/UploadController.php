<?php

namespace App\Controller\Upload;

use App\Controller\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UploadController extends BaseController
{
    /**
     * @Route("/upload", name="upload", methods={"POST"})
     * @param Request $request
     *
     * @return Response
     */
    public function upload(Request $request): Response
    {
    	dd($request->files->all());
    }
}
