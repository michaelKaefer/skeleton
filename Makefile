# See ——————————————————————————————————————————————————————————————————————————
# http://fabien.potencier.org/symfony4-best-practices.html
# https://speakerdeck.com/mykiwi/outils-pour-ameliorer-la-vie-des-developpeurs-symfony?slide=47
# https://blog.theodo.fr/2018/05/why-you-need-a-makefile-on-your-project/
# https://www.strangebuzz.com/en/snippets/the-perfect-makefile-for-symfony

# Setup ————————————————————————————————————————————————————————————————————————
# Import environment variables
include .env.local

# Make internals
SHELL := /bin/bash
.DEFAULT_GOAL := help

# Used programs (depending on the environment)
PHP ?= php
GIT ?= git
DOCKER_COMPOSE ?= docker-compose
COMPOSER ?= composer
SYMFONY ?= symfony
YARN ?= yarn
PHIVE ?= phive

# Used programs (not depending on the environment)
CONSOLE := $(SYMFONY) console

# For better readability dismiss all output
DISMISS_STDOUT := >/dev/null
# Keep the errors but provide a way to easily dismiss them (comment in the "2>&1")
DISMISS_STDERR := #2>&1
# Provide a possibility to force dismiss STDERR if they output infos via STDERR which we would expect on STDOUT
FORCE_DISMISS_STDERR := 2>&1

## —— Help ————————————————————————————————————
help: ## Show help
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' Makefile | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
.PHONY: help

install-phars: ## Help for installing a PHAR used as a tool for development
	@printf "Example: copy PHP CS Fixer into the project's directory tools/:\n\n\tsudo %s install --copy php-cs-fixer\n\n" "$(PHIVE)"
.PHONY: tools-install-help

## —— Build ———————————————————————————————————
local: tools-check app-check dependencies-php-install-dev dependencies-js-install-dev database-create-force ## Build the application for local development using the "dev" environment
	$(YARN) dev
	cp -n .env.local.template .env.local
.PHONY: build-local

staging: pull-staging tools-check app-check dependencies-php-install-prod dependencies-js-install-prod database-create-force app-clear-cache app-assets-build-production ## Build the application for the staging environment using the "prod" environment
	# Basic Auth
	echo '
	AuthUserFile "/usr/www/users/aaabbb/staging.example.com/public/.htpasswd"
	AuthName "Realm"
	AuthType Basic
	require valid-user
	' >> public/.htaccess
	echo '
	john-doe:$2y$10$5mrL8patlsP9A/884QBfh.N5XG7yuTtP/ciKK/IT5pWmuESvo/FTO
	' >> public/.htpasswd
	# Configure database
	echo '
	DATABASE_URL=mysql://foobar:M2AcXXp4Ea7btC9y@sql163.your-server.de:3306/barbaz?serverVersion=5.7
	' > .env.local
	# PHP Version
	echo '
	# PHP 7.2 for the staging environment
	FcgidWrapper "/home/httpd/cgi-bin/php72-fcgi-starter.fcgi" .php
	Action application/x-httpd-php72 /cgi-sys/php72-fcgi-starter.fcgi
	AddType application/x-httpd-php72 .php
	# PHP 7.2 for the staging environment
	' >> public/.htaccess
.PHONY: build-staging

production: pull-production dependencies-php-install-prod database-migrate app-clear-cache ## Build the application for the production environment using the "prod" environment
	# The "staging" branch for staging is built the same way as the "master" branch is built for production. With
	# two exceptions:
	#     - in the staging area the assets (minified JS, CSS, etc.) are built during deployment and in the
	#       production environment the assets are not built since this would be risky (to create the assets
	#       we also need to install all their dependencies for production)
	#     - the database of the staging environment gets rebuilt and seeded with dummy data (the production
	#       database not)
	# TODO: provide help how to copy assets from staging (or from local machine) to production
.PHONY: production

## —— Git —————————————————————————————————————
pull-staging: ## Pull branch "staging"
	$(GIT) checkout staging
	# Delete all changes made to the source code on the staging environment
	$(GIT) reset --hard origin/staging
	# Get the newest source code
	$(GIT) pull origin staging
.PHONY: pull-staging

pull-production: ## Pull branch "master"
	$(GIT) checkout master
	# Delete all changes made to the source code on the staging environment
	$(GIT) reset --hard origin/master
	# Get the newest source code
	$(GIT) pull origin master
.PHONY: pull-production

## —— Development Tools ———————————————————————
tools-check: ## Check that all required tools are installed
	$(COMPOSER) --version ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(PHIVE) --version ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(SYMFONY) self:version --no-interaction ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(DOCKER_COMPOSE) --version ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(YARN) --version ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: tools-check

tools-update: tools-update-symfony tools-update-composer tools-update-phive ## Update all tools
	# Update all tools which where installed via PHIVE
	sudo $(PHIVE) update ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: tools-update-symfony

tools-update-symfony: ## Update Symfony binary
	sudo $(SYMFONY) self:update ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: tools-update-symfony

tools-update-composer: ## Update Composer
	sudo $(COMPOSER) self-update ${DISMISS_STDOUT} ${FORCE_DISMISS_STDERR}
.PHONY: tools-update-composer

tools-update-phive: ## Update PHIVE
	sudo $(PHIVE) selfupdate ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: tools-update-phive

## —— Docker ——————————————————————————————————
docker-compose-up: ## Start Docker
	$(DOCKER_COMPOSE) up -d ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: docker-compose-up

## —— Dependencies ————————————————————————————
dependencies-php-install-dev: composer.lock ## Install PHP dependencies according to composer.lock for development
	$(COMPOSER) install ${DISMISS_STDOUT} ${DISMISS_STDERR}

dependencies-php-install-prod: composer.lock ## Install PHP dependencies according to composer.lock for production
	$(COMPOSER) install --no-dev ${DISMISS_STDOUT} ${DISMISS_STDERR}

dependencies-php-update: composer.json ## Update PHP dependencies according to composer.json
	$(COMPOSER) update ${DISMISS_STDOUT} ${DISMISS_STDERR}

dependencies-php-security-check: ## Check whether your project's dependencies contain any known security vulnerability.
	$(SYMFONY) check:security
.PHONY: dependencies-php-security-check

dependencies-js-install-dev: ## Install JavaScript dependencies according to yarn.lock for development
	$(YARN) install ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: dependencies-js-install-dev

dependencies-js-install-prod: ## Install JavaScript dependencies according to yarn.lock for production
	$(YARN) install --production ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: dependencies-js-install-prod

## —— Database ————————————————————————————————
database-create-force: ## For current environment drop database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(CONSOLE) doctrine:schema:create ${DISMISS_STDOUT} ${DISMISS_STDERR}
	# Is the following really necessary? $(CONSOLE) doctrine:schema:validate ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction ${DISMISS_STDOUT} ${DISMISS_STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

database-create-force-test-for-continuous-integration: database-create-force-test ## For continuous integration it is comfortable to have a database with fixtures to test against. This command creates this database which is also tracked with Git.
	rm tests/data/test_database_containing_fixtures.db
	cp var/test_database.db tests/data/test_database_containing_fixtures.db
.PHONY: database-create-force-test-for-continuous-integration

database-create-force-test: ## For "test" environment drop database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force --env=test ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(CONSOLE) doctrine:schema:create --env=test ${DISMISS_STDOUT} ${DISMISS_STDERR}
#	$(CONSOLE) doctrine:schema:validate --env=test ${DISMISS_STDOUT} ${DISMISS_STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction --env=test ${DISMISS_STDOUT} ${DISMISS_STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

database-migrate: ## Run database migrations
	$(CONSOLE) doctrine:migrations:migrate --no-interaction ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: database-migrate

## —— Application —————————————————————————————
app-check: ## Check requirements for the local environment
	$(SYMFONY) local:check:requirements ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: app-check

app-clear-cache: ## Clear the application cache
	$(CONSOLE) cache:clear ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: app-clear-cache

app-assets-build-production: ## Build assets for production
	$(YARN) build
.PHONY: app-assets-build-production

## —— Development —————————————————————————————
develop-symfony: tools-update develop-symfony-serve develop-symfony-hot-reloading develop-symfony-watch-assets ## Start developing
.PHONY: develop-symfony

develop-symfony-serve: ## Start developing server at 127.0.0.1:8000
	$(SYMFONY) server:start --port=8000 -d ${DISMISS_STDOUT} ${DISMISS_STDERR}
.PHONY: development-serve

develop-symfony-watch-assets: ## Automatically build assets when files are changes
	$(YARN) encore dev --watch
.PHONY: development-watch-assets

develop-symfony-hot-reloading: ## Start Browsersync at 127.0.0.1:3000
	browser-sync start \
		--host=127.0.0.1 \
		--port=3000 \
		--proxy="https://127.0.0.1:8000/" \
		--files templates assets config src translations \
		--no-open \
		>./var/.development-hot-reloading \
		& \
		${DISMISS_STDERR}
	printf "Success, started brwoser-sync on https://127.0.0.1:3000/, for details use \"cat ./var/.development-hot-reloading\"\n\n"
.PHONY: development-hot-reloading

develop-spa: ## Starts the SPA under spa/ for development at 127.0.0.1:3002 (the port is defined in spa/.env.development)
	cd spa/ ; $(YARN) start
.PHONY: development-start-spa

## —— Linters —————————————————————————————————
lint-composer: ## Lint Composer, checks if composer.json is valid.
	$(COMPOSER) validate --strict
.PHONY: lint-composer

lint-container: ## Lint container, checks that arguments injected into services match type declarations.
	$(CONSOLE) lint:container
.PHONY: lint-container

lint-schema: ## Lint schema, checks that Doctrine's mapping configurations are valid.
	$(CONSOLE) doctrine:schema:validate --skip-sync -vvv --no-interaction
.PHONY: lint-schema

lint-yaml: ## Lint YAML config files for syntax errors.
	$(CONSOLE) lint:yaml config --parse-tags
.PHONY: lint-yaml

lint-twig: ## Lint twig template files for syntax errors.
	$(CONSOLE) lint:twig templates
.PHONY: lint-twig

lint-xliff: ## Lint XLIFF translations for syntax errors.
	$(CONSOLE) lint:xliff translations
.PHONY: lint-xliff

## —— Static code analysis for PHP ————————————
cs-fixer-dry-run: ## Lint PHP with CS Fixer (do not edit files, on errors exit with exit code; can be used during CI to refuse pull requests which do not adapt to the used code styles)
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv --dry-run --stop-on-violation --using-cache=no ${DISMISS_STDOUT} ${FORCE_DISMISS_STDERR}
.PHONY: cs-fixer-dry-run

cs-fixer: ## Lint PHP with CS Fixer and correct files with errors
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv
.PHONY: cs-fixer

psalm-dry-run: ## Lint PHP with Psalm (do not edit files, on errors exit with exit code; can be used during CI to refuse pull requests which do not adapt to the used code styles)
	$(PHP) ./tools/psalm
.PHONY: psalm-dry-run

psalm: ## Lint PHP with Psalm and correct files with errors
	$(PHP) ./tools/psalm --alter --issues=all
.PHONY: psalm

code-coverage: ## Create HTML code coverage report in ./var/coverage/ (also shows the text coverage report in STDOUT).
	$(SYMFONY) run bin/phpunit --coverage-html var/coverage/ --coverage-text
.PHONY: code-coverage

## —— Tests ———————————————————————————————————
tests: tests ## Run PHPUnit tests.
	$(SYMFONY) run bin/phpunit
.PHONY: tests
