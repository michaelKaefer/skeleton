<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Fidry\AliceDataFixtures\ProcessorInterface;

final class PasswordProcessor implements ProcessorInterface
{
    private $encoder;

    public function __construct(UserPasswordEncoderInterface $encoder)
    {
        $this->encoder = $encoder;
    }

    /**
     * @inheritdoc
     */
    public function preProcess(string $id, $object): void
    {
        if (false === $object instanceof User) {
            return;
        }

        $object->setPassword($this->encoder->encodePassword($object, $object->getPassword()));
    }

    /**
     * @inheritdoc
     */
    public function postProcess(string $fixtureId, $object): void
    {
        // do nothing
    }
}
