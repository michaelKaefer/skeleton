<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

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

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertResponseRedirects('/en/login');
    }
}
