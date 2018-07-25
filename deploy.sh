if [ $? -ne 0 ]; then
  exit -1
fi

#
# Ignore pull requests
if [ $TRAVIS_SECURE_ENV_VARS == 'true' ]; then
echo "Attempting deployment..."

if [ $TRAVIS_PULL_REQUEST == 'false' ]; then
  echo "Not a pull request, executing E2E script and deploying..."
  ./test/e2e-run.sh
  cd msl-client-java
  mvn clean deploy -DskipTests --settings ../target/CM/settings.xml
else
  echo "Pull request, executing E2E script..."
  ./test/e2e-run.sh
fi
else
  echo "No deployment necessary, executing E2E script..."
  ./test/e2e-run.sh
fi
