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

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DeleteAccountType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email')
            ->add('roles')
            ->add('password')
            ->add('confirmationToken')
            ->add('avatar')
            ->add('firstName')
            ->add('lastName')
            ->add('country')
            ->add('receivesNewsletter')
            ->add('subscribedToNewsletterAt')
            ->add('unsubscribedFromNewsletterAt')
            ->add('lastLoginAt')
            ->add('lastFailedLoginAt')
            ->add('failedLoginsCount')
            ->add('deletionId')
            ->add('passwordResetToken')
            ->add('passwordResetTokenExpiresAt')
            ->add('deletedAt')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
