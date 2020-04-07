<?php

declare(strict_types=1);

namespace App\Controller\Account;

use App\Controller\BaseController;
use LogicException;
use Symfony\Component\Routing\Annotation\Route;

class LogoutController extends BaseController
{
    /**
     * @codeCoverageIgnore
     *
     * This is the route the user can use to logout.
     *
     * But, this will never be executed. Symfony will intercept this and
     * handle the logout automatically. See the "logout" key in
     * "config/packages/security.yaml".
     *
     * @Route("/logout", name="logout")
     *
     * @throws LogicException
     */
    public function logout(): void
    {
         throw new LogicException('This method should never be reached.');
    }
}
