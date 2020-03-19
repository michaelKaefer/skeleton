<?php

namespace App\Controller\Account;

use App\Controller\BaseController;
use App\Entity\User;
use App\Form\ProfileFormType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ProfileController extends BaseController
{
    /**
     * @Route("/profile", name="profile")
     * @IsGranted("ROLE_USER")
     * @param Request $request
     * @return Response
     */
    public function profile(Request $request)
    {
        /** @var User $user */
        $user = $this->getUser();
        $form = $this->createForm(ProfileFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();
        }

        return $this->render('pages/account/profile.html.twig', [
            'user' => $user,
            'form' => $form->createView(),
        ]);
    }
}
