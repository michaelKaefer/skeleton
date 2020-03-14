# Start developing
```console
./bin/develop.sh
```

# Testing
## Setup the test environment (every time your schema or your fixtures change)
```
./bin/console doctrine:database:drop --force --env=test ; \
    ./bin/console doctrine:schema:create --env=test ; \
    ./bin/console hautelook:fixtures:load --no-interaction --env=test
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

