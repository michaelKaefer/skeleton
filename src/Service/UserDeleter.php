<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class UserDeleter
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function delete(User $user): User
    {
        $unixTime = (new \DateTime())->setTimestamp(0);
        $deletionId = uniqid() . $user->getId(); // Must be unique

        $user
            ->setEmail($deletionId) // the email must be unique, so we use deletion ID
            ->setRoles([])
            ->setPassword('')
            ->setCreatedAt($unixTime)
            ->setUpdatedAt($unixTime)
            ->setDeletionId($deletionId);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }
}
