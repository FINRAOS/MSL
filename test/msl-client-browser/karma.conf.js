// Karma configuration
// Generated on Fri Aug 29 2014 11:38:06 GMT-0400 (EDT)

module.exports = function(config) {

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/*.js',
      '../../msl-client-browser/mockapi-browser.js',
      '../../msl-client-browser/appcontainer-driver.js',
      'spec/MSLTestSpec.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    reporters: ['progress','junit'],

    // the default configuration
    junitReporter: {
      outputFile: 'test-results.xml',
      suite: ''
    },

    // web server port
    port: 8001,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    captureTimeout: 120000,

    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    proxies: {
      '/' : 'http://localhost:8002'
    },

    urlRoot: '/root',

  });
};
