<?php

namespace App\Controller\Web\Guest\Account;

use App\Controller\Web\BaseController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class LoginController extends BaseController
{
    /**
     * @Route("/login", name="login")
     *
     * @param Security $security
     * @param AuthenticationUtils $authenticationUtils
     *
     * @return Response
     */
    public function login(Security $security, AuthenticationUtils $authenticationUtils): Response
    {
        // If the user is already logged in, don't display the login page again
        if ($security->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('easyadmin');
        }
        if ($security->isGranted('ROLE_USER')) {
            return $this->redirectToRoute('profile');
        }

        return $this->render('pages/account/login.html.twig', [
            // last username entered by the user (if any)
            'last_username' => $authenticationUtils->getLastUsername(),
            // last authentication error (if any)
            'error' => $authenticationUtils->getLastAuthenticationError(),
        ]);
    }
}
