<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200314203602 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user ADD confirmation_token VARCHAR(255) DEFAULT NULL, ADD first_name VARCHAR(255) NOT NULL, ADD last_name VARCHAR(255) NOT NULL, ADD country VARCHAR(255) NOT NULL, ADD receives_newsletter TINYINT(1) NOT NULL, ADD subscribed_to_newsletter_at DATETIME DEFAULT NULL, ADD unsubscribed_from_newsletter_at DATETIME DEFAULT NULL, ADD last_login_at DATETIME DEFAULT NULL, ADD last_failed_login_at DATETIME DEFAULT NULL, ADD failed_logins_count INT NOT NULL, ADD deletion_id VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user DROP confirmation_token, DROP first_name, DROP last_name, DROP country, DROP receives_newsletter, DROP subscribed_to_newsletter_at, DROP unsubscribed_from_newsletter_at, DROP last_login_at, DROP last_failed_login_at, DROP failed_logins_count, DROP deletion_id');
    }
}
