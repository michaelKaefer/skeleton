php ./vendor/bin/php-cs-fixer fix --diff --dry-run -v



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

# Deployment
## Local
```
symfony check:requirements
docker-compose up -d
composer install
yarn
yarn dev
cp .env.local.template .env.local
./bin/console doctrine:database:create
./bin/console doctrine:migrations:migrate -n
./bin/console hautelook:fixtures:load -n
./bin/develop.sh
```

