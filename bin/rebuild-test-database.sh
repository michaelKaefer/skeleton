#!/bin/bash

# Rebuilding the test database is required every time either your schema or your fixtures change

printf "\n"


printf "1/5 Changing working directory to app directory...\n"
APP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd )"
if ! cd "$APP_PATH/.."
then
  echo "1/5 Error on changing working directory to app directory..."
  echo "$OUTPUT"
  exit
fi
printf "1/5 Success, changed working directory to %s\n\n" "$APP_PATH/.."


printf "2/5 Dropping test database...\n"
if ! OUTPUT="$( bin/console doctrine:database:drop --force --env=test 2>&1 )"
then
  if echo "$OUTPUT" | grep "database doesn\'t exist" >/dev/null; then
    printf "2/5 Success, test database does not exist\n\n"
  else
    echo "2/5 Error on dropping test database:"
    echo "$OUTPUT"
    exit
  fi
else
  printf "2/5 Success\n\n"
fi


printf "3/5 Creating test database and scheme...\n"
if ! OUTPUT="$( bin/console doctrine:schema:create --env=test 2>&1 )"
then
  echo "3/5 Error on creating test database and scheme:"
  echo "$OUTPUT"
  exit
fi
printf "3/5 Success\n\n"


printf "4/5 Loading test fixtures...\n"
if ! OUTPUT="$( bin/console hautelook:fixtures:load --no-interaction --env=test 2>&1 )"
then
  echo "4/5 Error on loading test fixtures:"
  echo "$OUTPUT"
  exit
fi
printf "4/5 Success\n\n"
