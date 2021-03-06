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

namespace App\Service;

use App\Entity\User;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;
use Exception;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    private $urlGenerator;
    private $tokenStorage;

    public function __construct(UrlGeneratorInterface $urlGenerator, TokenStorageInterface $tokenStorage)
    {
        $this->urlGenerator = $urlGenerator;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @param Request $request
     * @return RedirectResponse|Response
     * @throws Exception
     */
    public function onLogoutSuccess(Request $request)
    {
        if (null === $token = $this->tokenStorage->getToken()) {
            throw new Exception(sprintf('Expected instance of "%s" but got "null".', TokenInterface::class));
        }

        $user = $token->getUser();

        if (
            !\is_string($user) // User can be a string like "anonym."
            && $user instanceof User
            && $deletionId = $user->getDeletionId()
        ) {
            return new RedirectResponse($this->urlGenerator->generate('account_deleted', [
                'deletionId' => $deletionId,
            ]));
        }

        return new RedirectResponse($this->urlGenerator->generate('login'));
    }
}
