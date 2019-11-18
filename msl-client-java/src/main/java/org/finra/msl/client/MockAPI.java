/*
 * (C) Copyright 2014 Mock Service Layer Contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */
package org.finra.msl.client;

import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MockAPI {

    
//    /**
//     * Register a template that is passed to the web-server where the it is
//     * stored using the ID as the key. This is used later when setting up a mock
//     * response.
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param template
//     *            => the template that is to be registered for later use
//     * @param id
//     *            => key used to indicate which template is to be used when
//     *            mocking a response
//     * @return => returns the response
//     * @throws Exception
//     */
    public static String registerTemplate(String server, int port, String template, String id)
            throws Exception {
        HttpPost post = null;
        JSONObject object = new JSONObject();

        URIBuilder builder = new URIBuilder();
        
        builder.setScheme("http").setHost(server).setPort(port).setPath("/mock/template");

        post = new HttpPost(builder.toString());
        object.put("template", template);
        object.put("id", id);

        post.setHeader("Content-Type", "application/json");
        post.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(post);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("POST failed. Error code: " + resp.getStatusLine().getStatusCode());
        }
        return EntityUtils.toString(resp.getEntity());

    }
    

//    /**
//     * Method to register mock response. Once you register, whenever
//     * server receives a request matching the registered requestPath, it will
//     * respond with a fake response using the provided JSONObject's information.
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param configurations
//     *            => the JSONObject that contains all of the options (content
//     *            type, requestPath, etc)
//     * @return
//     * @throws Exception
//     */
    @SuppressWarnings("unchecked")
    public static String setMockRespond(String server, int port, Map<String, Object> configurations)
            throws Exception {


        URIBuilder builder = new URIBuilder();
        builder.setScheme("http").setHost(server).setPort(port).setPath("/mock/fakerespond");

        if(configurations.keySet().contains("keyValues")){
           if(configurations.get("keyValues") != null && configurations.get("keyValues") instanceof Map){
               configurations.put("keyValues", new JSONObject((Map<String, Object>)configurations.get("keyValues")));
           }
        }

        if(configurations.keySet().contains("header")){
           if(configurations.get("header") != null && configurations.get("header") instanceof Map){
               configurations.put("header", new JSONObject((Map<String, Object>)configurations.get("header")));
           }
        }
        
        JSONObject object = new JSONObject(configurations);
        HttpPost post = new HttpPost(builder.toString());
        
        post.setHeader("Content-Type", "application/json");
        post.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(post);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("POST failed. Error code: " + resp.getStatusLine().getStatusCode());
        }
        return EntityUtils.toString(resp.getEntity());
    }

  
  

//    /**
//     * Method to register intercept XHR. Once you register, whenever
//     * server receives a request matching the registered requestPath, it will
//     * intercept and store for later retrieval
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param requestPath
//     *            => path which you want to mock a fake response with
//     *
//     * @return String response
//     **/
    public static String setInterceptXHR(String server, int port, String requestPath)
            throws Exception {
        URIBuilder builder = new URIBuilder();
        builder.setScheme("http").setHost(server).setPort(port).setPath("/mock/interceptxhr");

        JSONObject object = new JSONObject();
        object.put("requestPath", requestPath);
        
        HttpPost post = new HttpPost(builder.toString());
        post.setHeader("Content-Type", "application/json");
        post.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(post);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("POST failed. Error code: " + resp.getStatusLine().getStatusCode());
        }
        return EntityUtils.toString(resp.getEntity());
    }

    
//    /**
//     * Method to retrieve intercepted XHRs. Use in conjunction with
//     * setInterceptXHR()
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param requestPath
//     *            => path which you want to mock a fake response with
//     *
//     * @return list of intercepted XHR objects
//     */
    public static XHR[] getInterceptedXHR(String server, int port, String requestPath)
            throws Exception {
        URIBuilder builder = new URIBuilder();

        builder.setScheme("http").setHost(server).setPort(port).setPath("/mock/getinterceptedxhr");

        JSONObject object = new JSONObject();
        object.put("requestPath", requestPath);
        
        HttpPost post = new HttpPost(builder.toString());
        post.setHeader("Content-Type", "application/json");
        post.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(post);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("GET failed. Error code: " + resp.getStatusLine().getStatusCode());
        }

        // Parse JSON
        JSONObject jsonObj = (JSONObject) JSONValue.parse(EntityUtils.toString(resp.getEntity()));
        XHR[] interceptedXHRs = new XHR[jsonObj.keySet().size()];
        for (String key : jsonObj.keySet()) {
            int index = Integer.parseInt(key.split("_")[1]);
            JSONObject xhrDataObj = (JSONObject) jsonObj.get(key);
            JSONObject xhrObj = (JSONObject) xhrDataObj.get("xhr");
            Object postObj = xhrDataObj.get("post");

            // Get URL and method
            String urlStr = xhrObj.get("url").toString();
            String method = xhrObj.get("method").toString();

            // Post body
            String body = "";
            if (postObj != null) {
                body = postObj.toString();
            }

            XHR xhr = new XHR(urlStr, method, body);
            interceptedXHRs[index - 1] = xhr;
        }

        return interceptedXHRs;
    }

