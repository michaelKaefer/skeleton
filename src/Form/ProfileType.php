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
use App\Form\Type\CheckboxType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;

class ProfileType extends AbstractType
{
    private $factory;

    public function __construct(FormFactoryInterface $factory)
    {
        $this->factory = $factory;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class)
            ->add('receivesNewsletter', CheckboxType::class, [
                'required' => false,
            ])
            ->add('agreeToTermsAndDataPrivacy', CheckboxType::class, [
                'mapped' => false,
                'constraints' => [
                    new IsTrue([
                        'message' => 'approve_terms',
                    ]),
                ],
            ])
	        ->add('type', HiddenType::class)
        ;

        $formModifier = function (FormInterface $form, string $type) {
            if (User::TYPE_PERSON === $type) {
                $form->add('person', PersonType::class);
                $form->remove('organization');
            }
            if (User::TYPE_ORGANIZATION === $type) {
                $form->add('organization', OrganizationType::class);
                $form->remove('person');
            }
        };

        $builder->addEventListener(
            FormEvents::PRE_SET_DATA,
            function (FormEvent $event) use ($formModifier) {
                $formModifier($event->getForm(), $event->getData()->getType());
            }
        );

//        $builder->addEventListener(
//            FormEvents::PRE_SUBMIT,
//            function (FormEvent $event) use ($formModifier) {
//                $formModifier($event->getForm(), $event->getData()['type']);
//            }
//        );
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'translation_domain' => 'profile',
            'cascade_validation' => true,
        ]);
    }
}
