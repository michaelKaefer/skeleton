<?php

declare(strict_types=1);

namespace App\Controller\Account;

use App\Controller\BaseController;
use App\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DeleteAccountController extends BaseController
{
    /**
     * @Route("/user/{id}", name="user_delete", methods={"DELETE"})
     * @IsGranted("ROLE_USER")
     * @param Request $request
     * @param User $user
     * @return Response
     */
    public function delete(Request $request, User $user): Response
    {
        if (!$this->isCsrfTokenValid('delete'.$user->getId(), $request->request->get('_token'))) {
            return new Response('Forbidden', 403);
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($user);
        $em->flush();

        return $this->redirectToRoute('logout');
    }
}
