import mockapi
import unittest
import time
import json
import re
from selenium import webdriver


class TestSequenceFunctions(unittest.TestCase):
    

    @classmethod
    def setUpClass(self):
        '''Used to create the webdriver instance and open the page to be used for testing 
        before any test are started.
        '''
        global chrome 
        chrome = webdriver.Chrome()
        chrome.get("http://localhost:8001/msl-sample-app/index.html")
        
   
      
    def test_textResponse(self):
        '''This tests the setMockRespond method using a string and a javascript function to set up
        the format of the string.
        '''

        # Clear the autocomplete to make sure this test starts from scratch.
        autocomplete = chrome.find_element_by_id('autocomplete')        

        autocomplete.clear()
        chrome.find_element_by_id('postRequest').click()
        time.sleep(1)

        # Setup all of the needed data like request path, the response, function
        # for formatting, etc.
        configurations = {}
        configurations["requestPath"] = "/services/getlanguages"
        configurations["responseText"] = "{\"label\":\"Java\"},{\"label\":\"Perl\"}"
        configurations["contentType"] = "application/json"
        configurations["eval"] = "function (req,responseText) { return '[' + responseText + ']'; }"
        configurations["statusCode"] = "200"
        configurations["delayTime"] = "0"
        
        # Actually make the call  to register this information.
        mockapi.setMockRespond("localhost", "8001", configurations)
        
        # Trigger event that fires off request.
        autocomplete.send_keys('J')
        
        time.sleep(1)
        
        # Grab the dropdown elements and validate the data against the registered response.
        elementOne = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]')
        elementTwo = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]')

         
        assert elementOne.get_attribute("textContent") == 'Java'
        assert elementTwo.get_attribute("textContent") == 'Perl'


    def test_templateResponse(self):
        '''This tests the setMockRespond method using a template
        the format of the string.
        '''
        # Register the template that will be used later with the key-value pairs.
        mockapi.registerTemplate("localhost", "8001",
                "[{\"label\":\"{{param1}}\"},{\"label\":\"{{param2}}\"}]", "example")

        # Clear the autocomplete to make sure this test starts from scratch.
        autocomplete = chrome.find_element_by_id('autocomplete')        

        autocomplete.clear()
        chrome.find_element_by_id('postRequest').click()
        time.sleep(1)

        # Setup all of the needed data like request path, key-value pairs, and template id.        
        configurations = {}
        configurations["requestPath"] = "/services/getlanguages"
        configurations["contentType"] = "application/json"
        configurations["statusCode"] = "200"
        configurations["delayTime"] = "0"
        
        # The values that are to replace the keys in the registered template.
        keyVals = {}
        keyVals["param1"] = "German"
        keyVals["param2"] = "English"
        
        configurations["keyValues"] = keyVals
        configurations["id"] = "example"
        
        # Actually make the call  to register this information.
        mockapi.setMockRespond("localhost", "8001", configurations)

        # Trigger event that fires off request.
        autocomplete.send_keys('J')
        
        time.sleep(1)
        # Grab the dropdown elements and validate the data against the registered response.
        elementOne = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]')
        elementTwo = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]')

         
        assert elementOne.get_attribute("textContent") == 'German'
        assert elementTwo.get_attribute("textContent") == 'English'
        
        autocomplete.clear()


        
    def test_getIntercepted(self):
        '''This tests the ability to intercept, and validate intercepted, get requests. '''
        # Register the request path of the get request to be intercepted
        mockapi.setInterceptXHR("localhost", "8001", "/services/getservice")

        # Put text into input box which will be added to get request
        inputBox = chrome.find_element_by_id('getInput')
        inputBox.send_keys('GET Example')
        
        # Trigger the get request
        postButton = chrome.find_element_by_id('getRequest')
        postButton.click()
        
        time.sleep(1)

        # Retrieve all request intercepted that have the provided request path
        intercepted = json.loads(mockapi.getInterceptedXHR("localhost", "8001", "/services/getservice"))

        # Validate the method and url of the intercepted request
        req1 = intercepted['xhr_1']
        assert req1['xhr']['method'] == 'GET'
        assert req1['xhr']['url'] == '/services/getservice?term=GET+Example'
        assert req1['post'] is None


    
    def test_postIntercepted(self):
        '''This tests the ability to intercept, and validate intercepted, post requests.'''
        
        # Register the request path of the post request to be intercepted
        mockapi.setInterceptXHR("localhost", "8001", "/services/postservice")

        # Put text into input box which will be added to post request
        inputBox = chrome.find_element_by_id('output-box')
        inputBox.send_keys('POST Example')
        
        # Trigger the post request
        postButton = chrome.find_element_by_id('postRequest')
        postButton.click()
        
        time.sleep(1)

        # Retrieve all request intercepted that have the provided request path
        intercepted = json.loads(mockapi.getInterceptedXHR("localhost", "8001", "/services/postservice"))
        
        # Validate the method and url of the intercepted request
        req1 = intercepted['xhr_1']
        assert req1['xhr']['method'] == 'POST'
        assert req1['xhr']['url'] == '/services/postservice'
        matched = re.match('timestamp=\\d*&text=POST\+Example', req1['post'])
        assert matched.group(0) is not None
        assert matched.group(0) == req1['post']

        
    
    def test_unRegisterMock(self):
        '''This is used to test unregistering a request path.'''

        # Clear the autocomplete to make sure this test starts from scratch.
        autocomplete = chrome.find_element_by_id('autocomplete')        

        autocomplete.clear()
        chrome.find_element_by_id('postRequest').click()
        time.sleep(1)

        # Setup all of the needed data like request path, the response, function
        # for formatting, etc.
        configurations = {}
        configurations["requestPath"] = "/services/getlanguages"
        configurations["responseText"] = "{\"label\":\"Java\"},{\"label\":\"Perl\"}"
        configurations["contentType"] = "application/json"
        configurations["eval"] = "function (req,responseText) { return '[' + responseText + ']'; }"
        configurations["statusCode"] = "200"
        configurations["delayTime"] = "0"
        
        # Actually make the call  to register this information.
        mockapi.setMockRespond("localhost", "8001", configurations)
        
        # Trigger event that fires off request.
        autocomplete.send_keys('J')
        
        time.sleep(1)

        # Grab the dropdown elements and validate the data against the registered response to
        # make sure the initial register worked.
        elementOne = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[1]')
        elementTwo = chrome.find_element_by_xpath('.//ul[contains(@class, "ui-autocomplete")]/li[2]')

         
        assert elementOne.get_attribute("textContent") == 'Java'
        assert elementTwo.get_attribute("textContent") == 'Perl'

        # Unregister the request path
        mockapi.unRegisterMock("localhost", "8001", '/services/getlanguages')
        autocomplete.clear()
        chrome.find_element_by_id('postRequest').click()

        autocomplete.send_keys('J')
        assert elementOne.is_displayed() == False

    @classmethod
    def tearDownClass(self):
        '''Closes the browser since it is no longer needed.'''
        chrome.close()
        chrome.quit()
        
        
if __name__ == '__main__':
    unittest.main()
