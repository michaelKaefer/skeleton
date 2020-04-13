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

class ProfileControllerTest extends BaseTest
{
    /**
     * @dataProvider getUsersAndAdmins
     */
    public function testCanSeeProfile(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/profile');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Profile');
    }

    /**
     * @dataProvider getUsersAndAdmins
     */
    public function testChangeEmail(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[email]' => $email.'foo',
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', $email.'foo');
    }

    public function getUsersAndAdmins()
    {
        yield ['confirmed@example.com', '123123'];
        yield ['admin@example.com', '123123'];
    }
}
