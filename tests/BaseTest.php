<?php

/*
 * This file is part of Skeleton.
 *
 * (c) Michael Käfer <michael.kaefer1@gmx.at>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class BaseTest extends WebTestCase
{
    protected function setUp()
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    protected function findUserById(string $id): User
    {
        return $this->findOneBy(User::class, ['id' => $id]);
    }

    protected function findUserByEmail(string $email): User
    {
        return $this->findOneBy(User::class, ['email' => $email]);
    }

    private function findOneBy(string $entityClass, array $options)
    {
        $entityManager = static::$container
            ->get('doctrine')
            ->getManager();
        /** @var User $entity */
        $entity = $entityManager
            ->getRepository($entityClass)
            ->findOneBy($options);

        // doing this is recommended to avoid memory leaks
        $entityManager->close();
        $entityManager = null;

        return $entity;
    }
}
