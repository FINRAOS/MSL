describe('Example suite', function() {

    var callbackFunc = function (req, responseText) {
	return '[' + responseText + ']';
    }
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
	
    beforeEach(function(done) {
        // Load app inside iframe
        openApp('http://localhost:8001/msl-sample-app/index.html');

        setTimeout(function() {
            done();
        }, 1000);
    });

    afterEach(function() {
        unRegisterMock('localhost', 8001, "");
    });

    it('Test for register and get mock response', function(done) {
        // Use msl-client to set mock response
        var mockResponse = {};
        mockResponse.requestPath = '/services/getlanguages';
        mockResponse.responseText = '[{"label":"apache"},{"label":"apple"}]';
        mockResponse.statusCode = 200;
        mockResponse.delayTime = 0;
        setMockRespond('localhost', 8001, mockResponse);

        // Type into first input field which triggers a REST call to return a JSON response
        getElement('#autocomplete').val('a');
        getElement('#autocomplete').keydown();

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response
            expect(getElement('ul li:nth-of-type(1)').text()).toBe('apache');
            expect(getElement('ul li:nth-of-type(2)').text()).toBe('apple');

            // Click on the Second item from the drop down
            getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect(getElement('#autocomplete').val()).toBe('apple');

            done();
        }, 1000);
    });
	
	
    it('Test for register and get mock response using function', function(done) {
        // Use msl-client to set mock response
        var mockResponse = {};
        mockResponse.requestPath = '/services/getlanguages';
        mockResponse.responseText = '{"label":"apache"},{"label":"apple"}';
	mockResponse.eval = callbackFunc;
        mockResponse.statusCode = 200;
        mockResponse.delayTime = 0;
        setMockRespond('localhost', 8001, mockResponse);

        // Type into first input field which triggers a REST call to return a JSON response
        getElement('#autocomplete').val('a');
        getElement('#autocomplete').keydown();

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response
            expect(getElement('ul li:nth-of-type(1)').text()).toBe('apache');
            expect(getElement('ul li:nth-of-type(2)').text()).toBe('apple');

            // Click on the Second item from the drop down
            getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect(getElement('#autocomplete').val()).toBe('apple');

            done();
        }, 1000);
    });
	
    it('Test setup mock response with template', function(done) {

        // Registering the template that will be used for the response
        registerTemplate('localhost', 8001,
            '[{"label":"{{param1}}"},{"label":"{{param2}}"}]', 'example');
        // Set up the object that contains our response configuration
        var configurations = {};
        configurations.requestPath = '/services/getlanguages';
        configurations.contentType = 'application/json';
        configurations.id = 'example';
        configurations.keyValues = {
            'param1': 'Boat',
            'param2': 'Cat'
        };
        configurations.statusCode = 200;
        configurations.delayTime = 0;
        // Use msl-client to set mock response
        setMockRespond('localhost', 8001, configurations);

        // Type into first input field which triggers a REST call to return a JSON response
        getElement('#autocomplete').val('b');
        getElement('#autocomplete').keydown();

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response using template
            expect(getElement('ul li:nth-of-type(1)').text()).toBe('Boat');
            expect(getElement('ul li:nth-of-type(2)').text()).toBe('Cat');

            // Click on the first item from the drop down
            getElement('.ui-autocomplete .ui-menu-item:nth-of-type(1)').click();

            // Validate that correct item was selected
            expect(getElement('#autocomplete').val()).toBe('Boat');

            done();
        }, 1000);
    });

    it('Test XHR intercept, Get method', function(done) {
        // Use msl-client to register intercept
        setInterceptXHR('localhost', 8001, '/services/getservice');

        // Type into second input field and click GET button which triggers a GET request
        getElement('#getInput').val('testGet');
        getElement('#getRequest').click();

        // Retrieve intercepted XHR and validate correct GET request was made by the app
        getInterceptedXHR('localhost', 8001, '/services/getservice', function(resp) {
            var intrReq = JSON.parse(resp).xhr_1;
            expect(intrReq.xhr.url).toBe('/services/getservice?term=testGet');
            expect(intrReq.xhr.method).toBe('GET');
        });
        done();
    });
    
    it('Test XHR intercept, Post method', function(done) {
		// Use msl-client to register intercept
		setInterceptXHR('localhost', 8001, '/services/postservice');

		// Type into second input field and click GET button which triggers a GET request
		getElement('#output-box').val('testPost');
		getElement('#postRequest').click();

		setTimeout(function () {
			// Retrieve intercepted XHR and validate correct POST request was made by the app
			getInterceptedXHR('localhost', 8001, '/services/postservice', function (resp) {
				var intrReq = JSON.parse(resp).xhr_1;
				var regex = new RegExp('\\d*');
				expect(intrReq.xhr.url).toBe('/services/postservice');
				
				expect(regex.test(intrReq.post['timestamp'])).toBe(true);
				expect(intrReq.post['text']).toBe('testPost');
				expect(intrReq.xhr.method).toBe('POST');

			});

			done();
		}, 1000);
    });

    it('Test for setting the delay time of returning a mock response', function(done) {
		// Use msl-client to set mock response
		var mockResponse = {};
		mockResponse.requestPath = '/services/getlanguages?term=abc';
		mockResponse.responseText = '[{"label":"apache"},{"label":"apple"}]';
		mockResponse.statusCode = 200;
		mockResponse.delayTime = 3000;
		setMockRespond('localhost', 8001, mockResponse);

		// Type into first input field which triggers a REST call to return a JSON response
		getElement('#autocomplete').val('abc');
		getElement('#autocomplete').keydown();

		// Validate that the response is delayed
		expect(getElement('.ui-autocomplete .ui-menu-item:nth-of-type(1)').size()).toBe(0);
		expect(getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').size()).toBe(0);

		setTimeout(function () {
			// Validate the drop down is display correctly with mock response
			expect(getElement('ul li:nth-of-type(1)').text()).toBe('apache');
			expect(getElement('ul li:nth-of-type(2)').text()).toBe('apple');

			// Click on the Second item from the drop down
			getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();
			setTimeout(function () {
				// Validate that correct item was selected
				expect(getElement('#autocomplete').val()).toBe('apple');
				done();
			}, 500);

		}, 3500);
    });

    it('Test unRegisterMock function', function(done) {
        // Use msl-client to set mock response
        var mockResponse = {};
        mockResponse.requestPath = '/services/getlanguages';
        mockResponse.responseText = '[{"label":"Ice Cream"},{"label":"Candy"}]';
        mockResponse.statusCode = 200;
        mockResponse.delayTime = 0;
        setMockRespond('localhost', 8001, mockResponse);

        // Type into first input field which triggers a REST call to return a JSON response
        getElement('#autocomplete').val('I');
        getElement('#autocomplete').keydown();

        setTimeout(function() {
            // Click on the first item from the drop down
            expect(getElement('ul li:nth-of-type(1)').text()).toBe('Ice Cream');
            expect(getElement('ul li:nth-of-type(2)').text()).toBe('Candy');

            getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

	    setTimeout(function() {
              // Validate that correct item was selected
              expect(getElement('#autocomplete').val()).toBe('Candy');
	      // Reload Page
              openApp('http://localhost:8001/msl-sample-app/index.html');
	      setTimeout(function() {
                unRegisterMock('localhost', 8001, '/services/getlanguages');
              	getElement('#autocomplete').val('I');
                expect(getElement('.ui-autocomplete .ui-menu-item:nth-of-type(2)').size()).toBe(0);
		done();
	      }, 1000);
	    }, 1000);
	}, 1000);
    });

    it('Test mocking POST ajax success', function(done) {
      // Use msl-client to set mock response
      setMockRespond('localhost', 8001, {"requestPath":"/services/postservice", "responseText":'{"outputBoxValue":"hello"}'});

      // Type hellomsl on text area and click POST button
      getElement('#output-box').val('hellomsl');
      getElement('#postRequest').click();
      
      setTimeout(function() {
        // Validate that postResult span is populated with the text 'hello' which was the success call from the ajax call
        expect(getElement('#postResult').text()).toBe('hello');
        done();
      }, 1000);
    });
});
