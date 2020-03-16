<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    private $urlGenerator;
    private $tokenStorage;

    public function __construct(UrlGeneratorInterface $urlGenerator, TokenStorageInterface $tokenStorage)
    {
        $this->urlGenerator = $urlGenerator;
        $this->tokenStorage = $tokenStorage;
    }

    public function onLogoutSuccess(Request $request)
    {
        /** @var User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!is_string($user) && $deletionId = $user->getDeletionId()) { // User can be a string like "anonym."
            return new RedirectResponse($this->urlGenerator->generate('account_deleted', [
                'deletionId' => $deletionId,
            ]));
        }

        return new RedirectResponse($this->urlGenerator->generate('login'));
    }
}
