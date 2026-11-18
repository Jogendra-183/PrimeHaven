package com.klu;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest(classes = ApiGatwayApplication.class)
public class GatewayRouteTests {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void testRoutesConfiguredCorrectly() {
        assertNotNull(routeLocator);

        List<Route> routes = routeLocator.getRoutes().collectList().block();
        assertNotNull(routes);
        assertFalse(routes.isEmpty());

        List<String> routeIds = routes.stream().map(Route::getId).toList();
        assertTrue(routeIds.contains("AUTH-SERVICE"), "Gateway must have route for AUTH-SERVICE");
        assertTrue(routeIds.contains("PROPERTY-SERVICE"), "Gateway must have route for PROPERTY-SERVICE");
        assertTrue(routeIds.contains("VISIT-SERVICE"), "Gateway must have route for VISIT-SERVICE");
        assertTrue(routeIds.contains("INQUIRY-SERVICE"), "Gateway must have route for INQUIRY-SERVICE");

        // Verify URIs use Eureka service discovery (lb://)
        for (Route route : routes) {
            String uri = route.getUri().toString();
            switch (route.getId()) {
                case "AUTH-SERVICE" -> assertEquals("lb://AUTH-SERVICE", uri);
                case "PROPERTY-SERVICE" -> assertEquals("lb://PROPERTY-SERVICE", uri);
                case "VISIT-SERVICE" -> assertEquals("lb://VISIT-SERVICE", uri);
                case "INQUIRY-SERVICE" -> assertEquals("lb://INQUIRY-SERVICE", uri);
            }
        }
    }
}

