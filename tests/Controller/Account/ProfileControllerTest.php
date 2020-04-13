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

class ProfileControllerTest extends BaseTest
{
    /**
     * @dataProvider getUsersAndAdmins
     */
    public function testCanSeeProfile(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/profile');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Profile');
    }

    /**
     * @dataProvider getUsersAndAdmins
     */
    public function testChangeEmail(string $email, string $password)
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => $email,
            'PHP_AUTH_PW' => $password,
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[email]' => $email.'foo',
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Profile'); // Todo: make that line better :)
    }

    public function getUsersAndAdmins()
    {
        yield ['confirmed@example.com', '123123'];
        yield ['admin@example.com', '123123'];
    }

    public function testUserWhoIsNotPersonNorOrganizationIsPersonByDefaultWithEmptyPersonFields()
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'not.person.nor.organization@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $client->request('GET', '/en/profile');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'First name');
        $this->assertSelectorTextContains('body', 'Last name');
    }

    public function testUserWhoIsNotPersonNorOrganizationCannotSubmitEmailFieldIfPersonFieldsAreEmpty()
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'not.person.nor.organization@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[email]' => 'foo@example.com',
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'This value should not be blank');
    }

    public function testUserWhoIsNotPersonNorOrganizationCanSubmitPersonFields()
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'not.person.nor.organization@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[person][firstName]' => 'John',
            'profile[person][lastName]' => 'Doe',
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Your profile was successfully updated');
    }

    public function testUserWhoIsNotPersonNorOrganizationCanSubmitInvalidPersonFields()
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'not.person.nor.organization@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[person][firstName]' => '',
            'profile[person][lastName]' => 'Doe',
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'This value should not be blank');
    }

    public function testUserWhoIsNotPersonNorOrganizationCanBecomeOrganization()
    {
        $client = static::createClient([], [
            'PHP_AUTH_USER' => 'not.person.nor.organization@example.com',
            'PHP_AUTH_PW' => '123123',
        ]);
        $client->request('GET', '/en/profile');

        $client->submitForm('Save', [
            'profile[type]' => 'ORGANIZATION',
            'profile[person][firstName]' => 'ORGANIZATION',
            'profile[person][larstName]' => 'ORGANIZATION',
        ]);

        $this->assertResponseRedirects('/en/profile');
        $client->followRedirect();

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Your profile type was successfully changed');
        $this->assertSelectorTextNotContains('body', 'First name');
        $this->assertSelectorTextNotContains('body', 'Last name');
        $this->assertSelectorTextContains('body', 'Name');
    }
}
