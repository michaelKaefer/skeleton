<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\EasyAdminController;

class UserController extends EasyAdminController
{
    private $encoder;

    public function __construct(UserPasswordEncoderInterface $encoder)
    {
        $this->encoder = $encoder;
    }

    protected function persistUserEntity($user)
    {
        /** @var User $user */
        $encodedPassword = $this->encoder->encodePassword($user, $user->getPassword());
        $user->setPassword($encodedPassword)
            ->setLastLoginAt(new \DateTime());

        parent::persistEntity($user);
    }

    protected function updateUserEntity($user)
    {
        if ('' !== $user->getPassword()) {
            /** @var User $user */
            $encodedPassword = $this->encoder->encodePassword($user, $user->getPassword());
            $user->setPassword($encodedPassword);
        }

        parent::updateEntity($user);
    }
}
