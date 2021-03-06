<?php

declare(strict_types=1);

/*
 * This file is part of Skeleton.
 *
 * (c) Michael Käfer <michael.kaefer1@gmx.at>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller\Account;

use ApiPlatform\Core\Api\IriConverterInterface;
use App\Controller\BaseController;
use App\Entity\User;
use Exception;
use Symfony\Component\Routing\Annotation\Route;

class ApiLoginController extends BaseController
{
    /**
     * @Route("/api-login", name="api_login", methods={"POST"})
     * @throws Exception
     */
    public function apiLogin(IriConverterInterface $iriConverter)
    {
        // On invalid requests the following code is reached without Symfony having tried
        // to login the user before
        if (!$this->isGranted('IS_AUTHENTICATED_FULLY')) {
            return $this->json([
                'error' => 'Invalid request. The Content-Type header must be set to application/json and the body must look like {"email":"john.doe@example.com", "password":"123123"}.',
            ], 400);
        }

        /*return new Response($iriConverter->getIriFromItem($this->getUser()), 204, [
            'Access-Control-Expose-Headers' => 'Location', // Not working, why?
            'Location' => $iriConverter->getIriFromItem($this->getUser()),
            'Access-Control-Allow-Origin' => '*', // Not working, why?
        ]);*/

        $user = $this->getUser();

        if (!($user instanceof User)) {
            throw new Exception(sprintf('Expected an instance of "%s".', User::class));
        }

        return $this->json([
            'Location' => $iriConverter->getIriFromItem($user),
        ]);
    }
}
