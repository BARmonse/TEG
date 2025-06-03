package api.configs;

import org.testcontainers.containers.PostgreSQLContainer;

public class TestPostgresSQLContainer extends PostgreSQLContainer<TestPostgresSQLContainer> {

    private static final String IMAGE_VERSION = "postgres:16";
    private static TestPostgresSQLContainer container;

    private TestPostgresSQLContainer() {
        super(IMAGE_VERSION);
        configure();
        withDatabaseName("teg_db");
        withUsername("postgres");
        withPassword("postgres");
    }

    public static synchronized TestPostgresSQLContainer getInstance() {
        if (container == null) {
            container = new TestPostgresSQLContainer();
            container.start(); // starts only once for all tests
        }
        return container;
    }

    @Override
    public void start() {
        // Do nothing if already started
        super.start();
    }

    @Override
    public void stop() {
        // Do nothing — JVM will clean up automatically
    }
}
