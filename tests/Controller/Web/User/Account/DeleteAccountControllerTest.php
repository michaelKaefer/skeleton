<?php

namespace App\Tests\Controller\Web\OpenToPublic\User;

use App\Tests\BaseTest;

class DeleteAccountControllerTest extends BaseTest
{
    public function testUserCanDeleteHimself()
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
        $userBeforeDeletion = $this->findUser('john.doe@example.com');
        $this->request('GET', sprintf('/en/user/delete/%d', $userBeforeDeletion->getId()), [
            'PHP_AUTH_USER' => 'john.doe@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);

        $this->assertResponseRedirects('/en/logout');

        /* The rest is not testable because of the authentication which is used in automatic tests. It would like:
        $userAfterDeletion = $this->findOneBy(User::class, ['id' => $userBeforeDeletion->getId()]);
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains(
            'body',
            sprintf('We deleted your account. Your deletion ID is "%s".', $userAfterDeletion->getDeletionId())
        );
        */
    }
    public function testUserCannotBeDeletedByOtherUser()
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
        $userBeforeDeletion = $this->findUser('john.doe@example.com');
        $this->request('GET', sprintf('/en/user/delete/%d', $userBeforeDeletion->getId()), [
            'PHP_AUTH_USER' => 'confirmed@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);

        $this->assertResponseRedirectsAndFollowRedirect('/en/profile', $client);

        $this->assertSelectorTextContains('body', 'You are not allowed to delete users, we redirected you here.');
    }
}
