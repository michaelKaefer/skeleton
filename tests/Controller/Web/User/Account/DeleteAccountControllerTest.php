<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

use App\Tests\BaseTest;

class DeleteAccountControllerTest extends BaseTest
{
    /**
     * @dataProvider getUsers
     */
    public function testUserCanDeleteHimself(string $email, string $password)
    {
        $client = static::createClient();
        $client->request('GET', '/en/profile', [], [], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $userId = $this->findUserByEmail($email)->getId();
        $client->submitForm('Delete my account');

        $this->assertResponseRedirects('/en/logout');
        $client->followRedirect();

        $user = $this->findUserById($userId);
        $this->assertResponseRedirects(sprintf('/en/account-deleted/%s', $user->getDeletionId()));
        $client->followRedirect();

        $this->assertSelectorTextContains('body', sprintf('Your deletion ID: %s', $user->getDeletionId()));
    }

    /**
     * @dataProvider getUsers
     */
    public function testUserCannotBeDeletedWithoutCsrfToken(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'admin@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $userId = $this->findUserByEmail($email)->getId();
        $client->request('DELETE', sprintf('/en/user/%s', $userId));

        $this->assertResponseStatusCodeSame(403);
    }

    public function getUsers()
    {
        yield ['confirmed@example.com', '123123'];
    }
}
