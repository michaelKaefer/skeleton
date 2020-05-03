# The "staging" branch for staging is built the same way as the "master" branch is built for production. With
# two exceptions:
#     - in the staging area the assets (minified JS, CSS, etc.) are built during deployment and in the
#       production environment the assets are not built since this would be risky (to create the assets
#       we also need to install all their dependencies for production)
#     - the database of the staging environment gets rebuilt and seeded with dummy data (the production
#       database not)

...

#################### Basic Auth ####################

echo '
AuthUserFile "/usr/www/users/aaabbb/staging.example.com/public/.htpasswd"
AuthName "Realm"
AuthType Basic
require valid-user
' >> public/.htaccess

echo '
john-doe:$2y$10$5mrL8patlsP9A/884QBfh.N5XG7yuTtP/ciKK/IT5pWmuESvo/FTO
' >> public/.htpasswd



#################### Configure database ####################

echo '
DATABASE_URL=mysql://foobar:M2AcXXp4Ea7btC9y@sql163.your-server.de:3306/barbaz?serverVersion=5.7
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
