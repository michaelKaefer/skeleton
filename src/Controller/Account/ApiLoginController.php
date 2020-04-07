<?php

declare(strict_types=1);

namespace App\Controller\Account;

use ApiPlatform\Core\Api\IriConverterInterface;
use App\Controller\BaseController;
use Symfony\Component\Routing\Annotation\Route;

class ApiLoginController extends BaseController
{
	/**
	 * @Route("/api-login", name="api_login", methods={"POST"})
	 */
    public function apiLogin(IriConverterInterface $iriConverter)
    {
    	// On invalid requests the following code is reached without Symfony having tried
	    // to login the user before
    	if (!$this->isGranted('IS_AUTHENTICATED_FULLY')) {
    		return $this->json([
    			'error' => 'Invalid request. The Content-Type header must be set to application/json and the body must look like {"email":"john.doe@example.com", "password":"123123"}.'
		    ], 400);
	    }

	    /*return new Response($iriConverter->getIriFromItem($this->getUser()), 204, [
    		'Access-Control-Expose-Headers' => 'Location', // Not working, why?
    		'Location' => $iriConverter->getIriFromItem($this->getUser()),
		    'Access-Control-Allow-Origin' => '*', // Not working, why?
	    ]);*/

	    return $this->json([
	    	'Location' => $iriConverter->getIriFromItem($this->getUser()),
	    ]);
    }
}
