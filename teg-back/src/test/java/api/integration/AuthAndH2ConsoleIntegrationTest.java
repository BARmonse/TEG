package api.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class AuthAndH2ConsoleIntegrationTest {

    @LocalServerPort
    private Integer port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
    }

    @Test
    void testH2ConsoleAccess() {
        given()
            .when()
            .get("/h2-console")
            .then()
            .statusCode(200);
    }

    @Test
    void testAuthentication() {
        // Test login with valid credentials
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"barmonse\",\"password\":\"password\"}")
            .when()
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .body("token", notNullValue());

        // Test login with invalid credentials
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"invalid\",\"password\":\"invalid\"}")
            .when()
            .post("/api/auth/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testH2ConsoleWithWebClient() {
        // Test that H2 Console page contains the login form
        given()
            .when()
            .get("/h2-console")
            .then()
            .statusCode(200)
            .body(org.hamcrest.Matchers.containsString("Login"));

        // Test H2 Console connection
        given()
            .contentType("application/x-www-form-urlencoded")
            .formParam("driver", "org.h2.Driver")
            .formParam("url", "jdbc:h2:mem:test")
            .formParam("user", "sa")
            .formParam("password", "")
            .when()
            .post("/h2-console/login.do")
            .then()
            .statusCode(200);
    }
} 