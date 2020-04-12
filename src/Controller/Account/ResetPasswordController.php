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
use App\Form\ResetPasswordType;
use App\Repository\UserRepository;
use Exception;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class ResetPasswordController extends BaseController
{
    /**
     * @Route("/reset-password/{passwordResetToken}", name="reset_password")
     *
     * @throws Exception
     *
     * @return RedirectResponse|Response
     */
    public function resetPassword(
        Request $request,
        string $passwordResetToken,
        UserRepository $users,
        UserPasswordEncoderInterface $passwordEncoder
    ) {
        $form = $this->createForm(ResetPasswordType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user = $users->findOneBy(['passwordResetToken' => $passwordResetToken]);

            if (!$user || !$user->getPasswordResetTokenExpiresAt() || new \DateTime() > $user->getPasswordResetTokenExpiresAt()) {
                throw new NotFoundHttpException('Your reset token is invalid. Please request a new one or contact us.');
            }

            $plainPassword = $form->get('plainPassword')->getData();

            $user->setPassword($passwordEncoder->encodePassword($user, $plainPassword));
            $user->setPasswordResetToken(null);
            $user->setPasswordResetTokenExpiresAt(null);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            $this->addFlash('success', 'Your password was changed successfully, you can login with it.');

            return $this->redirectToRoute('login');
        }

        return $this->render('pages/account/reset-password.html.twig', [
            'form' => $form->createView(),
            'resetPasswordToken' => $passwordResetToken,
        ]);
    }
}
