#!/bin/bash

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


printf "2/5 Dropping database...\n"
if ! OUTPUT="$( bin/console doctrine:database:drop --force 2>&1 )"
then
  if echo "$OUTPUT" | grep "database doesn't exist" >/dev/null; then
    printf "2/5 Success, database does not exist\n\n"
  else
    echo "2/5 Error on dropping database:"
    echo "$OUTPUT"
    exit
  fi
else
  printf "2/5 Success\n\n"
fi


printf "3/5 Creating database...\n"
if ! OUTPUT="$( bin/console doctrine:database:create 2>&1 )"
then
  echo "3/5 Error on creating database:"
  echo "$OUTPUT"
  exit
fi
printf "3/5 Success\n\n"


# Could be useful in future: bin/console doctrine:migrations:migrate --no-interaction
printf "4/5 Creating database schema...\n"
if ! OUTPUT="$( bin/console doctrine:schema:create 2>&1 )"
then
  echo "4/5 Error on creating database schema:"
  echo "$OUTPUT"
  exit
fi
printf "4/5 Success\n\n"


printf "5/5 Loading fuxtures...\n"
if ! OUTPUT="$(bin/console hautelook:fixtures:load --no-interaction 2>&1 )"
then
  echo "5/5 Error on loading fixtures:"
  echo "$OUTPUT"
  exit
fi
printf "5/5 Success\n\n"


#bin/console fos:elastica:populate