# TEG (Táctica y Estrategia de la Guerra)

A digital implementation of the classic strategy board game TEG.

## Project Structure
- `teg-back/`: Backend service (Spring Boot)
- `teg-front/`: Frontend application (Angular)

## Development Setup

### Prerequisites
- Docker
- Java 17
- Node.js & npm

### Database Setup
The project uses PostgreSQL running in a Docker container. Use the following commands to manage the database:

```bash
# Start the database
./scripts/db.sh start

# Stop the database
./scripts/db.sh stop

# Restart the database
./scripts/db.sh restart

# View database logs
./scripts/db.sh logs
```

Database connection details:
- Host: localhost
- Port: 5432
- Database: teg_db
- Username: postgres
- Password: postgres

### Running the Application
[Add instructions for running the application] 