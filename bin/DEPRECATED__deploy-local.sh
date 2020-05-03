#!/bin/bash

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