#!/bin/bash

printf "\n"

printf "1/6 Changing working directory to app directory...\n"
APP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd )"
if ! cd "$APP_PATH/.."
then
  echo "1/6 Error on changing working directory to app directory..."
  echo "$OUTPUT"
  exit
fi
printf "1/6 Success, changed working directory to %s\n\n" "$APP_PATH/.."

printf "2/6 Starting docker services...\n"
if ! OUTPUT="$( docker-compose up -d 2>&1 )"
then
  echo "2/6 Error on starting docker services:"
  echo "$OUTPUT"
  exit
fi
printf "2/6 Success\n\n"

printf "3/6 Starting built in Symfony server...\n"
if OUTPUT="$( symfony server:start --port=8000 -d 2>&1 )"
then
  printf "3/6 Success\n\n"
else
  if echo "$OUTPUT" | grep "The local web server is already running for this project at port 8000" >/dev/null; then
    printf "3/6 Success, server is already listening on https://127.0.0.1:8000/\n\n"
  else
    echo "3/6 Error on starting Symfony server:"
    echo "$OUTPUT"
    exit
  fi
fi

printf "4/6 Starting browser-sync for hot reloading...\n"
if [ "$(uname)" == "Darwin" ]; then
    printf "Darwin not supported"
    exit
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
  if BROWSER_SYNC_PROCESSES=$(ps -eo "[PID] %p  [COMMAND] %a" --sort=start_time | grep "[b]rowser-sync start"); then
      printf "4/6 Error on starting browser-sync: browser-sync is already running, please kill all existing browser-sync processes:\n\n"
      printf "%s\n\n" "$BROWSER_SYNC_PROCESSES"
      printf "Example: kill -9 999999 123123 1231231\n"
      exit
  fi
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    printf "MINGW32_NT"
    exit
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
  if BROWSER_SYNC_PROCESSES=$(wmic process where "name like '%node%'" get processid,commandline | grep browser); then
      printf "4/6 Error on starting browser-sync: browser-sync is already running, please kill all existing browser-sync processes:\n\n"
      printf "%s\n\n" "$BROWSER_SYNC_PROCESSES"
      printf "Example: taskkill -f -pid 999999 -pid 123123 -pid 1231231\n"
      exit
  fi
fi
if ! OUTPUT="$( \
    browser-sync start \
        --host=127.0.0.1 \
        --port=3000 \
        --proxy="https://127.0.0.1:8000/" \
        --files templates assets config src translations \
        --no-open \
        &>./var/.browser-sync \
        & \
)"
then
  printf "4/6 Error on starting browser-sync: \n\n%s" "$OUTPUT"
  exit
fi
printf "4/6 Success, started brwoser-sync on https://127.0.0.1:3000/, for details use \"cat ./var/.browser-sync\"\n\n"

printf "5/6 Starting assets build watcher...\n"
if [ "$(uname)" == "Darwin" ]; then
    printf "Darwin not supported"
    exit
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
  if YARN_ENCORE_PROCESSES=$(ps -eo "[PID] %p  [COMMAND] %a" --sort=start_time | grep "[y]arn.js encore dev"); then
      printf "4/6 Error on starting assets build watcher: yarn encore is already running, please kill all existing yarn encore processes:\n\n"
      printf "%s\n\n" "$YARN_ENCORE_PROCESSES"
      printf "Example: kill -9 999999 123123 1231231\n"
      exit
  fi
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    printf "MINGW32_NT"
    exit
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
  if YARN_ENCORE_PROCESSES=$(wmic process where "name like '%node%'" get processid,commandline | grep "encore dev"); then
      printf "4/6 Error on starting assets build watcher: yarn encore is already running, please kill all existing yarn encore processes:\n\n"
      printf "%s\n\n" "$YARN_ENCORE_PROCESSES"
      printf "Example: taskkill -f -pid 999999 -pid 123123 -pid 1231231\n"
      exit
  fi
fi
if ! OUTPUT="$( yarn encore dev --watch --color &>./var/.encore-dev & )"
then
  echo "5/6 Error on starting assets build watcher:"
  echo "$OUTPUT"
  exit
fi
printf "5/6 Success\n\n"

printf "6/6 Starting React application in spa/...\n"
if ! cd "spa/"
then
  echo "6/6 Error on changing working directory to spa/..."
  echo "$OUTPUT"
  exit
fi
if OUTPUT="$( yarn start &>../var/.react-yarn-start & )"
then
  printf "6/6 Success\n\n"
else
  echo "6/6 Error on starting React application in spa/:"
  echo "$OUTPUT"
  exit
fi

printf "Finished.\n\n"
printf "\tSymfony server:\n"
printf "\t\t[URL]    https://127.0.0.1:8000/\n"
printf "\t\t[LOGS]   symfony server:log\n"
printf "\tHot reloading:\n"
printf "\t\t[URL]    https://127.0.0.1:3000/\n"
printf "\t\t[LOGS]   tail -f ./var/.browser-sync\n"
printf "\tMySQL:\n"
printf "\t\t[HOST]   http://localhost:3308/\n"
printf "\t\t[USER]   \"root\"\n"
printf "\t\t[PW]     \"\"\n"
printf "\t\t[DB]     \"skeleton_dev\"\n"
printf "\tphpMyAdmin:\n"
printf "\t\t[URL]    http://localhost:8183/\n"
printf "\t\t[Server] \"mysql\"\n"
printf "\t\t[User]   \"root\"\n"
printf "\t\t[PW]     \"\"\n"
printf "\tEncore is watching assets:\n"
printf "\t\t[LOGS]   tail -f ./var/.encore-dev\n"
printf "\tReact SPA:\n"
printf "\t\t[URL]    http://localhost:3002/\n"
printf "\t\t[LOGS]   tail -f ./var/.react-yarn-start\n"
printf "\n"

#read -p "Do you want to run the assets build watcher now? [y/n, you can also hit ENTER for yes] " -n 1 -r
#if [[ ! "$REPLY" =~ ^[Yy]$ ]] && [[ ! "$REPLY" == "" ]]; then
#  printf "\n"
#  exit
#fi
#yarn encore dev --watch
