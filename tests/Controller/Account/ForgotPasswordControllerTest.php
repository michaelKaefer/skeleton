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

class ForgotPasswordControllerTest extends BaseTest
{
    public function testGuestCanSeeForm()
    {
        $client = static::createClient();
        $client->request('GET', '/en/forgot-password');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Forgot password');
    }

    /**
     * @dataProvider getValidEmail
     */
    public function testSubmitWithValidEmailOrInvalidEmailAreBothSuccessfull(string $email)
    {
        $client = static::createClient();
        $client->request('GET', '/en/forgot-password');

        $client->submitForm('Request password reset email', [
            'forgot_password[email]' => $email,
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Reset password link sent');
    }

    public function getValidEmail()
    {
        yield ['admin@example.com'];
        yield ['not-existing-email@example.com'];
    }
}
