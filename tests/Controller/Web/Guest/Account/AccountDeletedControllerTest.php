<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

use App\Tests\BaseTest;

class AccountDeletedControllerTest extends BaseTest
{
    public function testConfirmAuthenticatedUser()
    {
        $client = static::createClient();
        $client->request('GET', '/en/account-deleted/xxxxx');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Your deletion ID: xxxxx');
    }
}
