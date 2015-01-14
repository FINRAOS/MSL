module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'appcontainer-driver.js',
            'test/**/*-spec.js'
        ],
        reporters: ['mocha'],
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
