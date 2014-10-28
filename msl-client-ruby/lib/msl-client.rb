#
# (C) Copyright 2014 Mock Service Layer Contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 

require 'net/http'
require 'json'
require 'uri'


# Method to register mock response. Once you register, whenever
# server receives a request matching the registered requestPath, it will
# respond with a fake response using the provided JSONObject's information.
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +configurations+:: the JSONObject that contains all of the options (content type, requestPath, etc)
def setMockRespond(server, port, configurations)
	uri = URI('http://' + server +  ':' + port.to_s + '/mock/fakerespond')
	req = Net::HTTP::Post.new uri.path
	req.body = configurations

	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end

end


# Method to register mock response. Once you register, whenever
# server receives a request matching the registered requestPath, it will
# respond with a fake response using the provided JSONObject's information.
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +template+:: the template that is to be registered for later use
# +id+:: key used to indicate which template is to be used when mocking a response
def registerTemplate(server, port, template, id)
	uri = URI('http://' + server +  ':' + port.to_s + '/mock/template')
	req = Net::HTTP::Post.new uri.path
	configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['template'] = template
    configuration['id'] = id
	req.body = configuration.to_json
	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end

end

# Method to register intercept XHR. Once you register, whenever
# server receives a request matching the registered requestPath, it will
# intercept and store for later retrieval
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +requestPath+:: path which you want to mock a fake response with
def setInterceptXHR(server, port, requestPath)
	uri = URI('http://' + server +  ':' + port.to_s + '/mock/interceptxhr')
	req = Net::HTTP::Post.new uri.path
	configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['requestPath'] = requestPath
	req.body = configuration.to_json

	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end
end

# Method to retrieve intercepted XHRs. Use in conjunction with
# setInterceptXHR()
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +requestPath+:: path which you want to mock a fake response with
def getInterceptedXHR(server, port, requestPath)
	uri = URI('http://' + server +  ':' + port.to_s + '/mock/getinterceptedxhr')
	req = Net::HTTP::Post.new uri.path
	configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['requestPath'] = requestPath
	req.body = configuration.to_json

	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end
	
	return res.body
end

# Method to set up parameters that will be ignored in the URL.
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +params+:: parameters that will be ignored in the app URL, type is string. 
def setParamIgnored(server, port, params)
	uri = URI('http://' + server +  ':' + port.to_s + '/setIgnoreFlag')
	req = Net::HTTP::Post.new uri.path
	configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['requestPath'] = requestPath
	req.body = configuration.to_json

	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end
end

# This allows for the removal of all registered mocks once they are no longer in
# use.
# Params:
# +server+:: url of web-server.js running on node
# +port+:: port number of web-server.js running on node
# +requestPath+:: path which you want to mock a fake response with
def unRegisterMock(server, port, requestPath)
	uri = URI('http://' + server +  ':' + port.to_s + '/unregisterMock')
	req = Net::HTTP::Post.new uri.path
	configuration = {}
    configuration['Content-Type'] = 'application/json'
    configuration['requestPath'] = requestPath
	req.body = configuration.to_json

	res = Net::HTTP.start(uri.host, uri.port) do |http|
	  http.request req
	end
end