//    /**
//     * Method to set up parameters that will be ignored in the URL.
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param params => parameters that will be ignored in the app URL, type is string.
//     *                  For example,if we set ignore paramB, URL http://aa.bb.com/result?paramA=123&paramB=456 will be treated as http://aa.bb.com/result?paramA=123
//     *
//     * @return String response
//     **/
    public static String setParamIgnored(String server, int port, String params)
            throws Exception {

        URIBuilder builder = new URIBuilder();
        builder.setScheme("http").setHost(server).setPort(port).setPath("/setIgnoreFlag");
        
        JSONObject object = new JSONObject();
        object.put("requestPath", params);
        
        HttpPost get = new HttpPost(builder.toString());
        get.setHeader("Content-Type", "application/json");
        get.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(get);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("GET failed. Error code: " + resp.getStatusLine().getStatusCode());
        }

        return EntityUtils.toString(resp.getEntity());
    }

    
//    /**
//     * This allows for the removal of all registered mocks once they are no longer in
//     * use.
//     *
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @return
//     * @throws Exception
//     */
    public static String unRegisterMock(String server, int port)
            throws Exception {

        URIBuilder builder = new URIBuilder();

        builder.setScheme("http").setHost(server).setPort(port).setPath("/unregisterMock");
        
        JSONObject object = new JSONObject();
        object.put("requestPath", "");
        
        HttpPost get = new HttpPost(builder.toString());
        get.setHeader("Content-Type", "application/json");
        get.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(get);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("GET failed. Error code: " + resp.getStatusLine().getStatusCode());
        }

        return EntityUtils.toString(resp.getEntity());

    }
    
    
    
    
//    /**
//     * This allows for the removal of a registered mock once it is no longer in
//     * use.
//     *
//     *
//     * @param server
//     *            => url of web-server.js running on node
//     * @param port
//     *            => port number of web-server.js running on node
//     * @param requestPath
//     *            => path which you want to mock a fake response with * @return
//     * @throws Exception
//     */
    public static String unRegisterMock(String server, int port, String requestPath)
            throws Exception {

        URIBuilder builder = new URIBuilder();

        builder.setScheme("http").setHost(server).setPort(port).setPath("/unregisterMock");
        
        JSONObject object = new JSONObject();
        object.put("requestPath", requestPath);
        
        HttpPost get = new HttpPost(builder.toString());
        get.setHeader("Content-Type", "application/json");
        get.setEntity(new StringEntity(object.toString()));

        HttpClient client = new DefaultHttpClient();
        HttpResponse resp = client.execute(get);

        if (resp.getStatusLine().getStatusCode() != 200) {
            throw new Exception("GET failed. Error code: " + resp.getStatusLine().getStatusCode());
        }

        return EntityUtils.toString(resp.getEntity());

    }

    

//    /**
//     * Encapsulates XMLHttpRequest object
//     *
//     */
    public static class XHR {
        private String url;
        private String methodType;
        private String body;

        public XHR(String url, String methodType, String body) {
            this.url = url;
            this.methodType = methodType;
            this.body = body;
        }

//        /**
//         * Returns URL path of the XHR
//         *
//         * @return full URL path
//         */
//        public String getUrl() {
//
//            return url;
//        }
//
//        /**
//         * Returns the query string of the XHR in a map
//         *
//         * @return key-value pair of all of the queries
//         */
        public Map<String, String> getQueryString() throws Exception {
            // Parse query string
            Map<String, String> queryStringParams = new HashMap<String, String>();
            List<NameValuePair> params = URLEncodedUtils.parse(new URI(url), "UTF-8");
            for (NameValuePair param : params) {
                queryStringParams.put(param.getName(), param.getValue());
            }

            return queryStringParams;
        }

//        /**
//         * Returns the method type of the XHR (e.g. GET, POST)
//         *
//         * @return method type
//         */
        public String getMethodType() {
            return methodType;
        }

//        /**
//         * Returns the body of the XHR request (if any)
//         *
//         * @return body of the request
//         */
        public String getBody() {
            return body;
        }
    }
}
