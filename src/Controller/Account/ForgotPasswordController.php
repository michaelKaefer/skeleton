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

use App\Controller\BaseController;
use App\Form\ForgotPasswordType;
use App\Repository\UserRepository;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class ForgotPasswordController extends BaseController
{
    /**
     * @Route("/forgot-password", name="forgot_password")
     *
     * @throws TransportExceptionInterface
     */
    public function forgotPassword(Request $request, UserRepository $users, MailerInterface $mailer, TokenGeneratorInterface $tokenGenerator): Response
    {
        $form = $this->createForm(ForgotPasswordType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user = $users->findOneBy(['email' => $form->getData()['email']]);

            if ($user) {
                $numberOfMinutesUntilExpiration = 10;
                $user->setPasswordResetToken($tokenGenerator->generateToken());
                $user->setPasswordResetTokenExpiresAt((new \DateTime())->add(new \DateInterval(sprintf('PT%dM', $numberOfMinutesUntilExpiration))));

                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($user);
                $entityManager->flush();

                // Reset password email
                $email = (new TemplatedEmail())
                    ->to(new Address($user->getEmail(), (string) $user))
                    ->subject('Reset password of your account')
                    ->htmlTemplate('emails/user/reset-password.html.twig')
                    ->context([
                        'user' => $user,
                    ]);
                $mailer->send($email);
            }

            return $this->render('pages/account/reset-password-was-sent.html.twig'); // For security reasons show this even if the email does not exist
        }

        return $this->render('pages/account/forgot-password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
