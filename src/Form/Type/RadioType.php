<?php

namespace App\Form\Type;

use Symfony\Component\Form\Extension\Core\Type\RadioType as BaseRadioType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class RadioType extends BaseRadioType
{
	/**
	 * {@inheritdoc}
	 */
	public function buildView(FormView $view, FormInterface $form, array $options): void
	{
		parent::buildView($view, $form, $options);
		$view->vars['label_attr']['class'] = 'radio-custom';
	}
}
