<?php

namespace App\Controller\Account;

use ApiPlatform\Core\Api\IriConverterInterface;
use App\Controller\BaseController;
use App\Entity\User;
use App\Form\RegistrationFormType;
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

class RegistrationController extends BaseController
{
    /**
     * @Route("/register", name="registration", methods={"GET", "POST"})
     * @param Request $request
     * @param UserPasswordEncoderInterface $passwordEncoder
     * @param GuardAuthenticatorHandler $guardHandler
     * @param TokenGeneratorInterface $tokenGenerator
     * @param LoginFormAuthenticator $authenticator
     * @param MailerInterface $mailer
     *
     * @return Response
     * @throws TransportExceptionInterface
     */
    public function register(
        Request $request,
        UserPasswordEncoderInterface $passwordEncoder,
        GuardAuthenticatorHandler $guardHandler,
        TokenGeneratorInterface $tokenGenerator,
        LoginFormAuthenticator $authenticator,
        MailerInterface $mailer
    ): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
        	$user = $this->registerAndLoginUser(
		        $user,
		        $form->get('plainPassword')->getData(),
				$passwordEncoder,
				$tokenGenerator,
				$mailer
	        );

	        // Login user
	        return $guardHandler->authenticateUserAndHandleSuccess(
		        $user,
		        $request,
		        $authenticator,
		        'main' // firewall name in security.yaml
	        );
        }

        return $this->render('pages/account/registration.html.twig', [
            'form' => $form->createView(),
        ]);
    }
	/**
	 * @Route("/api-register", name="api_registration", methods={"POST"})
	 * @param Request $request
	 * @param UserPasswordEncoderInterface $passwordEncoder
	 * @param GuardAuthenticatorHandler $guardHandler
	 * @param TokenGeneratorInterface $tokenGenerator
	 * @param LoginFormAuthenticator $authenticator
	 * @param MailerInterface $mailer
	 *
	 * @return Response
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
	): Response
	{
		list(
			'email' => $email,
			'password' => $plainPassword,
			'agreeTermsAndDataPrivacy' => $agreeToTermsAndDataPrivacy,
			'newsletter' => $receivesNewsletter
		) = json_decode($request->getContent(), true);

		$user = (new User())
			->setEmail($email)
			->setReceivesNewsletter($receivesNewsletter);

		$user = $this->registerAndLoginUser(
			$user,
			$plainPassword,
			$passwordEncoder,
			$tokenGenerator,
			$mailer
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

	private function registerAndLoginUser(
		User $user,
		string $plainPassword,
		UserPasswordEncoderInterface $passwordEncoder,
		TokenGeneratorInterface $tokenGenerator,
		MailerInterface $mailer
	)
	{
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

		return $user;
	}
}
