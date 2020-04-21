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

use App\Controller\BaseController;
use App\Entity\Address;
use App\Entity\User;
use App\Form\AddressType;
use App\Form\OrganizationType;
use App\Form\PersonType;
use App\Form\ProfileType;
use App\Repository\UserRepository;
use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AddressController extends BaseController
{
    /**
     * @Route("/address/new", name="address_new", methods={"GET","POST"})
     * @IsGranted("ROLE_USER")
     *
     * @throws Exception
     */
    public function profile(Request $request, UserRepository $users): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $address = new Address();
        $address->setUser($user);

        $form = $this->createForm(AddressType::class, $address);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($address);
            $entityManager->flush();

            if (null !== $url = $request->get('referer')) {
                return $this->redirect(urldecode($url));
            }

            $this->addFlash('success', 'saved_successfully');

            return $this->json([
                'address' => $this->render('partials/_address.html.twig', [
                    'address' => $address,
                ]),
            ]);
        }

        return $this->json($this->render('form/address.html.twig', [
            'form' => $form->createView(),
        ]));

//        /** @var User $user */
//        $user = $this->getUser();
//
//        $form = $this->createForm(ProfileType::class, $user);
//
//        // Must be saved to a variable before: $form->handleRequest($request);
//        $oldAccountType = $user->getType();
//
//        $form->handleRequest($request);
//
//        if ($form->isSubmitted() && $form->isValid()) {
//            // If the type was changed we redirect to reload the profile form (but still use the form's CSRF protection here)
//            $profile = $request->request->get('profile');
//            if (isset($profile['type']) && $oldAccountType !== $profile['type']) {
//                if (User::TYPE_PERSON === $profile['type']) {
//                    $user->setType(User::TYPE_PERSON);
//                    $user->setOrganization(null);
//                }
//                if (User::TYPE_ORGANIZATION === $profile['type']) {
//                    $user->setType(User::TYPE_ORGANIZATION);
//                    $user->setPerson(null);
//                }
//                $entityManager = $this->getDoctrine()->getManager();
//                $entityManager->persist($user);
//                $entityManager->flush();
//                $this->addFlash('success', 'Your profile type was successfully changed.');
//                return $this->redirectToRoute('profile');
//            }
//
//            // If the type was not changed we proceed as usual
//            $entityManager = $this->getDoctrine()->getManager();
//            $entityManager->persist($user);
//            $entityManager->flush();
//
//            $this->addFlash('success', 'Your profile was successfully updated.');
//        }
//
//        return $this->render('pages/account/profile.html.twig', [
//            'user' => $user,
//            'form' => $form->createView(),
//        ]);
    }

//    /**
//     * @Route("/change-type-of-profile/{type}/{csrfToken}", name="change_profile_type")
//     * @IsGranted("ROLE_USER")
//     */
//    public function changeType(string $type, string $csrfToken)
//    {
//        /** @var User $user */
//        $user = $this->getUser();
//
//        if (User::TYPE_PERSON === $type && $user->getType() !== $type) {
//            $user->setType(User::TYPE_PERSON);
//            $user->setOrganization(null);
//        }
//
//        if (User::TYPE_ORGANIZATION === $type && $user->getType() !== $type) {
//            $user->setType(User::TYPE_ORGANIZATION);
//            $user->setPerson(null);
//        }
//
//        $this->redirectToRoute('profile');
//    }
}
