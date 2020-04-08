<?php

/*
 * This file is part of Skeleton.
 *
 * (c) Michael Käfer <michael.kaefer1@gmx.at>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
     * @dataProvider getUsers
     */
    public function testUserGetsRedirectedToProfile(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/login');

        $this->assertResponseRedirects('/en/profile');
    }

    public function getUsers()
    {
        yield ['confirmed@example.com', '123123'];
    }

    /**
     * @dataProvider getAdmins
     */
    public function testAdminGetsRedirectedToAdminArea(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/login');

        $this->assertResponseRedirects('/admin/');
    }

    public function getAdmins()
    {
        yield ['admin@example.com', '123123'];
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
