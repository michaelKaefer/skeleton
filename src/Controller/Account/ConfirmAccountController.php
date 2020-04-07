<?php

declare(strict_types=1);

namespace App\Controller\Account;

use App\Controller\BaseController;
use App\Repository\UserRepository;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class ConfirmAccountController extends BaseController
{
	/**
	 * @Route("/confirm/{confirmationToken}", name="confirmation")
	 * @param Request $request
	 * @param string $confirmationToken
	 * @param UserRepository $users
	 * @param MailerInterface $mailer
	 *
	 * @param SerializerInterface $serializer
	 *
	 * @return Response
	 * @throws TransportExceptionInterface
	 */
    public function confirm(Request $request, string $confirmationToken, UserRepository $users, MailerInterface $mailer, SerializerInterface $serializer): Response
    {
        $user = $users->findOneBy(['confirmationToken' => $confirmationToken]);

        if (!$user) {
            throw new NotFoundHttpException('Your confirmation token is invalid. Please try again or contact us.');
        }

        $user->setConfirmationToken(null);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($user);
        $entityManager->flush();

        // Welcome email
        $email = (new TemplatedEmail())
            ->to(new Address($user->getEmail(), (string) $user))
            ->subject('Welcome at Skeleton')
            ->htmlTemplate('emails/user/welcome.html.twig')
            ->context([
                'user' => $user,
            ]);
        $mailer->send($email);

        // Info email to Global TCAD
        $email = (new TemplatedEmail())
            ->to(new Address('office@skeleton.com', 'Skeleton GmbH'))
            ->subject('New user registration')
            ->htmlTemplate('emails/admin/registration-info.html.twig')
            ->context([
                'user' => $serializer->serialize($user, 'json'),
            ]);
        $mailer->send($email);

        return $this->redirectToRoute('profile');
    }
}
