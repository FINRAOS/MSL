describe('Example suite', function() {

	var callbackFunc = function (req, responseText) {
		return '[' + responseText + ']';
	}
	
    beforeEach(function(done) {
        // Load app inside iframe
        $('#app').attr('src', 'http://localhost:8001/msl-sample-app/index.html');

        setTimeout(function() {
            done();
        }, 100);
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
        $('#app').contents().find('#autocomplete').val('a');
        frames[0].window.eval('$("#autocomplete").keydown()');

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response
            expect(frames[0].window.eval('$("ul li:nth-of-type(1)").text()')).toBe('apache');
            expect(frames[0].window.eval('$("ul li:nth-of-type(2)").text()')).toBe('apple');

            // Click on the Second item from the drop down
            $('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect($('#app').contents().find('#autocomplete').val()).toBe('apple');

            setTimeout(function() {
                done();
            }, 100);
        }, 500);
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
        $('#app').contents().find('#autocomplete').val('a');
        frames[0].window.eval('$("#autocomplete").keydown()');

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response
            expect(frames[0].window.eval('$("ul li:nth-of-type(1)").text()')).toBe('apache');
            expect(frames[0].window.eval('$("ul li:nth-of-type(2)").text()')).toBe('apple');

            // Click on the Second item from the drop down
            $('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect($('#app').contents().find('#autocomplete').val()).toBe('apple');

            setTimeout(function() {
                done();
            }, 100);
        }, 500);
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
        $('#app').contents().find('#autocomplete').val('b');
        frames[0].window.eval('$("#autocomplete").keydown()');

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response using template
            expect(frames[0].window.eval('$("ul li:nth-of-type(1)").text()')).toBe('Boat');
            expect(frames[0].window.eval('$("ul li:nth-of-type(2)").text()')).toBe('Cat');

            // Click on the first item from the drop down
            $('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(1)').click();

            // Validate that correct item was selected
            expect($('#app').contents().find('#autocomplete').val()).toBe('Boat');

            setTimeout(function() {
                done();
            }, 100);
        }, 500);
    });

    it('Test XHR intercept, Get method', function(done) {
        // Use msl-client to register intercept
        setInterceptXHR('localhost', 8001, '/services/getservice');

        // Type into second input field and click GET button which triggers a GET request
        $('#app').contents().find('#getInput').val('testGet');
        $('#app').contents().find('#getRequest').click();
        setTimeout(function() {
            done();
        }, 500);
        setTimeout(function() {
            // Retrieve intercepted XHR and validate correct GET request was made by the app
            getInterceptedXHR('localhost', 8001, '/services/getservice', function(resp) {
                var intrReq = JSON.parse(resp).xhr_1;
                expect(intrReq.xhr.url).toBe('/services/getservice?term=testGet');
                expect(intrReq.xhr.method).toBe('GET');
            }, 500);
        });
    });

    it('Test XHR intercept, Post method', function(done) {
        // Use msl-client to register intercept
        setInterceptXHR('localhost', 8001, '/services/postservice');

        // Type into second input field and click GET button which triggers a GET request
        $('#app').contents().find('#output-box').val('testPost');
        $('#app').contents().find('#postRequest').click();
        setTimeout(function() {
            done();
        }, 500);
        setTimeout(function() {
            // Retrieve intercepted XHR and validate correct GET request was made by the app
            getInterceptedXHR('localhost', 8001, '/services/postservice', function(resp) {
                var intrReq = JSON.parse(resp).xhr_1;
				var regex = new RegExp('timestamp=\\d*&text=testPost');
				expect(intrReq.xhr.url).toBe('/services/postservice');
				expect(regex.test(body.post)).toBe(true);
				expect(body.xhr.method).toBe('POST');
            }, 500);
        });
    });

    it('Test for setting the delay time of returning a mock response', function(done) {
        // Use msl-client to set mock response
        var mockResponse = {};
        mockResponse.requestPath = '/services/getlanguages';
        mockResponse.responseText = '[{"label":"apache"},{"label":"apple"}]';
        mockResponse.statusCode = 200;
        mockResponse.delayTime = 3000;
        setMockRespond('localhost', 8001, mockResponse);

        // Type into first input field which triggers a REST call to return a JSON response
        $('#app').contents().find('#autocomplete').val('a');
        frames[0].window.eval('$("#autocomplete").keydown()');

        setTimeout(function() {
            // Validate that the response is delayed
            expect($('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(1)').size()).toBe(0);
            expect($('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').size()).toBe(0);
        }, 1000);

        setTimeout(function() {
            // Validate the drop down is display correctly with mock response
            expect(frames[0].window.eval('$("ul li:nth-of-type(1)").text()')).toBe('apache');
            expect(frames[0].window.eval('$("ul li:nth-of-type(2)").text()')).toBe('apple');

            // Click on the Second item from the drop down
            $('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect($('#app').contents().find('#autocomplete').val()).toBe('apple');

            setTimeout(function() {
                done();
            }, 100);
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
        $('#app').contents().find('#autocomplete').val('I');
        frames[0].window.eval('$("#autocomplete").keydown()');

        setTimeout(function() {
            // Click on the first item from the drop down
            expect(frames[0].window.eval('$("ul li:nth-of-type(1)").text()')).toBe('Ice Cream');
            expect(frames[0].window.eval('$("ul li:nth-of-type(2)").text()')).toBe('Candy');

            $('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').click();

            // Validate that correct item was selected
            expect($('#app').contents().find('#autocomplete').val()).toBe('Candy');

            // Reload Page
            $('#app').attr('src', 'http://localhost:8001/msl-sample-app/index.html');

            setTimeout(function() {
                done();
            }, 1500);
        }, 500);

        setTimeout(function() {
            unRegisterMock('localhost', 8001, '/services/getlanguages');
            $('#app').contents().find('#autocomplete').val('I');
            expect($('#app').contents().find('.ui-autocomplete .ui-menu-item:nth-of-type(2)').size()).toBe(0);
        }, 1500);
    });

    it('Test mocking POST ajax success', function(done) {
      // Use msl-client to set mock response
      setMockRespond('localhost', 8001, {"requestPath":"/services/postservice", "responseText":'{"outputBoxValue":"hello"}'});

      // Type hellomsl on text area and click POST button
      $('#app').contents().find('#output-box').val('hellomsl');
      $('#app').contents().find('#postRequest').click();

      setTimeout(function() {
        // Validate that postResult span is populated with the text 'hello' which was the success call from the ajax call
        expect($('#app').contents().find('#postResult').text()).toBe('hello');
        done();
      }, 500);
    });

});
