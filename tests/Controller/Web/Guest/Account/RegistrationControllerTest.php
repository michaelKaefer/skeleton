<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

use App\Tests\BaseTest;

class RegistrationController extends BaseTest
{
    public function testRegisterForm()
    {
        $this->request('GET', '/en/register');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Register');
    }

    public function testRegisterSubmit()
    {
        $client = $this->request('GET', '/en/register');
        $client->submitForm('Register', [
            'registration_form[email]' => 'john.doe@example.com',
            'registration_form[plainPassword]' => '123123',
            'registration_form[firstName]' => 'John',
            'registration_form[lastName]' => 'Doe',
            'registration_form[country]' => 'AT',
            'registration_form[agreeToTermsAndDataPrivacy]' => '1',
        ]);

        $this->assertEmailCount(1);
        $email = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($email, 'To', 'John Doe <john.doe@example.com>');
        $this->assertEmailHtmlBodyContains($email, 'You recently registered for MyGTS at Global TCAD Solutions. Please confirm and activate your account');
        $confirmationToken = $this->findUser('john.doe@example.com')->getConfirmationToken();
        $this->assertEmailHtmlBodyContains($email, "/en/confirm/$confirmationToken");

        $this->assertResponseRedirectsAndFollowRedirect('/en/profile', $client);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'John Doe');
        $this->assertSelectorTextContains('.alert-warning', 'We sent you an email, please confirm your account!');
    }
}
