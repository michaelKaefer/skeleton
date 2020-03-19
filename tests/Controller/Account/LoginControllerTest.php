<?php

namespace App\Tests\Controller\Account;

use App\Tests\BaseTest;

class LoginControllerTest extends BaseTest
{
    public function testGuestCanSeeLoginForm()
    {
        $client = static::createClient();
        $client->request('GET', '/en/login');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Login');
    }

    /**
     * @dataProvider getInvalidCredentials
     */
    public function testLoginFails(string $email, string $password)
    {
        $client = static::createClient();
        $client->request('GET', '/en/login');

        $client->submitForm('Login', [
            'email' => $email,
            'password' => $password,
        ]);

        $this->assertResponseRedirects('/en/login');
    }

    public function getInvalidCredentials()
    {
        yield ['admin@example.com', 'wrong-password'];
        yield ['not-existing-email@example.com', '123123'];
    }

    /**
     * @dataProvider getValidCredentials
     */
    public function testLoginSucceeds(string $email, string $password, string $expectedUrl)
    {
        $client = static::createClient();
        $client->request('GET', '/en/login');

        $client->submitForm('Login', [
            'email' => $email,
            'password' => $password,
        ]);

        $this->assertResponseRedirects($expectedUrl);
    }

    public function getValidCredentials()
    {
        yield ['unconfirmed@example.com', '123123', '/en/profile'];
        yield ['confirmed@example.com', '123123', '/en/profile'];
        yield ['admin@example.com', '123123', '/en/profile'];
    }
}
