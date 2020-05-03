<?php

/*
 * This file is part of Skeleton.
 *
 * (c) Michael Käfer <michael.kaefer1@gmx.at>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller\Development;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class ComponentLibraryController extends AbstractController
{
    /**
     * @Route("/component-library", name="component_library")
     * @IsGranted("ROLE_ADMIN")
     */
    public function index()
    {
        return $this->render('pages/development/component_library.html.twig');
    }
}
