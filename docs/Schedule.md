- write jest tests for: spa/
- profile form validation with yup
- lazy load images beneath the fold: https://github.com/verlok/lazyload
- automatically run cs fixer either on:

    BEFORE PULL REQUEST OR PUSH IS ACCEPTED BY THE REMOTE REPO


  - changes in src/ and test/
  - commits
  - before ./bin/develop.sh
  - with PHPStorm config 
  
  Require friendsofphp/php-cs-fixer as a dev dependency:
  $ ./composer.phar require --dev friendsofphp/php-cs-fixer
  
  Then, add the following command to your CI:
  $ IFS='
  $ '
  $ CHANGED_FILES=$(git diff --name-only --diff-filter=ACMRTUXB "${COMMIT_RANGE}")
  $ if ! echo "${CHANGED_FILES}" | grep -qE "^(\\.php_cs(\\.dist)?|composer\\.lock)$"; then EXTRA_ARGS=$(printf -- '--path-mode=intersection\n--\n%s' "${CHANGED_FILES}"); else EXTRA_ARGS=''; fi
  $ vendor/bin/php-cs-fixer fix --config=.php_cs.dist -v --dry-run --stop-on-violation --using-cache=no ${EXTRA_ARGS}
  Where $COMMIT_RANGE is your range of commits, e.g. $TRAVIS_COMMIT_RANGE or HEAD~..HEAD.