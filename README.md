MSL [![Build Status](https://secure.travis-ci.org/FINRAOS/MSL.png?branch=master)](http://travis-ci.org/FINRAOS/MSL)
===

[MSL](http://finraos.github.io/MSL/) (pronounced 'Missile') stands for Mock Service Layer. Our tools enable quick local deployment of your UI code on Node and mocking of your service layer for fast, targeted testing.

Here is the link to [getting started](http://finraos.github.io/MSL/gettingstarted.html)

Releases
========
We will be having monthly scheduled releases.
>Release 1.0 - Scheduled for end of July

Contributing
=============
We encourage contribution from the open source community to help make ExtWebDriver better. Please refer to the [development](http://finraos.github.io/MSL/contribute.html) page for more information on how to contribute to this project including sign off and the [DCO](https://github.com/FINRAOS/MSL/blob/master/DCO) agreement.

If you have any questions or discussion topics, please post them on [Google Groups](https://groups.google.com/forum/#!forum/msl_os).

Building
=========
Our project is built automatically on [Travis-CI](https://travis-ci.org/FINRAOS/MSL) for all pull requests and merge requests.

To build the Java client, please uses Maven. You can download Maven [here](http://maven.apache.org/download.cgi).
```sh
# Clone MSL git repo
git clone git://github.com/FINRAOS/MSL.git
cd msl-client-java

# Run package to compile and create jar
mvn package
```

Running Tests
==============
After you checkout the code, execute E2E tests by running [scripts/e2e-run.sh](https://github.com/FINRAOS/MSL/blob/master/scripts/e2e-run.sh) from the root folder.  This script will:

1. Install msl-server
2. Start sample app using msl-server
3. Build client
4. Run unit tests

License Type
=============
MSL project is licensed under [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)


