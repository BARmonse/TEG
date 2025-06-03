package api.configs;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class PostgresContainerTest {

    @Test
    @DisplayName("Postgres container setup")
    void testPostgresContainer() {
        try (PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
                .withDatabaseName("teg_db")
                .withUsername("postgres")
                .withPassword("postgres")) {
            postgres.start();

            String jdbcUrl = postgres.getJdbcUrl();
            assertNotNull(jdbcUrl);
            System.out.println("JDBC URL: " + jdbcUrl);
        }
    }
}
