package org.finra.msl.client;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;

import org.finra.jtaf.ewd.ExtWebDriver;
import org.finra.jtaf.ewd.session.SessionManager;
import org.finra.jtaf.ewd.widget.element.Element;
import org.finra.jtaf.ewd.widget.element.InteractiveElement;
import org.finra.msl.client.MockAPI;
import org.finra.msl.client.MockAPI.XHR;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Tests for msl-client-java and msl-server
 */
public class MockAPITest {

    public static ExtWebDriver ewd;

    @BeforeClass
    public static void setUp() throws Exception {
        // Get a new ExtWebDriver session
        ewd = SessionManager.getInstance().getNewSession();
    }

    @Before
    public void openApp() {
        // Open the test application
       
        ewd.open("http://localhost:8001/index.html");
    }

    @Test
    public void testTextResponse() throws Exception {
        // Create object for autocomplete element
        InteractiveElement autocomplete = new InteractiveElement(".//*[@id=\"autocomplete\"]");

        // Set up the object that contains our response configuration
        Map<String, Object> configurations = new HashMap<String, Object>();
        configurations.put("requestPath", "/services/getlanguages");
        configurations.put("responseText", "{\"label\":\"Java\"},{\"label\":\"Perl\"}");
        configurations.put("contentType", "application/json");
        configurations.put("eval",
                "function (req,responseText) { return '[' + responseText + ']'; }");
        configurations.put("statusCode", "200");
        configurations.put("delayTime", "0");

        // Setting up the mock response using the configuration
        MockAPI.setMockRespond("localhost", 8001, configurations);

        // Triggering the event
        autocomplete.type("J");

        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");
        dropdown.waitForVisible();

        // Getting all of the options from the dropdown menu to be validated
        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));

        // Verify that the options are from the mocked response
        Assert.assertEquals("Java", elements.get(0).getText());
        Assert.assertEquals("Perl", elements.get(1).getText());
    }

    @Test
    public void testTemplateResponse() throws Exception {
        MockAPI.registerTemplate("localhost", 8001,
                "[{\"label\":\"{{param1}}\"},{\"label\":\"{{param2}}\"}]", "example");

        InteractiveElement autocomplete = new InteractiveElement(".//*[@id=\"autocomplete\"]");

        Map<String, Object> configurations = new HashMap<String, Object>();
        configurations.put("requestPath", "/services/getlanguages");
        configurations.put("contentType", "application/json");
        configurations.put("statusCode", "200");
        configurations.put("delayTime", "0");

        Map<String, String> keyValue = new HashMap<String, String>();
        keyValue.put("param1", "German");
        keyValue.put("param2", "English");
        configurations.put("keyValues", keyValue);
        configurations.put("id", "example");

        // Setting up the mock response using the configuration
        MockAPI.setMockRespond("localhost", 8001, configurations);

        // Triggering the event
        autocomplete.type("J");

        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");
        dropdown.waitForVisible();

        // Getting all of the options from the dropdown menu to be validated
        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));

        // Verify that the options are from the mocked response
        Assert.assertEquals("German", elements.get(0).getText());
        Assert.assertEquals("English", elements.get(1).getText());
    }

    @Test
    public void testGetIntercept() throws Exception {
        MockAPI.setInterceptXHR("localhost", 8001, "/services/getservice");

        InteractiveElement input = new InteractiveElement(".//*[@id=\"getInput\"]");
        input.type("GET Example");

        InteractiveElement button = new InteractiveElement(".//*[@id=\"getRequest\"]");
        button.click();

        // Due to WebDriver operating too quickly sometimes, it is held up so
        // that the web-server has enough time to intercept
        Thread.sleep(5);

        // Get the HTTP requests that have been intercepted
        XHR[] interceptedXHR = MockAPI.getInterceptedXHR("localhost", 8001, "/services/getservice");

        // Verify that the intercepted HTTP request is the one we are looking
        // for by checking its content
        Assert.assertEquals("GET", interceptedXHR[0].getMethodType());
        Assert.assertEquals("/services/getservice?term=GET+Example", interceptedXHR[0].getUrl());
        Assert.assertEquals("GET Example", interceptedXHR[0].getQueryString().get("term"));
    }

    @Test
    public void testPostIntercept() throws Exception {
        // Setting
        MockAPI.setInterceptXHR("localhost", 8001, "/services/postservice");

        InteractiveElement input = new InteractiveElement(".//*[@id=\"output-box\"]");
        input.type("POST Example");

        InteractiveElement button = new InteractiveElement(".//*[@id=\"postRequest\"]");
        button.click();

        // Due to WebDriver operating too quickly sometimes, it is held up so
        // that the web-server has enough time to intercept
        Thread.sleep(5);

        // Get the HTTP requests that have been intercepted
        XHR[] interceptedXHR = MockAPI
                .getInterceptedXHR("localhost", 8001, "/services/postservice");

        // Verify that the intercepted HTTP request is the one we are looking
        // for by checking its content
        Assert.assertEquals("POST", interceptedXHR[0].getMethodType());
        Assert.assertEquals("/services/postservice", interceptedXHR[0].getUrl());
        JSONParser parser = new JSONParser();
        JSONObject body = new JSONObject((Map<String, String>) parser.parse(interceptedXHR[0]
                .getBody()));

        Assert.assertTrue(body.containsKey("timestamp"));
        Assert.assertEquals(body.get("text"), "POST Example");
    }

    @Test
    public void testUnRegisterMock() throws Exception {

        // Create object for autocomplete element
        InteractiveElement autocomplete = new InteractiveElement(".//*[@id=\"autocomplete\"]");

        // Set up the object that contains our response configuration
        Map<String, Object> configurations = new HashMap<String, Object>();
        configurations.put("requestPath", "/services/getlanguages");
        configurations.put("responseText", "[{\"label\":\"Java\"},{\"label\":\"Perl\"}]");
        configurations.put("contentType", "application/json");
        configurations.put("statusCode", "200");
        configurations.put("delayTime", "0");

        // Set up the response using the configuration that was just created
        MockAPI.setMockRespond("localhost", 8001, configurations);

        // Type into the autocomplete to trigger the event
        autocomplete.type("J");

        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");
        dropdown.waitForVisible();

        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));

        autocomplete.getWebElement().clear();

        // Verify the dropdown elements
        Assert.assertEquals("Java", elements.get(0).getText());
        Assert.assertEquals("Perl", elements.get(1).getText());

        // Unregister this request so web-server.js no longer responds to it
        MockAPI.unRegisterMock("localhost", 8001, "/services/getlanguages");

        // Trigger event again
        autocomplete.type("J");

        // Verify that the dropdown no longer appears now that there
        // is no response
        Assert.assertEquals(false, !dropdown.isElementPresent());

    }

    @Test
    public void testLongResponse() throws Exception {
        String everything = null;
        BufferedReader br = new BufferedReader(new FileReader(System.getProperty("user.dir")
                + "/src/test/resources/sampleResponse"));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            everything = sb.toString();

        } finally {
            br.close();
        }
        MockAPI.registerTemplate("localhost", 8001, everything, "getBooks");

        Map<String, Object> config = new HashMap<String, Object>();
        config.put("requestPath", "/services/getBooks");
        config.put("statusCode", 200);
        config.put("contentType", "application/xml");
        config.put("id", "getBooks");

        MockAPI.setMockRespond("localhost", 8001, config);

        Element result = new Element("//span[@id=\"postResultLong\"]");
        InteractiveElement button = new InteractiveElement(".//*[@id=\"postLongRequest\"]");
        button.click();
        Thread.sleep(10000);
        Assert.assertEquals("Midnight Rain", result.getText());

    }
    
    
    
    @Test
    public void testFileMock() throws Exception {
        // Create object for autocomplete element
        InteractiveElement autocomplete = new InteractiveElement(".//*[@id=\"autocomplete\"]");

        // Set up the object that contains our response configuration
        Map<String, Object> configurations = new HashMap<String, Object>();
        configurations.put("requestPath", "/services/getlanguages");
        configurations.put("responseFile", "../msl-client-java/src/test/resources/javaResponse.txt");
        configurations.put("contentType", "application/json");
        configurations.put("eval",
                "function (req,responseText) { return '[' + responseText + ']'; }");
        configurations.put("statusCode", "200");
        configurations.put("delayTime", "0");

        // Setting up the mock response using the configuration
        MockAPI.setMockRespond("localhost", 8001, configurations);

        // Triggering the event
        autocomplete.type("J");

        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");
        dropdown.waitForVisible();

        // Getting all of the options from the dropdown menu to be validated
        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));

        // Verify that the options are from the mocked response
        Assert.assertEquals("Java", elements.get(0).getText());
        Assert.assertEquals("RoR", elements.get(1).getText());

    }

    @AfterClass
    public static void tearDown() {
        ewd.close();
    }

}
