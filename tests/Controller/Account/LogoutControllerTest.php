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

class LogoutControllerTest extends BaseTest
{
    public function testLogout()
    {
        $client = static::createClient();
        $client->request('GET', '/en/login');

        $client->submitForm('Login', [
            'email' => 'confirmed@example.com',
            'password' => '123123',
        ]);

        $this->assertResponseRedirects('/en/profile');

        $client->request('GET', '/en/logout');

        $this->assertResponseRedirects('/en/login');
    }
}
