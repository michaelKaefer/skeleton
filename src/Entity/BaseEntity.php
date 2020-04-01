<?php

declare(strict_types=1);

namespace App\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Traits\TimestampableEntity;

abstract class BaseEntity
{
    /**
     * Adds timestampable behavior
     * Creates and updates two properties for the entity: createdAt and updatedAt.
     */
    use TimestampableEntity;

    /**
     * Adds translatable behavior
     * Used locale to override Translation listener`s locale. This is not a mapped field of
     * entity metadata, just a simple property.
     *
     * @Gedmo\Locale
     */
    private $locale;

    /**
     * Adds translatable behavior
     *
     * @param string $locale  A string representing a locale, for example "en", "de", "fr"
     * @return $this
     */
    public function setTranslatableLocale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }
}
