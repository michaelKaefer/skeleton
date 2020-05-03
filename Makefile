# —— Inspired by ———————————————————————————————————————————————————————————————
# http://fabien.potencier.org/symfony4-best-practices.html
# https://speakerdeck.com/mykiwi/outils-pour-ameliorer-la-vie-des-developpeurs-symfony?slide=47
# https://blog.theodo.fr/2018/05/why-you-need-a-makefile-on-your-project/
# https://www.strangebuzz.com/en/snippets/the-perfect-makefile-for-symfony

# Setup ————————————————————————————————————————————————————————————————————————
# Make internals
SHELL := /bin/bash
.DEFAULT_GOAL := help

# Used programs
PHP := php
COMPOSER := composer
SYMFONY := symfony
DOCKER_COMPOSE := docker-compose
YARN := yarn
CONSOLE := $(SYMFONY) console
PHIVE := /usr/local/bin/phive

# For better readability dismiss all output
STDOUT := >/dev/null
# Keep the errors but provide a way to easily dismiss them (comment in the "2>&1")
STDERR := #2>&1
# Provide a possibility to force dismiss STDERR if they output infos via STDERR which we would expect on STDOUT
STDERR_FORCE_DISMISS := 2>&1

help: ## Show help
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Build ———————————————————————————————————
build-dev: tools-check app-check dependencies-php-install dependencies-javascript-install database-create-force-dev ## Build the application for local development using the "dev" environment
	$(YARN) dev
	cp -n .env.local.template .env.local
.PHONY: build-dev

## —— Development Tools ———————————————————————
tools-check: ## Check that all required tools are installed
	$(COMPOSER) --version ${STDOUT} ${STDERR}
	$(PHIVE) --version ${STDOUT} ${STDERR}
	$(SYMFONY) self:version --no-interaction ${STDOUT} ${STDERR}
	$(DOCKER_COMPOSE) --version ${STDOUT} ${STDERR}
	$(YARN) --version ${STDOUT} ${STDERR}
.PHONY: tools-check

tools-symfony-update: ## Update Symfony binary
	sudo $(SYMFONY) self:update ${STDOUT} ${STDERR}
.PHONY: tools-symfony-update

tools-composer-update: ## Update Composer
	sudo $(COMPOSER) self-update ${STDOUT} ${STDERR}
.PHONY: tools-composer-update

# TODO maybe get the fiy manually, buggy, see: https://github.com/phar-io/phive/issues/228
tools-phive-update: ## Update PHIVE
	$(PHIVE) selfupdate ${STDOUT} ${STDERR}
.PHONY: tools-phive-update

tools-install-help: ## Help for installing a PHAR used as a tool for development
	@printf "Example: copy PHP CS Fixer into the project's directory tools/:\n\n\tsudo %s install --copy php-cs-fixer\n\n" "$(PHIVE)"
.PHONY: tools-install-help

## —— Docker ——————————————————————————————————
docker-compose-up: ## Start Docker
	$(DOCKER_COMPOSE) up -d ${STDOUT} ${STDERR}
.PHONY: docker-compose-up

## —— Dependencies ————————————————————————————
dependencies-php-install: composer.lock ## Install PHP dependencies according to composer.lock
	$(COMPOSER) install ${STDOUT} ${STDERR}

dependencies-php-update: composer.json ## Update PHP dependencies according to composer.json
	$(COMPOSER) update ${STDOUT} ${STDERR}

dependencies-js-install: ## Install JavaScript dependencies according to yarn.lock
	$(YARN) install

## —— Database ————————————————————————————————
database-create-force-dev: ## Drop dev database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force --env=dev ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:create --env=dev ${STDOUT} ${STDERR}
	# Is the following really necessary? $(CONSOLE) doctrine:schema:validate --env=dev ${STDOUT} ${STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction --env=dev ${STDOUT} ${STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

database-create-force-test: ## Drop test database, create database and load fixtures
	$(CONSOLE) doctrine:database:drop --force --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:create --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) doctrine:schema:validate --env=test ${STDOUT} ${STDERR}
	$(CONSOLE) hautelook:fixtures:load --no-interaction --env=test ${STDOUT} ${STDERR}
	# bin/console fos:elastica:populate
.PHONY: database-create-force

## —— Application —————————————————————————————
app-check: ## Check requirements for the local environment
	$(SYMFONY) local:check:requirements ${STDOUT} ${STDERR}
.PHONY: app-check

app-clear-cache: ## Clear the application cache
	$(CONSOLE) cache:clear ${STDOUT} ${STDERR}
.PHONY: app-clear-cache

## —— Development —————————————————————————————
development-start-symfony: development-serve development-hot-reloading development-watch-assets ## Start developing
.PHONY: development-start

development-serve: ## Start developing server at 127.0.0.1:8000
	$(SYMFONY) server:start --port=8000 -d ${STDOUT} ${STDERR}
.PHONY: development-serve

development-watch-assets: ## Automatically build assets when files are changes
	$(YARN) encore dev --watch
.PHONY: development-watch-assets

development-hot-reloading: ## Start Browsersync at 127.0.0.1:3000
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

development-start-spa: ## Starts the SPA under spa/ for development at 127.0.0.1:3002 (the port is defined in spa/.env.development)
	cd spa/ ; $(YARN) start
.PHONY: development-start-spa

## —— Static code analysis ————————————————————
lint-cs-fixer-dry: ## Lint PHP with CS Fixer (do not edit files, on errors exit with exit code; can be used during CI to refuse pull requests which do not adapt to the used code styles)
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv --dry-run --stop-on-violation --using-cache=no ${STDOUT} ${STDERR_FORCE_DISMISS}
.PHONY: lint-cs-fixer-dry

lint-cs-fixer-force: ## Lint PHP with CS Fixer and correct files with errors
	$(PHP) ./tools/php-cs-fixer fix --diff -vvv
.PHONY: lint-cs-fixer-force

lint-psalm: ## Lint PHP with Psalm
	$(PHP) ./tools/psalm
.PHONY: lint-psalm

## —— Tests ———————————————————————————————————
tests: database-create-force-test ## Setup the test database, load fixtures and run all tests
	$(SYMFONY) run bin/phpunit
.PHONY: tests
