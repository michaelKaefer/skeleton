<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DebugController extends AbstractController
{
    /**
     * @Route("/debug", name="debug")
     */
    public function index()
    {
    	return new JsonResponse([
    		$this->getUser(),
	    ]);
    }
}
