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

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false, hardDelete=true)
 * @UniqueEntity(fields={"email"}, message="There is already an account with this email")
 * @ApiResource(
 *     attributes={"security"="is_granted('ROLE_ADMIN') or (is_granted('ROLE_USER') and object == user)"},
 *     normalizationContext={"groups"={"user"}},
 *     denormalizationContext={"groups"={"user"}}
 * )
 */
class User extends BaseEntity implements UserInterface
{
    use SoftDeleteableEntity;

    const RELATIVE_PATH_TO_UPLOADED_AVATARS = 'avatars/';

    const TYPE_PERSON = 'PERSON';
    const TYPE_ORGANIZATION = 'ORGANIZATION';

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     * @Groups({"user"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     * @Assert\NotBlank()
     * @Assert\Email()
     * @Groups({"user"})
     */
    private $email;

    /**
     * @ORM\Column(type="json")
     * @Groups({"user"})
     */
    private $roles = [];

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $confirmationToken;

    /**
     * @Groups({"user"})
     */
    private $confirmationTokenWasSent;

    /**
     * Filename of the uploaded avatar image without the path to the file.
     *
     * @ORM\OneToOne(targetEntity="App\Entity\File", cascade={"persist", "remove"})
     */
    private $avatar;

    /**
     * @Groups({"user"})
     */
    private $avatarUrl;

    /**
     * @ORM\Column(type="boolean")
     * @Groups({"user"})
     */
    private $receivesNewsletter;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $subscribedToNewsletterAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $unsubscribedFromNewsletterAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastLoginAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastFailedLoginAt;

    /**
     * @ORM\Column(type="integer")
     */
    private $failedLoginsCount = 0;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $deletionId;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $passwordResetToken;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $passwordResetTokenExpiresAt;

    /**
     * @ORM\Column(type="string", length=30)
     * @Groups({"user"})
     */
    private $type = 'PERSON';

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Person", inversedBy="user", cascade={"persist", "remove"})
     * @Assert\Valid
     */
    private $person;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Organization", inversedBy="user", cascade={"persist", "remove"})
     * @Assert\Valid
     */
    private $organization;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Address", mappedBy="user", cascade={"persist"})
     */
    private $addresses;

    public function __construct()
    {
        $this->addresses = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->email;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getAvatar(): ?File
    {
        return $this->avatar;
    }

    public function setAvatar(?File $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        if (null === $this->avatar) {
            return null;
        }

        return $this->getAvatarRelativePath().$this->getAvatar()->getName();
    }

    public function getAvatarRelativePath(): string
    {
        return self::RELATIVE_PATH_TO_UPLOADED_AVATARS;
    }

    public function getReceivesNewsletter(): ?bool
    {
        return $this->receivesNewsletter;
    }

    public function setReceivesNewsletter(bool $receivesNewsletter): self
    {
        $this->receivesNewsletter = $receivesNewsletter;

        return $this;
    }

    public function getConfirmationToken(): ?string
    {
        return $this->confirmationToken;
    }

    public function setConfirmationToken(?string $confirmationToken): self
    {
        $this->confirmationToken = $confirmationToken;

        return $this;
    }

    public function getConfirmationTokenWasSent(): bool
    {
        return null !== $this->confirmationToken;
    }

    public function getLastLoginAt(): ?\DateTimeInterface
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\DateTimeInterface $lastLoginAt): self
    {
        $this->lastLoginAt = $lastLoginAt;

        return $this;
    }

    public function getDeletionId(): ?string
    {
        return $this->deletionId;
    }

    public function setDeletionId(?string $deletionId): self
    {
        $this->deletionId = $deletionId;

        return $this;
    }

    public function getSubscribedToNewsletterAt(): ?\DateTimeInterface
    {
        return $this->subscribedToNewsletterAt;
    }

    public function setSubscribedToNewsletterAt(?\DateTimeInterface $subscribedToNewsletterAt): self
    {
        $this->subscribedToNewsletterAt = $subscribedToNewsletterAt;

        return $this;
    }

    public function getUnsubscribedFromNewsletterAt(): ?\DateTimeInterface
    {
        return $this->unsubscribedFromNewsletterAt;
    }

    public function setUnsubscribedFromNewsletterAt(?\DateTimeInterface $unsubscribedFromNewsletterAt): self
    {
        $this->unsubscribedFromNewsletterAt = $unsubscribedFromNewsletterAt;

        return $this;
    }

    public function getLastFailedLoginAt(): ?\DateTimeInterface
    {
        return $this->lastFailedLoginAt;
    }

    public function setLastFailedLoginAt(?\DateTimeInterface $lastFailedLoginAt): self
    {
        $this->lastFailedLoginAt = $lastFailedLoginAt;

        return $this;
    }

    public function getFailedLoginsCount(): ?int
    {
        return $this->failedLoginsCount;
    }

    public function setFailedLoginsCount(int $failedLoginsCount): self
    {
        $this->failedLoginsCount = $failedLoginsCount;

        return $this;
    }

    public function getPasswordResetToken(): ?string
    {
        return $this->passwordResetToken;
    }

    public function setPasswordResetToken(?string $passwordResetToken): self
    {
        $this->passwordResetToken = $passwordResetToken;

        return $this;
    }

    public function getPasswordResetTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->passwordResetTokenExpiresAt;
    }

    public function setPasswordResetTokenExpiresAt(?\DateTimeInterface $passwordResetTokenExpiresAt): self
    {
        $this->passwordResetTokenExpiresAt = $passwordResetTokenExpiresAt;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getPerson(): ?Person
    {
        return $this->person;
    }

    public function setPerson(?Person $person): self
    {
        $this->person = $person;

        return $this;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    /**
     * @return Collection|Address[]
     */
    public function getAddresses(): Collection
    {
        return $this->addresses;
    }

    public function addAddress(Address $address): self
    {
        if (!$this->addresses->contains($address)) {
            $this->addresses[] = $address;
            $address->setUser($this);
        }

        return $this;
    }

    public function removeAddress(Address $address): self
    {
        if ($this->addresses->contains($address)) {
            $this->addresses->removeElement($address);
            // set the owning side to null (unless already changed)
            if ($address->getUser() === $this) {
                $address->setUser(null);
            }
        }

        return $this;
    }
}
