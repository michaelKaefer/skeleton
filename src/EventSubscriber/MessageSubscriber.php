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

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Mailer\Event\MessageEvent;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class MessageSubscriber implements EventSubscriberInterface
{
    private $mailFromName;
    private $mailFromAddress;

    public function __construct(string $mailFromName, string $mailFromAddress)
    {
        $this->mailFromName = $mailFromName;
        $this->mailFromAddress = $mailFromAddress;
    }

    public function onMessage(MessageEvent $event): void
    {
        /** @var Email $email */
        $email = $event->getMessage();
        $email->from(new Address($this->mailFromAddress, $this->mailFromName));
    }

    public static function getSubscribedEvents()
    {
        return [
            MessageEvent::class => 'onMessage',
        ];
    }
}
