# Basic skeleton app for Symfony 5 projects
[![Build Status](https://travis-ci.com/michaelKaefer/skeleton.svg?branch=master)](https://travis-ci.com/michaelKaefer/skeleton)

## Create UML
Do not install dePHPend with composer globally (interferes with other packages), nor run it with
Docker (not all commands will work as expected), wget does not work (produces 404)
So, outside of the project install dePHPend:
mkdir ~/.dephpend
cd  ~/.dephpend
composer init
composer require dephpend/dephpend:dev-master
sudo apt-get install -y plantuml
./vendor/bin/dephpend  uml --output=uml.png /var/www/html/skeleton/src/
