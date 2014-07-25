package org.finra.msl.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.finra.jtaf.ewd.ExtWebDriver;
import org.finra.jtaf.ewd.session.SessionManager;
import org.finra.jtaf.ewd.widget.element.Element;
import org.finra.jtaf.ewd.widget.element.InteractiveElement;
import org.finra.msl.client.MockAPI;
import org.finra.msl.client.MockAPI.XHR;
import org.junit.After;
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
        //ewd = SessionManager.getInstance().getNewSession("client","default.properties");
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

        //
        MockAPI.setMockRespond("localhost", 8001, configurations);

        // Type into the autocomplete to trigger the event
        autocomplete.type("J");

        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");
        dropdown.waitForVisible();

        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));

        // Verify the dropdown elements
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

        ewd.findElement(By.xpath("//*[@class=\"demoHeaders\"][1]")).click();
        Element dropdown = new Element(".//ul[contains(@class, \"ui-autocomplete\")]");

        MockAPI.setMockRespond("localhost", 8001, configurations);
        autocomplete.type("J");

        // Wait for dropdown to appear before getting the options
        dropdown.waitForVisible();
        List<WebElement> elements = ewd.findElements(By
                .xpath(".//ul[contains(@class, \"ui-autocomplete\")]/li"));
        
        //Verify that the options are what was in the configuration
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
        Thread.sleep(5);

        XHR[] interceptedXHR = MockAPI.getInterceptedXHR("localhost", 8001, "/services/getservice");

        Assert.assertEquals("GET", interceptedXHR[0].getMethodType());
        Assert.assertEquals("/services/getservice?term=GET+Example", interceptedXHR[0].getUrl());
        Assert.assertEquals("GET Example", interceptedXHR[0].getQueryString().get("term"));
    }

    @Test
    public void testPostIntercept() throws Exception {
        MockAPI.setInterceptXHR("localhost", 8001, "/services/postservice");

        InteractiveElement input = new InteractiveElement(".//*[@id=\"output-box\"]");
        input.type("POST Example");

        InteractiveElement button = new InteractiveElement(".//*[@id=\"postRequest\"]");
        button.click();
        Thread.sleep(5);
 
        XHR[] interceptedXHR = MockAPI
                .getInterceptedXHR("localhost", 8001, "/services/postservice");

        Assert.assertEquals("POST", interceptedXHR[0].getMethodType());
        Assert.assertEquals("/services/postservice", interceptedXHR[0].getUrl());
        Assert.assertTrue(interceptedXHR[0].getBody().contains("timestamp="));
        Assert.assertTrue(interceptedXHR[0].getBody().contains("text=POST+Example"));
    }

    
    @AfterClass
    public static void tearDown() {
        ewd.close();
    }
}
