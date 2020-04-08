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

class ConfirmAccountControllerTest extends BaseTest
{
    /**
     * @dataProvider getUnconfirmedUsers
     */
    public function testConfirmAuthenticatedUser(
        string $confirmationToken,
        string $email,
        string $password
    ) {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertSelectorTextContains('body', sprintf('%s', $email));
        $this->assertNull($this->findUserByEmail('unconfirmed@example.com')->getConfirmationToken());
    }

    /**
     * @dataProvider getUnconfirmedUsers
     */
    public function testConfirmUnauthenticatedUserRedirectsToLogin(
        string $confirmationToken,
        string $email,
        string $password
    ) {
        $client = static::createClient();
        $client->request('GET', sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertEmailCount(2);

        $welcomeEmail = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($welcomeEmail, 'To', sprintf('"%s" <%s>', $email, $email));
        $this->assertEmailHtmlBodyContains($welcomeEmail, 'Your account is now active.');

        $infoEmail = $this->getMailerMessage(1);
        $this->assertEmailHeaderSame($infoEmail, 'To', 'Skeleton GmbH <office@skeleton.com>');
        $this->assertEmailHeaderSame($infoEmail, 'Subject', 'New user registration');

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertResponseRedirects('/en/login');
    }

    public function getUnconfirmedUsers()
    {
        yield ['1234567890', 'unconfirmed@example.com', '123123'];
    }

    /**
     * @dataProvider getInvalidUsers
     */
    public function testInvalidConfirmationTokenFails(
        string $confirmationToken
    ) {
        $client = static::createClient();
        $client->request('GET', sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertResponseStatusCodeSame(404);
        $this->assertSelectorTextContains('body', 'Your confirmation token is invalid. Please try again or contact us.');
    }

    public function getInvalidUsers()
    {
        yield ['xxx'];
    }
}
