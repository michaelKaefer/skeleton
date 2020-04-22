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
use App\Repository\UserRepository;
use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
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
                'address_card' => $this->render('partials/_address_card.html.twig', [
                    'address' => $address,
                ]),
            ]);
        }

        return $this->json($this->render('form/address.html.twig', [
            'form' => $form->createView(),
        ]));
    }

    /**
     * @Route("/{id}", name="address_delete", methods={"DELETE"})
     * @throws Exception
     */
    public function delete(Request $request, Address $address): Response
    {
        if ($this->isCsrfTokenValid('delete'.$address->getId(), $request->request->get('_token'))) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->remove($address);
            $entityManager->flush();

            $this->addFlash('success', 'deleted_successfully');
        }

        if (null === $referer = $request->request->get('_referer')) {
            throw new Exception('No referer for redirecting found.');
        }

        return $this->redirect($referer);
    }
}
