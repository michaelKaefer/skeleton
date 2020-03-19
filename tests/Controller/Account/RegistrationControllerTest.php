<?php

namespace App\Tests\Controller\Account;

use App\Tests\BaseTest;

class RegistrationController extends BaseTest
{
    public function testRegisterForm()
    {
        $client = static::createClient();
        $client->request('GET', '/en/register');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Register');
    }

    /**
     * @dataProvider getValidRegistrations
     */
    public function testRegistration(
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        string $country,
        string $agreeToTermsAndDataPrivacy
    )
    {
        $client = static::createClient();
        $client->request('GET', '/en/register');
        $client->submitForm('Register', [
            'registration_form[email]' => $email,
            'registration_form[plainPassword]' => $password,
            'registration_form[firstName]' => $firstName,
            'registration_form[lastName]' => $lastName,
            'registration_form[country]' => $country,
            'registration_form[agreeToTermsAndDataPrivacy]' => $agreeToTermsAndDataPrivacy,
        ]);

        $confirmationToken = $this->findUserByEmail($email)->getConfirmationToken();

        $this->assertEmailCount(1);

        $confirmationEmail = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($confirmationEmail, 'To', sprintf('%s %s <%s>', $firstName, $lastName, $email));
        $this->assertEmailHeaderSame($confirmationEmail, 'Subject', 'Please confirm your account');
        $this->assertEmailHtmlBodyContains($confirmationEmail, sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', sprintf('%s %s', $firstName, $lastName));
        $this->assertSelectorTextContains('.alert-warning', 'We sent you an email, please confirm your account!');
    }

    public function getValidRegistrations()
    {
        yield ['john.doe@example.com', '123123', 'John', 'Doe', 'AT', '1'];
    }
}
