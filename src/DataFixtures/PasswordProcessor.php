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

namespace App\DataFixtures;

use App\Entity\User;
use Fidry\AliceDataFixtures\ProcessorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

final class PasswordProcessor implements ProcessorInterface
{
    private $encoder;

    public function __construct(UserPasswordEncoderInterface $encoder)
    {
        $this->encoder = $encoder;
    }

    /**
     * {@inheritdoc}
     */
    public function preProcess(string $id, $object): void
    {
        if (false === $object instanceof User) {
            return;
        }

        $object->setPassword($this->encoder->encodePassword($object, $object->getPassword()));
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess(string $fixtureId, $object): void
    {
        // do nothing
    }
}
