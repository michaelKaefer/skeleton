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

class RedirectToPreferredLocaleSubscriberTest extends BaseTest
{
	public function testRedirectToDefaultLocale()
	{
		$client = static::createClient();
		$client->request('GET', '/', [], [], [
			'HTTP_ACCEPT_LANGUAGE' => '',
		]);

		$this->assertResponseRedirects('/en/');
	}

	public function testRedirectToDefaultLocaleWithoutTrailingSlash()
	{
		$client = static::createClient();
		$client->request('GET', '', [], [], [
			'HTTP_ACCEPT_LANGUAGE' => '',
		]);

		$this->assertResponseRedirects('/en/');
	}

	public function testRedirectToDefaultLocaleWithUnsupportedPreferredLocale()
	{
		$client = static::createClient();
		$client->request('GET', '/', [], [], [
			'HTTP_ACCEPT_LANGUAGE' => 'zu',
		]);

		$this->assertResponseRedirects('/en/');
	}

	public function testRedirectToPreferredLocale()
	{
		$client = static::createClient();
		$client->request('GET', '/', [], [], [
			'HTTP_ACCEPT_LANGUAGE' => 'de',
		]);

		$this->assertResponseRedirects('/de/');
	}
}
