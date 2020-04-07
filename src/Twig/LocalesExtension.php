<?php

declare(strict_types=1);

namespace App\Twig;

use Symfony\Component\Intl\Locales;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class LocalesExtension extends AbstractExtension
{
    private $supportedLocales;
    private $locales;

    public function __construct(string $supportedLocales)
    {
        $localeCodes = explode('|', $supportedLocales);
        sort($localeCodes);
        $this->supportedLocales = $localeCodes;
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('available_app_locales', [$this, 'getAvailableAppLocales']),
        ];
    }

    /**
     * Takes the list of codes of the locales (languages) enabled in the
     * application and returns an array with the name of each locale written
     * in its own language (e.g. English, Français, Español, etc.).
     */
    public function getAvailableAppLocales(): array
    {
        if (null !== $this->locales) {
            return $this->locales;
        }

        $this->locales = [];
        foreach ($this->supportedLocales as $localeCode) {
            $this->locales[] = ['code' => $localeCode, 'name' => Locales::getName($localeCode, $localeCode)];
        }

        return $this->locales;
    }
}
