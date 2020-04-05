<?php

namespace App\Tests\Controller\Account;

use App\Tests\BaseTest;

class DebugControllerTest extends BaseTest
{
    public function testConfirmAuthenticatedUser()
    {
        $client = static::createClient();
        $client->request('GET', '/en/debug');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Your deletion ID: xxxxx');
    }
}
