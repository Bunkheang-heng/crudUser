# Use the official PostgreSQL image
FROM postgres:latest

# Environment variables for database configuration
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=node12344
ENV POSTGRES_DB=node_db

# Expose the PostgreSQL port
EXPOSE 5432

# Add any custom initialization scripts (optional)
COPY init.sql /docker-entrypoint-initdb.d/

# Set the default command to run PostgreSQL
CMD ["postgres"] 