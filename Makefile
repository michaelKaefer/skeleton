# —— Inspired by ———————————————————————————————————————————————————————————————
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
STDOUT := >/dev/null
# Keep the errors but provide a way to easily dismiss them (comment in the "2>&1")
STDERR := #2>&1
# Provide a possibility to force dismiss STDERR if they output infos via STDERR which we would expect on STDOUT
STDERR_FORCE_DISMISS := 2>&1

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
	$(COMPOSER) --version ${STDOUT} ${STDERR}
	$(PHIVE) --version ${STDOUT} ${STDERR}
	$(SYMFONY) self:version --no-interaction ${STDOUT} ${STDERR}
	$(DOCKER_COMPOSE) --version ${STDOUT} ${STDERR}
	$(YARN) --version ${STDOUT} ${STDERR}
.PHONY: tools-check

tools-update: tools-update-symfony tools-update-composer tools-update-phive ## Update all tools
	# Update all tools which where installed via PHIVE
	sudo $(PHIVE) update ${STDOUT} ${STDERR}
.PHONY: tools-update-symfony

tools-update-symfony: ## Update Symfony binary
	sudo $(SYMFONY) self:update ${STDOUT} ${STDERR}
.PHONY: tools-update-symfony

tools-update-composer: ## Update Composer
	sudo $(COMPOSER) self-update ${STDOUT} ${STDERR_FORCE_DISMISS}
.PHONY: tools-update-composer

# TODO maybe download the fix manually, it's buggy right now, see: https://github.com/phar-io/phive/issues/228
tools-update-phive: ## Update PHIVE
	# sudo $(PHIVE) selfupdate ${STDOUT} ${STDERR}
.PHONY: tools-update-phive

## —— Docker ——————————————————————————————————
docker-compose-up: ## Start Docker
	$(DOCKER_COMPOSE) up -d ${STDOUT} ${STDERR}
.PHONY: docker-compose-up

## —— Dependencies ————————————————————————————
dependencies-php-install-dev: composer.lock ## Install PHP dependencies according to composer.lock for development
	$(COMPOSER) install ${STDOUT} ${STDERR}

dependencies-php-install-prod: composer.lock ## Install PHP dependencies according to composer.lock for production
	$(COMPOSER) install --no-dev ${STDOUT} ${STDERR}

dependencies-php-update: composer.json ## Update PHP dependencies according to composer.json
	$(COMPOSER) update ${STDOUT} ${STDERR}

dependencies-js-install-dev: ## Install JavaScript dependencies according to yarn.lock for development
	$(YARN) install ${STDOUT} ${STDERR}
.PHONY: dependencies-js-install-dev

dependencies-js-install-prod: ## Install JavaScript dependencies according to yarn.lock for production
	$(YARN) install --production ${STDOUT} ${STDERR}
.PHONY: dependencies-js-install-prod

## —— Database ————————————————————————————————
database-create-force: ## For "dev" environment drop database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:create ${STDOUT} ${STDERR}
	# Is the following really necessary? $(CONSOLE) doctrine:schema:validate ${STDOUT} ${STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction ${STDOUT} ${STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

database-create-force-test: ## For "test" environment drop database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:create --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:validate --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction --env=test ${STDOUT} ${STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

database-migrate: ## Run database migrations
	$(CONSOLE) doctrine:migrations:migrate --no-interaction ${STDOUT} ${STDERR}
.PHONY: database-migrate

## —— Application —————————————————————————————
app-check: ## Check requirements for the local environment
	$(SYMFONY) local:check:requirements ${STDOUT} ${STDERR}
.PHONY: app-check

app-clear-cache: ## Clear the application cache
	$(CONSOLE) cache:clear ${STDOUT} ${STDERR}
.PHONY: app-clear-cache

app-assets-build-production: ## Build assets for production
	$(YARN) build
.PHONY: app-assets-build-production

## —— Development —————————————————————————————
develop-symfony: tools-update develop-symfony-serve develop-symfony-hot-reloading develop-symfony-watch-assets ## Start developing
.PHONY: develop-symfony

develop-symfony-serve: ## Start developing server at 127.0.0.1:8000
	$(SYMFONY) server:start --port=8000 -d ${STDOUT} ${STDERR}
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
		${STDERR}
.PHONY: development-hot-reloading

develop-spa: ## Starts the SPA under spa/ for development at 127.0.0.1:3002 (the port is defined in spa/.env.development)
	cd spa/ ; $(YARN) start
.PHONY: development-start-spa

## —— Static code analysis ————————————————————
lint-cs-fixer-dry-run: ## Lint PHP with CS Fixer (do not edit files, on errors exit with exit code; can be used during CI to refuse pull requests which do not adapt to the used code styles)
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv --dry-run --stop-on-violation --using-cache=no ${STDOUT} ${STDERR_FORCE_DISMISS}
.PHONY: lint-cs-fixer-dry-run

lint-cs-fixer: ## Lint PHP with CS Fixer and correct files with errors
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv
.PHONY: lint-cs-fixer

lint-psalm-dry-run: ## Lint PHP with Psalm (do not edit files, on errors exit with exit code; can be used during CI to refuse pull requests which do not adapt to the used code styles)
	$(PHP) ./tools/psalm
.PHONY: lint-psalm-dry-run

lint-psalm: ## Lint PHP with Psalm and correct files with errors
	$(PHP) ./tools/psalm --alter --issues=all
.PHONY: lint-psalm

## —— Tests ———————————————————————————————————
tests: database-create-force-test ## Setup the test database, load fixtures and run all tests
	$(SYMFONY) run bin/phpunit
.PHONY: tests
