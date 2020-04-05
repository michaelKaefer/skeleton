<?php

namespace App\Security;

use ApiPlatform\Core\Api\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
	private $generator;

	public function __construct(UrlGeneratorInterface $generator)
	{
		$this->generator = $generator;
	}

	public function handle(Request $request, AccessDeniedException $accessDeniedException)
	{
		if (in_array($request->headers->get('content-type'), ['application/json'])) {
			return new JsonResponse([
				'details' => 'Access denied.'
			], 403);
		}
		return new RedirectResponse($this->generator->generate('login'));
	}
}
