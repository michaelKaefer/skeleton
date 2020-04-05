<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DebugController extends AbstractController
{
    /**
     * @IsGranted("ROLE_USER")
     * @Route("/debug", name="debug", methods={"GET"})
     */
    public function index()
    {
//    	dd($this->getUser());
    	return new JsonResponse([
    		'here' => 'Hello!',
    		$this->getUser()->getId(),
		    'zuzi' => 123123,
	    ]);
    }
}
