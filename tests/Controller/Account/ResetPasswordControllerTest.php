<?php

namespace App\Tests\Controller\Account;

use App\Tests\BaseTest;

class ResetPasswordControllerTest extends BaseTest
{
	/**
	 * @dataProvider getUsersWhoForgotPasswordAndReceivedTheResetPasswordEmail
	 */
	public function testGuestCanSeeForm(string $email, string $passwordResetToken)
	{
		$client = static::createClient();
		$client->request('GET', sprintf('/en/reset-password/%s', $passwordResetToken));

		$this->assertResponseIsSuccessful();
		$this->assertSelectorTextContains('body', 'Reset password');
	}

	/**
	 * @dataProvider getUsersWhoForgotPasswordAndReceivedTheResetPasswordEmail
	 */
	public function testGuestCanSubmitForm(string $email, string $passwordResetToken)
	{
		$client = static::createClient();
		$client->request('GET', sprintf('/en/reset-password/%s', $passwordResetToken));

		$client->submitForm('Save password', [
			'reset_password_form[plainPassword]' => '111111',
		]);

		$this->assertResponseRedirects('/en/login');
	}

	public function getUsersWhoForgotPasswordAndReceivedTheResetPasswordEmail()
	{
		yield [ 'confirmed@example.com', '000000000' ];
	}

	/**
	 * @dataProvider getUsersWithInvalidToken
	 */
	public function testInvalidToken(string $email, string $passwordResetToken)
	{
		$client = static::createClient();
		$client->request('GET', sprintf('/en/reset-password/%s', $passwordResetToken));

		$client->submitForm('Save password', [
			'reset_password_form[plainPassword]' => '654321',
		]);

		$this->assertResponseStatusCodeSame(404);
		$this->assertSelectorTextContains('body', 'Your reset token is invalid. Please request a new one or contact us.');
	}

	public function getUsersWithInvalidToken()
	{
		yield ['confirmed@example.com', 'xxx']; // Invalid token
		yield ['admin@example.com', '111111111']; // No password reset token expires at
		yield ['confirmed.with_expired_password_reset_token@example.com', '222222222']; // A password reset token expires at which lies in the past
	}
}
