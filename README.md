# Start developing
```console
./bin/develop.sh
cd spa/
yarn start
```

# Testing
## Setup the test environment (every time your schema or your fixtures change)
```
./bin/rebuild-test-database.sh
```

## Run the tests
Best way is via PHPStorm, an alternative is `./bin/phpunit`

# Fix code styles
php ./vendor/bin/php-cs-fixer fix --diff --dry-run -vvv

# Create UML
Do not install dePHPend with composer globally (interferes with other packages), nor run it with
Docker (not all commands will work as expected), wget does not work (produces 404)
So, outside of the project install dePHPend:
mkdir ~/.dephpend
cd  ~/.dephpend
composer init
composer require dephpend/dephpend:dev-master
sudo apt-get install -y plantuml
./vendor/bin/dephpend  uml --output=uml.png /var/www/html/skeleton/src/

