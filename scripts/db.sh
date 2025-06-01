#!/bin/bash

function show_help() {
    echo "Database management script"
    echo "Usage: ./db.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start the database container"
    echo "  stop        - Stop the database container"
    echo "  restart     - Restart the database container (preserving data)"
    echo "  recreate    - Recreate the database container (WARNING: This will delete all data)"
    echo "  status      - Show the status of the database container"
    echo "  logs        - Show the logs of the database container"
    echo "  help        - Show this help message"
}

function start_db() {
    echo "Starting database container..."
    docker compose up -d
    wait_for_db
}

function stop_db() {
    echo "Stopping database container..."
    docker compose down
}

function restart_db() {
    echo "Restarting database container..."
    docker compose restart
    wait_for_db
}

function recreate_db() {
    echo "WARNING: This will delete all data in the database."
    read -p "Are you sure you want to continue? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "Recreating database container..."
        docker compose down -v
        docker compose up -d
        wait_for_db
    fi
}

function show_status() {
    echo "Database container status:"
    docker ps -f name=teg-postgres
}

function show_logs() {
    docker logs -f teg-postgres
}

function wait_for_db() {
    echo "Waiting for database to be ready..."
    until docker exec teg-postgres pg_isready -U postgres > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo -e "\nDatabase is ready!"
}

# Main script
case "$1" in
    "start")
        start_db
        ;;
    "stop")
        stop_db
        ;;
    "restart")
        restart_db
        ;;
    "recreate")
        recreate_db
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac 