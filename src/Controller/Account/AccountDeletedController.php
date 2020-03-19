<?php

namespace App\Controller\Account;

use App\Controller\BaseController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AccountDeletedController extends BaseController
{
    /**
     * @Route("/account-deleted/{deletionId}", name="account_deleted")
     * @param string $deletionId
     * @return Response
     */
    public function confirmDeletion(string $deletionId): Response
    {
        return $this->render('pages/account/account-deleted.html.twig', [
            'deletionId' => $deletionId,
        ]);
    }
}
