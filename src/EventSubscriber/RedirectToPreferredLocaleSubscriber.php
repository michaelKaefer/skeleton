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

namespace App\EventSubscriber;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class RedirectToPreferredLocaleSubscriber implements EventSubscriberInterface
{
    private $defaultLocale;
    private $supportedLocales;
    private $urlGenerator;
    private $logger;

    public function __construct(
    	string $defaultLocale,
	    string $supportedLocales,
	    UrlGeneratorInterface $urlGenerator,
		LoggerInterface $logger
	)
    {
        $this->urlGenerator = $urlGenerator;

        $this->supportedLocales = explode('|', trim($supportedLocales));
        if (empty($this->supportedLocales)) {
            throw new \UnexpectedValueException('The list of supported locales must not be empty.');
        }

        $this->defaultLocale = $defaultLocale ?: $this->supportedLocales[0];

        if (!\in_array($this->defaultLocale, $this->supportedLocales, true)) {
            throw new \UnexpectedValueException(sprintf('The default locale ("%s") must be one of "%s".', $this->defaultLocale, $supportedLocales));
        }

        // Add the default locale at the first position of the array,
        // because Symfony\HttpFoundation\Request::getPreferredLanguage
        // returns the first element when no an appropriate language is found
        array_unshift($this->supportedLocales, $this->defaultLocale);
        $this->supportedLocales = array_unique($this->supportedLocales);

        $this->logger = $logger;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => 'onKernelRequest',
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        // Ignore sub-requests and all URLs but the homepage
        if (!$event->isMasterRequest() || '/' !== $request->getPathInfo()) {
            return;
        }

        // Ignore requests from referrers with the same HTTP host in order to prevent
        // changing language for users who possibly already selected it for this application.
	    $referer = $request->headers->get('referer');
        if ($referer && 0 === mb_stripos($referer, $request->getSchemeAndHttpHost())) {
            return;
        }

        $preferredLanguage = $request->getPreferredLanguage($this->supportedLocales);

        $this->logger->info(sprintf('Since no locale was requested redirecting to the preferred locale "%s".', $preferredLanguage));
        $response = new RedirectResponse($this->urlGenerator->generate('home', ['_locale' => $preferredLanguage]));
        $event->setResponse($response);
    }
}
