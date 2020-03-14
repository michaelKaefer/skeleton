<?php

namespace App\Controller\Web\User\Account;

use App\Controller\Web\BaseController;
use App\Entity\User;
use App\Event\UserWantsToDeleteAccountEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;

class DeleteAccountController extends BaseController
{
    /**
     * @Route("/user/delete/{id}", name="user_delete", methods={"GET"})
     * @IsGranted("ROLE_USER")
     * @param Request $request
     * @param User $user
     * @param TranslatorInterface $translator
     *
     * @param EventDispatcherInterface $dispatcher
     * @return Response
     */
    public function delete(Request $request, User $user, TranslatorInterface $translator, EventDispatcherInterface $dispatcher): Response
    {
        if ($user->getId() !== $this->getUser()->getId()) {
            $this->addFlash('warning', 'You are not allowed to delete users, we redirected you here.');
            return $this->redirectToRoute('profile');
        }

        $event = new UserWantsToDeleteAccountEvent($user);
        $dispatcher->dispatch($event, UserWantsToDeleteAccountEvent::USER_WANTS_TO_DELETE_ACCOUNT);

        return $this->redirectToRoute('logout');
    }
}
