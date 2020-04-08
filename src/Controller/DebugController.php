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
