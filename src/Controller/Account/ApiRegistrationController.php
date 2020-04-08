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

use ApiPlatform\Core\Api\IriConverterInterface;
use App\Controller\BaseController;
use App\Entity\User;
use App\Security\LoginFormAuthenticator;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;

class ApiRegistrationController extends BaseController
{
    /**
     * @Route("/api-register", name="api_registration", methods={"POST"})
     *
     * @throws TransportExceptionInterface
     */
    public function apiRegister(
        Request $request,
        UserPasswordEncoderInterface $passwordEncoder,
        GuardAuthenticatorHandler $guardHandler,
        TokenGeneratorInterface $tokenGenerator,
        LoginFormAuthenticator $authenticator,
        MailerInterface $mailer,
        IriConverterInterface $iriConverter
    ): Response {
        list(
            'email' => $email,
            'password' => $plainPassword,
            'agreeTermsAndDataPrivacy' => $agreeToTermsAndDataPrivacy,
            'newsletter' => $receivesNewsletter
        ) = json_decode($request->getContent(), true);

        $user = (new User())
            ->setEmail($email)
            ->setReceivesNewsletter($receivesNewsletter);

        $user->setPassword($passwordEncoder->encodePassword($user, $plainPassword));
        $user->setLastLoginAt(new \DateTime());
        $user->setConfirmationToken($tokenGenerator->generateToken());

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($user);
        $entityManager->flush();

        // Confirmation email
        $mailer->send((new TemplatedEmail())
            ->to(new Address($user->getEmail(), (string) $user))
            ->subject('Please confirm your account')
            ->htmlTemplate('emails/user/confirmation.html.twig')
            ->context([
                'user' => $user,
            ])
        );

        $guardHandler->authenticateUserAndHandleSuccess(
            $user,
            $request,
            $authenticator,
            'main' // firewall name in security.yaml
        );

        return $this->json([
            'Location' => $iriConverter->getIriFromItem($this->getUser()),
        ]);
    }
}
