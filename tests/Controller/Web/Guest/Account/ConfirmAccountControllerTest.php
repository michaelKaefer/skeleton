<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

use App\Tests\BaseTest;
use App\Tests\DummyBuilder;

class ConfirmAccountControllerTest extends BaseTest
{
    protected function setUp()
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    public function testConfirmUnauthenticatedUser()
    {
        $client = $this->request('GET', '/en/confirm/1234567890');

        $this->assertEmailCount(2);
        $welcomeEmail = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($welcomeEmail, 'To', 'John Doe <unconfirmed@example.com>');
        $this->assertEmailHtmlBodyContains($welcomeEmail, 'Your account is now active.');
        $infoEmail = $this->getMailerMessage(1);
        $this->assertEmailHeaderSame($infoEmail, 'To', 'Skeleton GmbH <office@skeleton.com>');
        $this->assertEmailHeaderSame($infoEmail, 'Subject', 'New user registration');

        $this->assertResponseRedirectsAndFollowRedirect('/en/profile', $client);

        $this->assertResponseRedirects('/en/login');
    }

    public function testConfirmAuthenticatedUser()
    {
        $client = $this->request('GET', '/en/confirm/1234567890', [
            'PHP_AUTH_USER' => 'unconfirmed@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);

        $this->assertResponseRedirectsAndFollowRedirect('/en/profile', $client);

        $this->assertSelectorTextContains('label[for="profile_form_lastName"]', 'Last name');
        $this->assertNull($this->findUser('unconfirmed@example.com')->getConfirmationToken());
    }

    public function testRedirectConfirmedAuthenticatedUserToRequestedDownload()
    {
        $this->getUnauthenticatedClient(); // Boots kernel

        $this->builder->upload('CellDesignerIntroduction', 'published');
        $file = $this->persistFile('CellDesignerIntroduction.pdf');

        $client = $this->request('GET', "/en/download/published/{$file->getId()}");

        $this->assertResponseRedirectsAndFollowRedirect('/en/login', $client);
        $client->clickLink('Go to registration'); // /en/register
        $client->submitForm('Register', [
            'registration_form[email]' => 'john.doe@example.com',
            'registration_form[plainPassword]' => '123123',
            'registration_form[gender]' => '1',
            'registration_form[firstName]' => 'John',
            'registration_form[lastName]' => 'Doe',
            'registration_form[affiliation]' => 'Acme Inc.',
            'registration_form[jobTitle]' => 'Tester',
            'registration_form[country]' => 'AT',
            'registration_form[agreeToTermsAndDataPrivacy]' => '1',
        ]);
        $urlOfDownload = "{$client->getRequest()->getSchemeAndHttpHost()}/en/download/published/{$file->getId()}";
        $this->assertResponseRedirectsAndFollowRedirect($urlOfDownload, $client);
        $this->assertResponseRedirectsAndFollowRedirect('/en/profile', $client);

        $this->assertSelectorTextContains('.alert', sprintf('Please confirm your account before you can download "%s".', $file->getName()));

        $client->request('GET', "/en/confirm/{$this->findUser('john.doe@example.com')->getConfirmationToken()}");

        ob_start(); // We don't want the output of the streamed response in the terminal
        $this->assertResponseRedirectsAndFollowRedirect("/en/download/published/{$file->getId()}", $client);
        ob_end_clean(); // We don't want the output of the streamed response in the terminal

        $this->assertResponseIsSuccessful();
    }
}
