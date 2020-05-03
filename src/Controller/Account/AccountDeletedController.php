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

namespace App\Controller\Account;

//use App\Controller\BaseController;
use App\Controller\BaseController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AccountDeletedController extends BaseController
{
    /**
     * @Route("/account-deleted/{deletionId}", name="account_deleted")
     */
    public function confirmDeletion(string $deletionId): Response
    {
        return $this->render('pages/account/account-deleted.html.twig', [
            'deletionId' => $deletionId,
        ]);
    }
}
