#!/bin/bash
# This script needs to be executed from the root directory.

ROOT=..
TEST=.

# Install server
rm -rf node_modules
npm install $ROOT/msl-server-node

# Install jasmine
rm -rf jasmine
mkdir jasmine
pushd jasmine
wget -O jasmine.zip https://github.com/pivotal/jasmine/blob/master/dist/jasmine-standalone-2.0.0.zip?raw=true
unzip jasmine.zip
popd

# Install jquery
rm -rf $TEST/msl-client-browser/lib
wget https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
mkdir $TEST/msl-client-browser/lib
mv jquery.min.js $TEST/msl-client-browser/lib

# Install karma
npm install karma --save-dev
npm install karma-cli  --save-dev
npm install karma-jasmine@2_0 --save-dev
npm install karma-chrome-launcher --save-dev
npm install karma-junit-reporter --save-dev
npm install karma-html2js-preprocessor --save-dev
npm install karma-sauce-launcher --save-dev

# Run browser client tests
node_modules/msl-server/bin/msl --basedir=$ROOT --port=8002 --debug=true &
pid=`ps -ef | grep "msl" | head -n 1 | awk '{print $2}'`
echo "MSL has pid $pid"
node_modules/karma-cli/bin/karma start $TEST/msl-client-browser/karma.conf.js
kill -9 $pid

# Run Java tests
node_modules/msl-server/bin/msl --basedir=$ROOT/msl-sample-app --port=8001 --debug=true &
pid=`ps -ef | grep "msl" | head -n 1 | awk '{print $2}'`
pushd $ROOT/msl-client-java
mvn clean verify
kill -9 $!
popd
kill -9 $pid
