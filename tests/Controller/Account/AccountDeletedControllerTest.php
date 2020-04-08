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
