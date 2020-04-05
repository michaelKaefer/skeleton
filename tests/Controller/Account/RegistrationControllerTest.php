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
            'registration_form[agreeToTermsAndDataPrivacy]' => $agreeToTermsAndDataPrivacy,
        ]);

        $confirmationToken = $this->findUserByEmail($email)->getConfirmationToken();

        $this->assertEmailCount(1);

        $confirmationEmail = $this->getMailerMessage(0);
        $this->assertEmailHeaderSame($confirmationEmail, 'To', sprintf('"%s" <%s>', $email, $email));
        $this->assertEmailHeaderSame($confirmationEmail, 'Subject', 'Please confirm your account');
        $this->assertEmailHtmlBodyContains($confirmationEmail, sprintf('/en/confirm/%s', $confirmationToken));

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', $email);
        $this->assertSelectorTextContains('.alert-warning', 'We sent you an email, please confirm your account!');
    }

    public function getValidRegistrations()
    {
        yield ['john.doe@example.com', '123123', 'John', 'Doe', 'AT', '1'];
    }

	/**
	 * The "api_register" route must be accessible for the frontend application.
	 */
	public function testCors()
	{
		$frontendAppUrl = 'https://my-frontend-app.com'; // This is set in .env.test

		$client = static::createClient();
		$client->request('OPTIONS', '/en/api-register', [], [], [
			'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
			'HTTP_ORIGIN' => $frontendAppUrl,
		]);

		$this->assertResponseIsSuccessful();
		$this->assertResponseHasHeader('access-control-allow-origin');
		$this->assertResponseHeaderSame('access-control-allow-origin', $frontendAppUrl);
		$this->assertResponseHasHeader('access-control-allow-methods');
		$this->assertResponseHeaderSame('access-control-allow-methods', 'GET, OPTIONS, POST, PUT, PATCH, DELETE');
		$this->assertResponseHasHeader('access-control-allow-headers');
		$this->assertResponseHeaderSame('access-control-allow-headers', 'content-type, cookie, origin, x-requested-with');
		$this->assertResponseHasHeader('access-control-allow-credentials');
		$this->assertResponseHeaderSame('access-control-allow-credentials', 'true');
	}
}
