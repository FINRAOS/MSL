MSL [![Build Status](https://secure.travis-ci.org/FINRAOS/MSL.png?branch=master)](http://travis-ci.org/FINRAOS/MSL)
===
[MSL](http://finraos.github.io/MSL/) (pronounced 'Missile') stands for Mock Service Layer. Our tools enable quick local deployment of your UI code on Node and mocking of your service layer for fast, targeted testing.

Here is the link to [getting started](http://finraos.github.io/MSL/gettingstarted.html)

Installation
=============
Use the following command to install MSL Server
```bash
npm install msl-server
```

Use the following command to install MSL Server globally
```bash
npm install -g msl-server
```

Running MSL Server
===================
Launching MSL Server for local installation
```bash
./node_modules/msl-server/bin/msl [options]
```

Launching MSL Server for global installation
```bash
msl [options]
```

Available options for MSL server

* --port => specify the port that server will be listening on local host, default is 8000. 
* --basedir => specify the root directory(absolute path) of the app you want to launch locally, default is the directory where you run the command. 
* --debug => specify whether to output log in console or not, default is false. 
* --extensions => specify extension files you want to plugin to MSL to parse URL differently.

An example of how the options work
```bash
msl --basedir=/approot --port=8001 --debug=true
```

You can also use config file to include options for launching MSL server
An example of how the config file works
```bash
msl msl.conf.js(*.conf.js)
```
Here is the template for config file
```javascript
#!/usr/bin/env node

module.exports = {
    port: 8001,
    basedir: '.'
    debug: false,
    extensions: 'test/e2e/parseUrl.js'
};
```

Template of the extension file
```javascript
exports.customUrlParsing = function (options) {
      if (options.req.url.search('origURL')>0){
          var str = options.req.url
          var newUrl = str.replace('origURL','newUrl');
          options.res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});
          options.res.write('{"status":"url changed","message":"find the response with different url now"}');
      }
      else {
          options.res.writeHead(500, {'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});
          options.res.write('{"status":"error","message":"can not find response"}');
      }
};

```

Contributing
=============
We encourage contribution from the open source community to help make MSL better. Please refer to the [development](http://finraos.github.io/MSL/contribute.html) page for more information on how to contribute to this project including sign off and the [DCO](https://github.com/FINRAOS/MSL/blob/master/DCO) agreement.

If you have any questions or discussion topics, please post them on [Google Groups](https://groups.google.com/forum/#!forum/msl_os).

Building
=========
Our project is built automatically on [Travis-CI](https://travis-ci.org/FINRAOS/MSL) for all pull requests and merge requests.

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


