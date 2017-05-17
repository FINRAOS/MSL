#!/usr/bin/env node
/*
 * (C) Copyright 2014 Mock Service Layer Contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


var express = require('express');
var mustache = require('mustache');
var minimist = require('minimist');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var util = require('util');
var md5 = require('md5');
var mslMiddleware = require('./mslMiddleware.js');
var mslRouter = express.Router();

exports = module.exports = function (argv, callback) {
    var localApp;
    var DEFAULT_PORT;
    var filePath = 'test/mock/';
    var ignoredParams = '';
    var debug = true;
    var argv1;
    var localAppDir;
    var getextensions;
    var port;

    var record = function (message, severity) {
        if (debug) {
            util.puts(message);
        } else if (severity > 0 && !debug) {
            util.puts(message);
        }
    };
    console.log('the process argv are' + process.argv[0] + '\n' + process.argv[1] + '\n' + process.argv[2]);
    var conf = {};

    if (process.argv.slice(2).toString().search('conf.js') > 0)
        conf = require(path.join(process.cwd(), process.argv.slice(2)[0].toString()));

    localApp = express();
    DEFAULT_PORT = 8000;
    argv1 = minimist(process.argv.slice(2)) || '';
    if (argv != null) {
        argv1 = argv;
    }
    localAppDir = conf.basedir || argv1.basedir || process.cwd() || '';

    //get extension files
    getextensions = conf.extensions || argv1.extensions || '';

    console.log(getextensions);
    port = conf.port || Number(argv1.port) || DEFAULT_PORT;
    debug = (conf.debug || argv1.debug === 'true');

    var options = {
        localApp: localApp,
        DEFAULT_PORT: DEFAULT_PORT,
        filePath: filePath,
        ignoredParams: ignoredParams,
        debug: debug,
        argv1: argv1,
        localAppDir: localAppDir,
        extensions: getextensions,
        port: port
    };

    var localAppMockAPI = mslMiddleware(options);
    mslRouter.use(localAppMockAPI);

    console.log('MSL is launched as an independent server');
    localApp.use(express.static(localAppDir));
    localApp.use(bodyParser.json()); // for parsing application/json
    localApp.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
    localApp.use(multer()); // for parsing multipart/form-data
    localApp.use(mslRouter);
    localApp.listen(port);

    record(["MSL start on port:", port].join(" "), 1);


    //Get the callback
    if (callback != null) return callback(localApp);
};
