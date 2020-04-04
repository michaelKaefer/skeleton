<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\FileRepository")
 */
class File
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     * @Groups({"user"})
     */
    private $id;

	/**
	 * @Groups({"user"})
	 */
    private $name;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $nameWithoutExtension;

	/**
	 * @ORM\Column(type="string", length=20, nullable=true)
	 */
	private $extension;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $originalNameWithoutExtension;

	/**
	 * @ORM\Column(type="integer")
	 * @Groups({"user"})
	 */
	private $size;

    public function getId(): ?int
    {
        return $this->id;
    }

	public function getName(): ?string
	{
		return sprintf('%s.%s', $this->nameWithoutExtension, $this->extension);
	}

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): self
    {
        $this->size = $size;

        return $this;
    }

    public function getOriginalNameWithoutExtension(): ?string
    {
        return $this->originalNameWithoutExtension;
    }

    public function setOriginalNameWithoutExtension(string $originalNameWithoutExtension): self
    {
        $this->originalNameWithoutExtension = $originalNameWithoutExtension;

        return $this;
    }

    public function getExtension(): ?string
    {
        return $this->extension;
    }

    public function setExtension(?string $extension): self
    {
        $this->extension = $extension;

        return $this;
    }

    public function getNameWithoutExtension(): ?string
    {
        return $this->nameWithoutExtension;
    }

    public function setNameWithoutExtension(string $nameWithoutExtension): self
    {
        $this->nameWithoutExtension = $nameWithoutExtension;

        return $this;
    }
}
