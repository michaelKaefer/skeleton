<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiProperty;

/**
 * @ORM\Entity(repositoryClass="App\Repository\OrganizationRepository")
 */
class Organization
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    public function getId(): ?int
    {
        return $this->id;
    }

	/**
	 * @var string|null the name of the item
	 *
	 * @ORM\Column(type="text", nullable=true)
	 * @ApiProperty(iri="http://schema.org/name")
	 */
	private $name;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\User", mappedBy="organization", cascade={"persist", "remove"})
     */
    private $user;

	public function setName(?string $name): self
	{
		$this->name = $name;
         
		return $this;
	}

	public function getName(): ?string
	{
		return $this->name;
	}

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        // set (or unset) the owning side of the relation if necessary
        $newOrganization = null === $user ? null : $this;
        if ($user->getOrganization() !== $newOrganization) {
            $user->setOrganization($newOrganization);
        }

        return $this;
    }
}