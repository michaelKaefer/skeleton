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

use App\Security\AccessDeniedHandler;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Firewall\AccessListener;

/**
 * This is a temporary workaround until https://github.com/symfony/symfony/issues/28229 is solved.
 */
class AccessDeniedSubscriber implements EventSubscriberInterface
{
    private $handler;

    public function __construct(AccessDeniedHandler $handler)
    {
        $this->handler = $handler;
    }

    public function onKernelException(ExceptionEvent $event)
    {
        $exception = $event->getThrowable();

        if ($exception instanceof AccessDeniedException && !self::isThrownByFirewall($exception)) {
            $response = $this->handler->handle($event->getRequest(), $exception);

            $event->setResponse($response);
            $event->stopPropagation();
        }
    }

    public static function getSubscribedEvents()
    {
        return [
            'kernel.exception' => ['onKernelException', 1],
        ];
    }

    /**
     * Determines, by analyzing the stack trace, if an exception has been thrown by the firewall.
     */
    private static function isThrownByFirewall(AccessDeniedException $exception): bool
    {
        foreach ($exception->getTrace() as $stackItem) {
            $class = $stackItem['class'] ?? null;
            if (AccessListener::class === $class) {
                return true;
            }
        }

        return false;
    }
}
