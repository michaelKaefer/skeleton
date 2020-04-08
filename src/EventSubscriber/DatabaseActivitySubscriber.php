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

use App\Entity\User;
use App\Service\UserDeleter;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class DatabaseActivitySubscriber implements EventSubscriber
{
    private $userDeleter;

    public function __construct(UserDeleter $userDeleter)
    {
        $this->userDeleter = $userDeleter;
    }

    public function preRemove(LifecycleEventArgs $args)
    {
        $object = $args->getObject();

        /** @var User $object */
        if ($object instanceof User) {
            $this->userDeleter->delete($object);
        }
    }

    public function getSubscribedEvents()
    {
        // this method can only return the event names; you cannot define a
        // custom method name to execute when each event triggers
        return [
            Events::preRemove,
        ];
    }
}
