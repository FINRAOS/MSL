require 'msl-client'
require 'test/unit'
require 'json'
require  'selenium-webdriver'


class MockapiTest < Test::Unit::TestCase
		class << self
			# Sets up the webdriver before before starting the tests.
			def startup
				ENV['HTTP_PROXY'] = ENV['http_proxy'] = nil
				$driver = Selenium::WebDriver.for :chrome
				$driver.navigate.to 'http://localhost:8001/msl-sample-app/index.html'
			end
		
			# Kills the webdriver instance when all tests are finished.
			def shutdown
				$driver.quit
			end
        end
		
		# This is used to test the basic text response. A function is executed
		# on the web-server to format the text.
		def testTextResponse
		
			# Clear the autocomplete to make sure this test starts from scratch.
			autocomplete = $driver.find_element(:id => 'autocomplete')        
			autocomplete.clear()
			# Take focus off of the autocomplete box to make sure the dropdown
			# goes away.
			$driver.find_element(:id => 'postRequest').click()
			sleep(1)
			
			# Setup all of the needed data like request path, the response, function
			# for formatting, etc.
			configurations = {}
			configurations['requestPath'] = '/services/getlanguages'
			configurations['responseText'] = '{"label":"Java"},{"label":"Perl"}'
			configurations['contentType'] = 'application/json'
			configurations['eval'] = 'function (req,responseText) { return "[" + responseText + "]"; }'
			configurations['statusCode'] = '200'
			configurations['delayTime'] = '0'
			
			# Actually make the call  to register this information.
			setMockRespond('localhost', 8001,configurations.to_json)
			
			# Trigger event that fires off request.
			autocomplete.send_keys 'J'
			
			# Grab the dropdown elements and validate the data against the registered response.
			wait = Selenium::WebDriver::Wait.new(:timeout => 10)
			wait.until {$driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]').displayed?}
			optionOne = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]')
			optionTwo = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[2]')
			
			
			assert_equal('Java',optionOne.text)
			assert_equal('Perl',optionTwo.text)
			
		end
	
		# This tests using a template to generate a response.
		def testTemplateResponse
		
			# Clear the autocomplete to make sure this test starts from scratch.
			autocomplete = $driver.find_element(:id => 'autocomplete')        
			autocomplete.clear()
			# Take focus off of the autocomplete box to make sure the dropdown
			# goes away.
			$driver.find_element(:id => 'postRequest').click()
			sleep(1)

			# Register the template that will be used later with the key-value pairs.
			registerTemplate('localhost', 8001,
                '[{"label":"{{param1}}"},{"label":"{{param2}}"}]', 'example')
			
			# Setup all of the needed data like request path, key-value pairs, and template id.
			configurations = {}
			configurations['requestPath'] = '/services/getlanguages'
			configurations['contentType'] = 'application/json'
			configurations['statusCode'] = '200'
			configurations['delayTime'] = '0'
			
			# The values that are to replace the keys in the registered template.
			keyVals = {}
			keyVals['param1'] = 'German'
			keyVals['param2'] = 'English'
			
			configurations['keyValues'] = keyVals
			configurations['id'] = 'example'
			
			# Actually make the call  to register this information.
			setMockRespond('localhost', 8001,configurations.to_json)
			
			# Trigger event that fires off request.
			autocomplete.send_keys 'J'
			
			# Grab the dropdown elements and validate the data against the registered response.
			wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds
			wait.until {$driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]').displayed?}
			optionOne = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]')
			optionTwo = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[2]')
			
			assert_equal('German',optionOne.text)
			assert_equal('English',optionTwo.text)
			
		end
		
		# This tests the ability to intercept, and validate intercepted, get requests.
		def test_getIntercepted
			# Register the request path of the get request to be intercepted
			setInterceptXHR('localhost', 8001, '/services/getservice')

			# Put text into input box which will be added to get request
			inputBox = $driver.find_element(:id => 'getInput')
			inputBox.send_keys 'GET Example'
			
			# Trigger the get request
			postButton = $driver.find_element(:id =>'getRequest')
			postButton.click()
			
			sleep(1)
			# Retrieve all request intercepted that have the provided request path
			intercepted = JSON.parse(getInterceptedXHR('localhost', '8001', '/services/getservice'))

			# Validate the method and url of the intercepted request
			req1 = intercepted['xhr_1']
			assert_equal('GET',req1['xhr']['method'])
			assert_equal('/services/getservice?term=GET+Example', req1['xhr']['url'])
			assert_equal(nil, req1['post'])
		end
		
		
		# This tests the ability to intercept, and validate intercepted, post requests.
		def test_postIntercepted
			# Register the request path of the post request to be intercepted
			setInterceptXHR('localhost', 8001, '/services/postservice')

			# Put text into input box which will be added to post request
			inputBox = $driver.find_element(:id => 'output-box')
			inputBox.send_keys 'POST Example'
			
			# Trigger the post request
			postButton = $driver.find_element(:id =>'postRequest')
			postButton.click()
			
			sleep(1)
			
			# Retrieve all request intercepted that have the provided request path
			intercepted = JSON.parse(getInterceptedXHR('localhost', '8001', '/services/postservice'))
			
			# Validate the method and url of the intercepted request
			req1 = intercepted['xhr_1']
			assert_equal('POST',req1['xhr']['method'])
			assert_equal('/services/postservice', req1['xhr']['url'])
			assert_equal(req1['post'], req1['post'][/timestamp=\d*&text=POST\+Example/])
		end
		
		
		
		# This is used to test unregistering a request path.
		def testUnRegisterMock
		
			# Clear the autocomplete to make sure this test starts from scratch.
			autocomplete = $driver.find_element(:id => 'autocomplete')        
			autocomplete.clear()
			# Take focus off of the autocomplete box to make sure the dropdown
			# goes away.
			$driver.find_element(:id => 'postRequest').click()
			sleep(1)
			
			# Setup all of the needed data like request path, the response, function
			# for formatting, etc.
			configurations = {}
			configurations['requestPath'] = '/services/getlanguages'
			configurations['responseText'] = '[{"label":"Java"},{"label":"Perl"}]'
			configurations['contentType'] = 'application/json'
			configurations['statusCode'] = '200'
			configurations['delayTime'] = '0'
			
			# Actually make the call  to register this information.
			setMockRespond('localhost', 8001,configurations.to_json)
			
			# Trigger event that fires off request.
			element = $driver.find_element(:id => 'autocomplete')
			element.send_keys 'J'
			
			# Grab the dropdown elements and validate the data against the registered response to make sure
			# it worked before unregistering.
			wait = Selenium::WebDriver::Wait.new(:timeout => 10)
			wait.until {$driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]').displayed?}
			optionOne = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]')
			optionTwo = $driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[2]')
			
			
			assert_equal('Java',optionOne.text)
			assert_equal('Perl',optionTwo.text)
			
			# Unregister the request path
            unRegisterMock('localhost', 8001, '/services/getlanguages');
			autocomplete.clear()
			$driver.find_element(:id => 'postRequest').click()
			element.send_keys 'J'

			assert_true(!$driver.find_element(:xpath => './/ul[contains(@class, "ui-autocomplete")]/li[1]').displayed?)

			
		end
end