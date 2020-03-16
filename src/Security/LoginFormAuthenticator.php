<?php

namespace App\Security;

use App\Entity\User;
use DateInterval;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Guard\Authenticator\AbstractFormLoginAuthenticator;
use Symfony\Component\Security\Guard\PasswordAuthenticatedInterface;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class LoginFormAuthenticator extends AbstractFormLoginAuthenticator implements PasswordAuthenticatedInterface
{
    use TargetPathTrait;

    private $entityManager;
    private $urlGenerator;
    private $csrfTokenManager;
    private $passwordEncoder;
    private $failedLoginTimePenaltyInMinutes;
    private $failedLoginAttemptsUntilTimePenalty;
    private $failedLoginAttemptsUntilBan;

    public function __construct(
        EntityManagerInterface $entityManager,
        UrlGeneratorInterface $urlGenerator,
        CsrfTokenManagerInterface $csrfTokenManager,
        UserPasswordEncoderInterface $passwordEncoder,
        int $failedLoginTimePenaltyInMinutes,
        int $failedLoginAttemptsUntilTimePenalty,
        int $failedLoginAttemptsUntilBan
    )
    {
        $this->entityManager = $entityManager;
        $this->urlGenerator = $urlGenerator;
        $this->csrfTokenManager = $csrfTokenManager;
        $this->passwordEncoder = $passwordEncoder;
        $this->failedLoginTimePenaltyInMinutes = $failedLoginTimePenaltyInMinutes;
        $this->failedLoginAttemptsUntilTimePenalty = $failedLoginAttemptsUntilTimePenalty;
        $this->failedLoginAttemptsUntilBan = $failedLoginAttemptsUntilBan;
    }

    public function supports(Request $request)
    {
        return 'login' === $request->attributes->get('_route')
            && $request->isMethod('POST');
    }

    public function getCredentials(Request $request)
    {
        $credentials = [
            'email' => $request->request->get('email'),
            'password' => $request->request->get('password'),
            'csrf_token' => $request->request->get('_csrf_token'),
        ];
        $request->getSession()->set(
            Security::LAST_USERNAME,
            $credentials['email']
        );

        return $credentials;
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        $token = new CsrfToken('authenticate', $credentials['csrf_token']);
        if (!$this->csrfTokenManager->isTokenValid($token)) {
            throw new InvalidCsrfTokenException();
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $credentials['email']]);

        if (!$user) {
            // fail authentication with a custom error
            throw new CustomUserMessageAuthenticationException('Email could not be found.');
        }

        return $user;
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        /** @var User $user */
        if ($this->isBanned($user)) {
            throw new CustomUserMessageAuthenticationException('Too many wrong attempts, we disabled your account! Please contact us to enable your account again.');
        }

        if ($this->isPenaltyTimeRunning($user)) {
            throw new CustomUserMessageAuthenticationException(sprintf('Too many wrong attempts, try again in %d minutes!', $this->failedLoginTimePenaltyInMinutes));
        }

        $areCredentialsValid = $this->passwordEncoder->isPasswordValid($user, $credentials['password']);

        if ($areCredentialsValid) {
            if (0 < $user->getFailedLoginsCount()) {
                $user->setFailedLoginsCount(0);
            }
            $user->setLastLoginAt(new DateTime());
        } else {
            $user->setFailedLoginsCount($user->getFailedLoginsCount() + 1)
                ->setLastFailedLoginAt(new DateTime());
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $areCredentialsValid;
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function getPassword($credentials): ?string
    {
        return $credentials['password'];
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        if ($targetPath = $this->getTargetPath($request->getSession(), $providerKey)) {
            return new RedirectResponse($targetPath);
        }

//        /** @var User $user */
//        $user = $token->getUser();
//
//        if ($user->isAdmin()) {
//            return new RedirectResponse($this->urlGenerator->generate('easyadmin'));
//        }

        return new RedirectResponse($this->urlGenerator->generate('profile'));
    }

    protected function getLoginUrl()
    {
        return $this->urlGenerator->generate('login');
    }

    private function isBanned(User $user): bool
    {
        return $this->failedLoginAttemptsUntilBan <= $user->getFailedLoginsCount();
    }

    /**
     * @param User $user
     * @return bool
     * @throws Exception
     */
    private function isPenaltyTimeRunning(User $user)
    {
        if (!($this->failedLoginAttemptsUntilTimePenalty <= $user->getFailedLoginsCount())) {
            return false;
        }

        $now = new DateTime();

        $penaltyTime = new DateInterval(sprintf('PT%dM', $this->failedLoginTimePenaltyInMinutes));
        $penaltyTime->invert = 1;

        return $now->add($penaltyTime) < $user->getLastFailedLoginAt();
    }
}
