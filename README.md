acesso ao banco
acesso ao redis
pasta de uploads
como rodar
docker compose up
como mandar request (swagger)

desenho da arquitetura

testes unitarios

implementacao do s3

# API - Products Import System with NestJS

This API is built using **NestJS** and serves to manage product uploads, access and insert data from the database, and interact with BullMQ. Below is the documentation on how to run the application, configure the database and Redis, as well as how to run migrations with Prisma and unit tests.

## Technologies Used

- **NestJS** - Node.js framework for building APIs.
- **Prisma** - ORM for database access.
- **BullMQ/Redis** - Caching storage for fast data retrieval.
- **Swagger** - Interactive API documentation.
- **Docker** - Containers to facilitate the development environment.

## API Structure

The API has the following main resources:
- **Access to the Database (PostgreSQL)**.
- **Access to Redis**.
- **File storage (uploads folder)**.

---

## Requirements

- **Docker**: To run the application in containers.
- **Node.js**: To run the application locally, in case you don’t use Docker.
- **Prisma**: For migration and database manipulation.

---

## How to Run the API

### 1. Configuration with Docker

The API can be easily run using Docker and Docker Compose. Ensure Docker is installed on your system.

#### Steps:

**Clone the repository:**

  ```bash
  git clone <repository_url>
  cd <repository_name>
  ```

Start the containers using Docker Compose:
  ```bash
  docker-compose up --build
  ```
This will start the containers for PostgreSQL, Redis, and the NestJS API.

The application will be available at http://localhost:3000.

Accessing the Database
The application uses PostgreSQL as the database.

The database is configured in the docker-compose.yml file.
To access the database, you can use any PostgreSQL client and connect to port 5435.
Prisma Configuration
Prisma is used as the ORM to access the database. Ensure the database is running before trying to run the migration.

To run the migrations, use:
  ```bash
  docker exec -it doris-api npx prisma migrate dev
  ```
The database URL in the .env file:

env
DATABASE_URL="postgresql://user:password@postgresdoris:5432/mydb?schema=public"
Accessing Redis
The application uses Redis to store temporary data in the cache.

Redis is configured in the docker-compose.yml file, and the application automatically connects to it.
Redis can be accessed at port 6380.
Uploads Folder
Files uploaded to the API are stored in the uploads folder. This folder is created automatically when the application starts.

Configuration:
The uploads folder is mapped in the container and can be accessed locally to check the uploaded files.

If you're using Docker, the uploads folder will be mapped correctly between the host and the container as configured in docker-compose.yml.

How to Use the API (Swagger)
The API comes with interactive documentation via Swagger, which can be accessed at:

URL: http://localhost:3000/api-docs
Swagger allows you to make requests directly through the web interface, simplifying integration.

Unit Tests
To run unit tests, follow these steps:

Run the tests with Jest:

To run the unit tests, execute the command:

bash
npm run test
Run the tests continuously while developing:

To automatically run the tests while making changes:

bash
npm run test:watch
Test Coverage:

To generate a test coverage report:

bash
npm run test:cov
Final Considerations
The API is ready to be used with Docker or locally, and the Swagger documentation makes interacting with the endpoints easier.
Ensure all dependencies are installed correctly, and Docker is properly set up to run the application in the container.
If you encounter any issues, consult the logs or reach out to the development team.

markdown

---

### Explanation of the Main Sections:

1. **How to Run the API**:
   - Use Docker (containers for PostgreSQL, Redis, and the API).
   - Run locally without Docker.
   
2. **Access to the Database**:
   - PostgreSQL setup with Prisma and how to run migrations.

3. **Access to Redis**:
   - Redis setup and connection by the API.

4. **Uploads Folder**:
   - How the uploads folder is created and managed.

5. **Swagger**:
   - How to access the interactive API documentation.

6. **Unit Tests**:
   - How to run and configure unit tests using Jest.

This README provides a comprehensive overview of setting up, using, and testing the API in both Docker and local environments.
