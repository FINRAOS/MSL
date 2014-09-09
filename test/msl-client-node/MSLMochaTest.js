// This allows for the use of the msl-client API
var msl = require('msl-client');

var assert = require('assert'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
    webdriver = require('selenium-webdriver');


var server = new SeleniumServer('./selenium-server-standalone-2.39.0.jar', {
    port: 4444
});
server.start();

describe('Running Selenium tests', function() {
    var client;
    this.timeout(50000);

    var callbackFunc = function(req, responseText) {
        return '[' + responseText + ']';
    }

    before(function() {
        // Builds the webdriver before the tests start.
        client = new webdriver.Builder().
        usingServer(server.address()).
        withCapabilities(webdriver.Capabilities.chrome()).build();
    });

    beforeEach(function(done) {
        // Navigate to the URL for each test and wait for the autocomplete to be present
        client.get('http://localhost:8001/msl-sample-app/index.html');
        var element = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]'));
        element.getText().then(function() {
            done();
        });

    });

    after(function(done) {
        // After the tests are done, the webdriver is killed
        client.quit().then(function() {
            done();
        });
    });

    it('The dropdown should appear and contain the mocked data', function(done) {
        // Set up the object that contains our response configuration
        var configurations = {};
        configurations.requestPath = '/services/getlanguages';
        configurations.responseText = '{"label":"Java"},{"label":"Perl"}';
        configurations.contentType = 'application/json';
        configurations.eval = callbackFunc.toString();
        configurations.statusCode = 200;
        configurations.delayTime = 0;

        // Setting up the mock response using the configuration
        msl.setMockRespond('localhost', 8001, configurations);

        // Triggering the event
        var autocomplete = client.findElement(webdriver.By.xpath('.//*[@id="autocomplete"]'));
        client.executeScript('$("#autocomplete").val("J")');
        client.executeScript('$("#autocomplete").keydown()');

        // Wait for the dropdown elements to appear
        client.wait(function() {
            return client.isElementPresent(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
        }, 500);

        // Get the elements from the dropdown to check the values
        var optionOne = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
        var optionTwo = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]'));

        // Verify that the options are from the mocked response
        optionOne.getText().then(function(title) {
            assert.equal('Java', title);
        });
        optionTwo.getText().then(function(title) {
            assert.equal('Perl', title);
            done();
        });
    });
	
	
	it('Uses an actual function to format response', function (done) {
		// Set up the object that contains our response configuration
		var configurations = {};
		configurations.requestPath = '/services/getlanguages';
		configurations.responseText = '{"label":"Turbo Pascal"},{"label":"C#"}';
		configurations.contentType = 'application/json';
		configurations.eval = callbackFunc;
		configurations.statusCode = 200;
		configurations.delayTime = 0;

		// Setting up the mock response using the configuration
		msl.setMockRespond('localhost', 8001, configurations);

		// Triggering the event
		var autocomplete = client.findElement(webdriver.By.xpath('.//*[@id="autocomplete"]'));
		client.executeScript('$("#autocomplete").val("J")');
		client.executeScript('$("#autocomplete").keydown()');

		//Wait for the dropdown elements to appear
		client.wait(function () {
			return client.isElementPresent(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
		}, 500);

		//Get the elements from the dropdown to check the values
		var optionOne = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
		var optionTwo = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]'));

		// Verify that the options are from the mocked response
		optionOne.getText().then(function (title) {
			assert.equal('Turbo Pascal', title);
		});
		optionTwo.getText().then(function (title) {
			assert.equal('C#', title);
			done();
		});
	});


    it('The dropdown should appear and contain the template data', function(done) {

        // Registering the template that will be used for the response
        msl.registerTemplate('localhost', 8001,
            '[{"label":"{{param1}}"},{"label":"{{param2}}"}]', 'example');
        // Set up the object that contains our response configuration
        var configurations = {};
        configurations.requestPath = '/services/getlanguages';
        configurations.contentType = 'application/json';
        configurations.id = 'example';
        configurations.keyValues = {
            'param1': 'German',
            'param2': 'English'
        };
        configurations.statusCode = 200;
        configurations.delayTime = 0;

        // Setting up the mock response using the configuration
        msl.setMockRespond('localhost', 8001, configurations);

        // Triggering the event
        var autocomplete = client.findElement(webdriver.By.xpath('.//*[@id="autocomplete"]'));
        client.executeScript('$("#autocomplete").val("JA")');
        client.executeScript('$("#autocomplete").keydown()');

        // Wait for the dropdown elements to appear
        client.wait(function() {
            return client.isElementPresent(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
        }, 500);

        // Get the elements from the dropdown to check the values
        var optionOne = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
        var optionTwo = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]'));

        // Verify that the options are from the mocked response
        optionOne.getText().then(function(title) {
            assert.equal('German', title);
        });
        optionTwo.getText().then(function(title) {
            assert.equal('English', title);
            done();
        });

    });

    it('Testing validation of get requests', function(done) {
        // Set up the callback function that will be called when the intercepted http requests
        // are retrieved to validate the data
        var getValidation = function(responseText) {
                var response = JSON.parse(responseText);
                var body = response.xhr_1;
                assert.equal(body.xhr.url, '/services/getservice?term=GET+Example');
                assert.equal(body.xhr.method, 'GET');
                done();
            }
            // Registering the request path that http requests will be intercepted for
        msl.setInterceptXHR('localhost', 8001, '/services/getservice');

        // Triggering the event
        client.executeScript('$("#getInput").val("GET Example")');
        client.executeScript('$("#getRequest").click()');

        // Pausing and then retrieving all of the intercepted http requests before validating
        setTimeout(function() {
            msl.getInterceptedXHR('localhost', 8001, '/services/getservice', getValidation);
        }, 500);

    });

    it('Testing validation of post requests', function(done) {
        // Set up the callback function that will be called when the intercepted http requests
        // are retrieved to validate the data
        var postValidation = function(responseText) {
            var response = JSON.parse(responseText);
            var body = response.xhr_1;
            var regex = new RegExp('timestamp=\\d*&text=POST\\+Example');
            assert.equal(body.xhr.url, '/services/postservice');
            assert.equal(true, regex.test(body.post));
            assert.equal(body.xhr.method, 'POST');

            done();
        }

        // Registering the request path that http requests will be intercepted for
        msl.setInterceptXHR('localhost', 8001, '/services/postservice');

        // Triggering the event
        client.executeScript('$("#output-box").val("POST Example")');
        client.executeScript('$("#postRequest").click()');

        // Pausing and then retrieving all of the intercepted http requests before validating
        setTimeout(function() {
            msl.getInterceptedXHR('localhost', 8001, '/services/postservice', postValidation);
        }, 500);

    });

    it('Testing unRegisterMock', function(done) {

        // Set up the object that contains our response configuration
        var configurations = {};
        configurations.requestPath = '/services/getlanguages';
        configurations.responseText = '[{"label":"French"},{"label":"Spanish"}]';
        configurations.contentType = 'application/json';
        configurations.statusCode = 200;
        configurations.delayTime = 0;

        // Setting up the mock response using the configuration
        msl.setMockRespond('localhost', 8001, configurations);

        // Triggering the event
        var autocomplete = client.findElement(webdriver.By.xpath('.//*[@id="autocomplete"]'));
        client.executeScript('$("#autocomplete").val("JA")');
        client.executeScript('$("#autocomplete").keydown()');

        // Wait for the dropdown to appear
        client.wait(function() {
            return client.isElementPresent(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));
        }, 5000);

        // Getting the first element from the list
        var optionOne = client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]'));

        // Verify that the options are from the mocked response and then unregistering that mock
        optionOne.getText().then(function(title) {
            assert.equal('French', title);
            msl.unRegisterMock('localhost', 8001, '/services/getlanguages');

            // Used to remove focus from the input to make sure dropdown disappears
            client.executeScript('$("#autocomplete").blur()');
        });

        // Triggering the event again
        client.executeScript('$("#autocomplete").val("J")');
        client.executeScript('$("#autocomplete").keydown()');

        // Validating that the first element is now no longer present
        client.findElement(webdriver.By.xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]')).
        then(function(element) {
            element.isDisplayed().then(function(displayed) {
                assert.equal(false, displayed);
                done();
            });

        });

    });
});
