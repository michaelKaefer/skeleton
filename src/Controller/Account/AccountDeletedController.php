<?php

declare(strict_types=1);

namespace App\Controller\Account;

//use App\Controller\BaseController;
use Symfony\Component\HttpFoundation\Response;




use Symfony\Component\Routing\Annotation\Route;

use App\Controller\BaseController;
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
