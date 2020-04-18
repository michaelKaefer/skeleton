<?php

namespace App\Form\Type;

use Symfony\Component\Form\Extension\Core\Type\CheckboxType as BaseCheckboxType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class CheckboxType extends BaseCheckboxType
{
	/**
	 * {@inheritdoc}
	 */
	public function buildView(FormView $view, FormInterface $form, array $options): void
	{
		parent::buildView($view, $form, $options);
        $view->vars['label_attr']['class'] = 'checkbox-custom';
	}
}
