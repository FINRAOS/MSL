/**
 * Created by k25450 on 1/17/2017.
 */
var md5 = require('md5');
var path = require('path');
var util = require('util');
var mustache = require('mustache');
var minimist = require('minimist');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');


module.exports = function (argv, callback) {
    var filePath = 'test/mock/';
    var ignoredParams = '';
    var debug = argv.debug || true;
    var localAppDir = argv.localAppDir || __dirname;
    var extensions = argv.extensions||'';

    var record = function (message, severity) {
        if (debug) {
            console.log(message);
        } else if (severity > 0 && !debug) {
            console.log(message);
        }
    };

    if (extensions != '') {
        extensions = require(path.join(localAppDir, extensions));
    } else {
        extensions= null;
    }

    var localAppMockAPI = function (req, res, next) {
        debugger;
        if (req.path == '/mock/fakerespond') {

            if (req.body.id == undefined || req.body.responseText == undefined) {
                registerMock(req.body);
                record("Mock body registered for: " + req.body.requestPath, 0);
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write('{"status":"success","message":"mock body registered"}');
                return res.end();
            } else {
                record("Provided both template ID and response text", 1);
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.write('{"status":"failed","message":"Provided both template ID and response text"}');
                return res.end();
            }

        } else if (req.path == '/mock/fakePOSTrespond') {
            if (req.body.id == undefined || req.body.responseText == undefined) {
                registerMock(req.body);
                record("Mock body and Unique ID for POST request registered for: " + req.body.requestPath, 0);
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write('{"status":"success","message":"mock body registered"}');
                return res.end();
            } else {
                record("Provided both template ID and response text", 1);
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.write('{"status":"failed","message":"Provided both template ID and response text"}');
                return res.end();
            }


        } else if (req.path == '/mock/interceptxhr') {

            registerInterceptXHR(req.body);
            record("Intercept registered for: " + req.body.requestPath, 0);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.write('{"status":"success","message":"intercept XHR registered"}');

            return res.end();

        } else if (req.path == '/mock/getinterceptedxhr') {

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.write(JSON.stringify(getInterceptedXHR(req.body)));
            delete interceptXHRMap[req.body.requestPath];

            record("Sent intercepted XHR for: " + req.body.requestPath, 0);
            return res.end();

        } else if (req.path == '/setIgnoreFlag') {

            setIgnore(req.body.requestPath)
            record("Set ignored flag for: " + req.body.requestPath, 0);

            return res.end();
        } else if (req.path == '/unregisterMock') {

            unregisterMock(req.body.requestPath);
            record("Unregisters path for: " + req.body.requestPath, 0);

            return res.end();
        } else if (req.path == '/mock/template') {

            record("Registered template for: " + req.body.id, 0);

            registerTemplate(req.body);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.write('{"status":"success","message":"template registered"}');

            return res.end();

        } else if (isFakeRespond(req)) {
            var post;
            if (req.method === 'POST') {
                var body = {};
                req.on('data', function (data) {
                    body += data;
                });
                req.on('end', function () {
                    post = body;
                });
            }
            if (req.method === 'POST') {
                var mockReqRespMapKey = req._parsedUrl.pathname + md5(JSON.stringify(req.body));
                var responseObj = mockReqRespMap[mockReqRespMapKey];
                if (responseObj == undefined) {
                    mockReqRespMapKey = req.url + md5(JSON.stringify(req.body));
                    if (mockReqRespMapKey.indexOf("?") >= 0)
                        mockReqRespMapKey = reparsePath(mockReqRespMapKey);
                    responseObj = mockReqRespMap[req.url + md5(JSON.stringify(req.body))];
                }
            } else {
                mockReqRespMapKey = req._parsedUrl.pathname;
                responseObj = mockReqRespMap[mockReqRespMapKey];
                if (responseObj == undefined) {
                    mockReqRespMapKey = req.url;
                    if (mockReqRespMapKey.indexOf("?") >= 0)
                        mockReqRespMapKey = reparsePath(mockReqRespMapKey);
                    responseObj = mockReqRespMap[req.url];
                }
            }

            if (responseObj["id"] !== undefined) {
                var template = templateMap[responseObj["id"]];
                if (template == undefined) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json'
                    });
                    res.write('{"status":"failed","message":"There is no template for the provided ID"}');
                    return res.end();
                }
                var pairs = responseObj["keyValues"];
                if (typeof pairs === 'string') {
                    pairs = JSON.parse(pairs);
                }
                var output = mustache.render(template, pairs);
                res.writeHead(responseObj["statusCode"], {
                    'Content-Type': responseObj["contentType"],
                    'Access-Control-Allow-Origin': '*'
                });

                if (responseObj["eval"] !== undefined) {
                    var f = eval("(" + responseObj["eval"] + ")");
                    res.write(f(req, output), post);
                } else {
                    res.write(output);
                }

                record("Responded with mock for: " + mockReqRespMapKey, 0);

            } else {
                res.writeHead(responseObj["statusCode"], responseObj["header"]);
                var responseText = "";
                if (responseObj["responseFile"] !== undefined) {
                    responseText = fs.readFileSync(responseObj["responseFile"]);

                } else {
                    responseText = responseObj["responseText"];
                }

                if (responseObj["delayTime"] > 0)
                    sleep(responseObj["delayTime"]);
                if (responseObj["eval"] !== undefined) {
                    var f = eval("(" + responseObj["eval"] + ")");
                    res.write(f(req, responseText), post);
                } else {
                    res.write(responseText);
                }

                record("Responded with mock for: " + mockReqRespMapKey, 0);
            }
            return res.end();
        } else if (isInterceptXHR(req)) {
            if (req.method === 'POST') {
                addInterceptedXHR(req, req.body);
            } else {
                addInterceptedXHR(req, null);
            }

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.write('{"status":"success","message":"XHR intercepted"}');

            record("Intercepted XHR for: " + req.url, 0);
            return res.end();
        } else {
            if (extensions) {
                var options = {
                    req: req,
                    res: res,
                    fs: fs,
                    localAppDir: localAppDir,
                    filePath: filePath
                };
                extensions.customUrlParsing(options);

            } else {
                //looks like it is not needed anymore
                //localApp.use(express.static(localAppDir + filePath));
                return next();

            }
        }
    };

    /**
     * Used to register mocks for mock API calls
     */
    var mockReqRespMap = {};

    /**
     * Used to for XHR interceptions
     */
    var interceptXHRMap = {};


    /**
     * Used for responding with a completed template
     */
    var templateMap = {};


    /**
     * Un-register the mock in the mockReqRespMap
     *
     * @param mapKey => URL that will be deleted from the memory, if empty will wipe out all the registered mock response.
     */
    function unregisterMock(mapKey) {
        if (mapKey !== "") {
            delete mockReqRespMap[mapKey];
        }
        else {
            mockReqRespMap = {};
        }

    }

    /**
     * Registers the mock into mockReqRespMap
     *
     * @param post => contains the fake response body
     */
    function registerMock(post) {

        var responseObj = {};
        responseObj["statusCode"] = parseInt(post.statusCode) || 200;
        responseObj["header"] = post.header || {
                'Content-Type': post.contentType || 'application/json',
                'Access-Control-Allow-Origin': '*'
            };
        responseObj["contentType"] = post.contentType || "application/json";
        if (typeof post.responseText == 'object') {

            responseObj["responseText"] = JSON.stringify(post.responseText);

        } else {
            responseObj["responseText"] = post.responseText || "This is a fake response";
        }


        responseObj["responseFile"] = post.responseFile;

        responseObj["id"] = post.id;
        responseObj["keyValues"] = post.keyValues || {};
        responseObj["eval"] = post.eval;
        responseObj["delayTime"] = parseInt(post.delayTime) || 0;

        var requestPath = post.requestPath;
        if (post.requestJSONBody == '' || post.requestJSONBody == null) {

            mockReqRespMap[requestPath] = responseObj;
        } else {
            responseObj["requestJSONBody"] = post.requestJSONBody;
            var uniqueID = md5(JSON.stringify(post.requestJSONBody));
            mockReqRespMap[requestPath + uniqueID] = responseObj;
        }
    }


    /**
     * Registers the mock into mockReqRespMap
     *
     * @param req =>
     *            contains the mock api call (request query string contains request
     *            path, fake status code, fake content type)
     * @param post =>
     *            contains the fake response
     */
    function registerTemplate(post) {
        templateMap[post.id] = post.template;
        record("Registered template: " + post.template, 0);

    }


    /**
     * Registers the interception XHRs into interceptXHRMap
     *
     * @param req => contains the mock api call (request query string contains request path)
     */
    function registerInterceptXHR(body) {
        var interceptedXHRs = [];
        var requestPath = body.requestPath;
        interceptXHRMap[requestPath] = interceptedXHRs;
    }


    /**
     * Saves intercepted XHR (url, method, body only) into interceptXHRMap
     *
     * @param req => XHR
     * @param post => post body of the request (if any)
     */
    function addInterceptedXHR(req, post) {
        var xhrObj = {};
        var lightXHR = {};
        lightXHR["url"] = req.url;
        lightXHR["method"] = req.method;
        xhrObj["xhr"] = lightXHR;
        xhrObj["post"] = post;

        if (interceptXHRMap[req.url] != undefined) {
            interceptXHRMap[req.url].push(xhrObj);
        } else {
            interceptXHRMap[req._parsedUrl.pathname].push(xhrObj);
        }
    }

    /**
     * Returns the intercepted XHRs
     *
     * @param req => XHR containing request path to look up (request query string contains request path)
     * @return returns object containing list of XHRs with key xhr_#
     */
    function getInterceptedXHR(req) {
        var requestPath = req.requestPath;
        var interceptedXHRs = interceptXHRMap[requestPath];

        var interceptedXHRsObj = {};
        var counter = 1;
        if (interceptedXHRs != undefined) {
            for (var i = 0; i < interceptedXHRs.length; i++) {
                interceptedXHRsObj["xhr_" + counter] = interceptedXHRs[i];
                counter++;
            }
        }

        return interceptedXHRsObj;
    }

    /**
     * Determines whether the request made by the path requires mock response by
     * checking mockReqRespMap.
     *
     * @param req => XHR
     * @return true/false
     */
    function isFakeRespond(req) {
        var temp = req.url.toString();
        var uniqueID = md5(JSON.stringify(req.body));
        if (temp.indexOf("?") >= 0)
            req.url = reparsePath(temp);
        if (((req.url in mockReqRespMap) && (mockReqRespMap[req.url] !== undefined)) ||
            ((req._parsedUrl.pathname in mockReqRespMap) && (mockReqRespMap[req._parsedUrl.pathname] !== undefined)) ||
            (((req.url + uniqueID) in mockReqRespMap) && (mockReqRespMap[req.url + uniqueID] !== undefined))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Determines whether the request made by the path requires interception.
     *
     * @param req => XHR
     * @return true/false
     */
    function isInterceptXHR(req) {
        if (((req.url in interceptXHRMap) && (interceptXHRMap[req.url] !== undefined)) ||
            ((req._parsedUrl.pathname in interceptXHRMap) && (interceptXHRMap[req._parsedUrl.pathname] !== undefined))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * set up the root for the mock response using file system.
     * comment out by KCH due to not fully functional, will be implemented for next release.
     * @param mockPath => root of the mock files.
     *
     */
// function setMockFilePathFunc(mockPath) {
//  	filePath = mockPath;
// }

    /**
     * set up the parameter that should be ignored when retrieving mock responses, for example, a random generated cache buster.
     * @param params => parameters in the url that needs to be ignored.
     *
     */
    function setIgnore(params) {
        ignoredParams += params;
    }

    /**
     * set up delay time of a certain response. Not exposed to the client.
     * @param time => time to be delayed, represented in millisecond.
     *
     */
    function sleep(time) {
        var stop = new Date().getTime();
        while (new Date().getTime() < stop + parseInt(time)) {

        }
    }

    /**
     * Supporting function to parse the the URL to ignore the parameters that user don't need. Not exposed to the client.
     *
     */
    function reparsePath(oldpath) {
        if (oldpath.indexOf("?") >= 0) {
            var vars = oldpath.split("?")[1].split("&");
            var result = oldpath.split("?")[0] + '?';
            var firstFlag = 0;
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (ignoredParams.search(pair[0]) < 0) {
                    if (firstFlag === 0) {
                        result = result + pair[0] + '=' + pair[1];
                        firstFlag = 1;
                    }
                    else {
                        result = result + '&' + pair[0] + '=' + pair[1];
                    }
                }
            }
            return result;
        }
        else {
            return oldpath;
        }
    }
    record(["MSL launched from here: ", localAppDir].join(" "), 1);
    record(["Process ID: ", process.pid].join(" "), 1);
    record(["Debug Mode: ", debug].join(" "), 1);

    return localAppMockAPI;
};