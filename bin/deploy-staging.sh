#!/bin/bash


#################### Configuration ####################
GIT=git
PHP72="php72 -d allow_url_fopen=On"
COMPOSER="/usr/home/$USER/composer.phar"
#YARN=yarn

#################### Deploy branch "staging" ####################

# The "staging" branch for staging is built the same way as the "master" branch is built for production. With
# two exceptions:
#     - in the staging area the assets (minified JS, CSS, etc.) are built during deployment and in the
#       production environment the assets are not built since this would be risky (to create the assets
#       we also need to install all their dependencies for production)
#     - the database of the staging environment gets rebuilt and seeded with dummy data (the production
#       database not)


#################### git ####################

$GIT checkout staging

$GIT status

# Delete all changes made to the source code on the staging environment
$GIT reset --hard origin/staging

# Get the newest source code
$GIT pull origin staging


#################### Basic Auth ####################

echo '
AuthUserFile "/usr/www/users/devicep/dev-mygts.globaltcad.com/public/.htpasswd"
AuthName "Realm"
AuthType Basic
require valid-user
' >> public/.htaccess

echo '
globaltcad:$2y$10$6mrL8patlsP9A/88OQBfh.N5XG7yuTtP/ciKK/IT5pWmuESvo/FTO
' >> public/.htpasswd


#################### Make me executable for the next time ####################

chmod 744 bin/deploy-staging.sh


#################### Configure database ####################

echo '
DATABASE_URL=mysql://devicep_1:M3AcXXp9Ea7btC9y@sql164.your-server.de:3306/dev_mygts_globaltcad_com?serverVersion=5.7
' > .env.local


#################### Create files ####################

mkdir var/stores


#################### Composer ####################

# Install PHP dependencies for production
$PHP72 $COMPOSER install --no-ansi --no-dev


#################### yarn ####################

# Install JS and CSS dependencies for production
#$YARN install --production

# Build the assets (concatenated, minified, uglyfied JS, CSS, etc.)
#$YARN build


#################### Symfony ####################

# Delete the application cache
$PHP72 ./bin/console cache:clear

# Database
$PHP72 ./bin/console doctrine:migrations:migrate --no-interaction

#$PHP72 ./bin/console doctrine:database:drop --force
#$PHP72 ./bin/console doctrine:database:create
#$PHP72 ./bin/console doctrine:migrations:migrate --no-interaction
#$PHP72 ./bin/console hautelook:fixtures:load --no-interaction --env=prod


#################### PHP Version ####################

echo '
# PHP 7.2 für QA Umgebung, da der Hetzner Account auf anderen PHP-Versionen laufen kann
FcgidWrapper "/home/httpd/cgi-bin/php72-fcgi-starter.fcgi" .php
Action application/x-httpd-php72 /cgi-sys/php72-fcgi-starter.fcgi
AddType application/x-httpd-php72 .php
# PHP 7.2 für QA Umgebung, da der Hetzner Account auf anderen PHP-Versionen laufen kann
' >> public/.htaccess
