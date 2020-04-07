<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DeleteAccountFormType extends AbstractType
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
