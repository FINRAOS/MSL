'''(C) Copyright 2014 Mock Service Layer Contributors.
 
  Licensed under the Apache License, Version 2.0 (the 'License');
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
'''  
 

import urllib2
import json


def setMockRespond(server, port, configuration):
    '''Method to register mock response. Once you register, whenever server receives a request matching
	  the registered requestPath, it will respond with a fake response
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param configuration: Json object that contains the requestPath, contentType, responseText, delayTime, headers, function.
	'''

    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/mock/fakerespond')
    xmlHttp.add_header('Content-Type', 'application/json')        
    xmlHttp.add_data(json.dumps(configuration))
    urllib2.urlopen(xmlHttp)
       
 
def registerTemplate(server, port, template, templateID):
    '''Method to register a template to be used when mocking responses. Once registered, pass the same id 
	  used to register the template along with a map containing the key-value pairs that are to be replaced.
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param template: a template in the form of a string or JSONObject that is to be used for responses
	:param id: the id to be used as a key for the template which is used when setting a fake response 
	'''   

    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/mock/template')
    configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['template'] = template
    configuration['id'] = templateID
    xmlHttp.add_header('Content-Type', 'application/json')
    xmlHttp.add_data(json.dumps(configuration))
    urllib2.urlopen(xmlHttp)   

   

def setInterceptXHR(server, port, requestPath):
    '''Method to register intercept XHR. Once you register, whenever server receives a request matching
	  the registered requestPath, it will intercept and store for later retrieval
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param requestPath: path which you want to intercept.
	 
	'''

    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/mock/interceptxhr')
    configuration = {}
    configuration['requestPath'] = requestPath
    configuration['Content-Type'] = 'application/json'
    xmlHttp.add_header('Content-Type', 'application/json')
    xmlHttp.add_data(json.dumps(configuration))
    urllib2.urlopen(xmlHttp)   
    

def getInterceptedXHR(server, port, requestPath):
    '''Method to retrieve intercepted XHRs. Use in conjunction with setInterceptXHR()
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param requestPath: path which you have intercepted
	'''

    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/mock/getinterceptedxhr')
    configuration = {}
    configuration['requestPath'] = requestPath
    configuration['Content-Type'] = 'application/json'
    xmlHttp.add_header('Content-Type', 'application/json')
    xmlHttp.add_data(json.dumps(configuration))
    response = urllib2.urlopen(xmlHttp)
    return response.read()   

   
def setParamIgnored(server, port, params):
    '''Method to set up parameters that will be ignored in the URL.
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param params: parameters that will be ignored in the app URL, type is string. 
		For example,if we set ignore paramB, URL http://aa.bb.com/result?paramA=123&paramB=456 will be treated as http://aa.bb.com/result?paramA=123
	''' 
    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/setIgnoreFlag')
    configuration = {}
    configuration['requestPath'] = params
    configuration['Content-Type'] = 'application/json'
    xmlHttp.add_header('Content-Type', 'application/json')
    xmlHttp.add_data(json.dumps(configuration))
    urllib2.urlopen(xmlHttp)     
     
  
def unRegisterMock(server, port, requestPath):
    '''Method to delete registered mock response.
	 
	:param server: url of web-server.js running on node
	:param port: port number of web-server.js running on node
	:param requestPath: mock response path that needs to be deleted, if empty then delete all the registered mock responses.
	'''   
    xmlHttp = urllib2.Request('http://' + server + ':' + str(port) + '/unregisterMock')
    configuration = {}
    configuration['requestPath'] = requestPath
    configuration['Content-Type'] = 'application/json'
    xmlHttp.add_header('Content-Type', 'application/json')
    xmlHttp.add_data(json.dumps(configuration))
    urllib2.urlopen(xmlHttp)     
    

    
      
