<?php

namespace App\Tests;

use App\Entity\Download;
use App\Entity\File;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class BaseTest extends WebTestCase
{
    private $unauthenticatedClient;

    protected function setUp()
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    public function assertResponseRedirectsAndFollowRedirect(string $url, KernelBrowser $client)
    {
        $this->assertResponseRedirects($url);
        $client->followRedirect();
    }

    public function request(string $method, string $url, array $auth = [])
    {
        $client = $this->getUnauthenticatedClient();
        $client->request($method, $url, [], [], $auth);
        return $client;
    }

    protected function getUnauthenticatedClient(): KernelBrowser
    {
        if (null !== $this->unauthenticatedClient) {
            return $this->unauthenticatedClient;
        }
        return $this->unauthenticatedClient = static::createClient();
    }

    protected function findUser(string $email): User
    {
        return $this->findOneBy(User::class, ['email' => $email]);
    }

    protected function findOneBy(string $entityClass, array $options)
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

    protected function persistFile(string $filename): File
    {
        $download = (new Download())->setTitle('Dummy')->setFilename('Dummy')->setStatus('published');
        $file = (new File())->setName($filename)->setDownload($download);

        $entityManager = static::$container
            ->get('doctrine')
            ->getManager();

        $entityManager->persist($download);
        $entityManager->persist($file);
        $entityManager->flush();

        // doing this is recommended to avoid memory leaks
        $entityManager->close();
        $entityManager = null;

        return $file;
    }
}
