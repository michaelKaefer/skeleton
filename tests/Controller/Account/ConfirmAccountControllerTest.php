<?php

namespace App\Tests\Controller\Account;

use App\Tests\BaseTest;

class ConfirmAccountControllerTest extends BaseTest
{
    /**
     * @dataProvider getUnconfirmedUsers
     */
    public function testConfirmAuthenticatedUser(
        string $confirmationToken,
        string $firstName,
        string $lastName,
        string $email,
        string $password
    )
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertSelectorTextContains('body', sprintf('%s %s', $firstName, $lastName));
        $this->assertNull($this->findUserByEmail('unconfirmed@example.com')->getConfirmationToken());
    }

    /**
     * @dataProvider getUnconfirmedUsers
     */
    public function testConfirmUnauthenticatedUserRedirectsToLogin(
        string $confirmationToken,
        string $firstName,
        string $lastName,
        string $email,
        string $password
    )
    {
        $client = static::createClient();
        $client->request('GET', sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertEmailCount(2);

        $welcomeEmail = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($welcomeEmail, 'To', sprintf('%s %s <%s>', $firstName, $lastName, $email));
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
        yield ['1234567890', 'John', 'Doe', 'unconfirmed@example.com', '123123'];
    }
}
