# URL Shortener Project

This project is a URL Shortener application built using various modern technologies, including Next.js for the frontend, Nest.js for the backend, and Couchbase Capella for database management. The application is hosted on DigitalOcean and uses Docker Compose to orchestrate the services. It also incorporates a custom domain name for easy access.

## Technologies Used

- **Next.js:** React framework used for the frontend, providing a fast and modern user interface.

- **Nest.js:** Node.js framework used for building the backend, ensuring robust and maintainable APIs.

- **Couchbase Capella:** NoSQL cloud database used for storing shortened URL mappings.

- **DigitalOcean:** Cloud hosting platform used to deploy the application and services.

- **Docker Compose:** Tool for defining and running multi-container Docker applications. It orchestrates the API, frontend, and database services.

- **Domain Name:** The project is accessible via a custom domain name, using Nginx for reverse proxy configuration.

## Features

- Shorten long URLs into compact, shareable links.

- API for shortening and redirecting URLs, using Nest.js for the backend.

- Frontend built using Next.js for a modern, responsive user interface.

- URL mappings stored in Couchbase Capella for fast retrieval.

- Deployed using Docker Compose on DigitalOcean with a custom domain.

## Project Structure

- **/api:** Contains the Nest.js backend code.

- **/web:** Contains the Next.js frontend code.

- **docker-compose.yml:** Configuration for Docker Compose to orchestrate the containers.

- **nginx.conf:** Nginx configuration file for routing and reverse proxy setup.

- **Couchbase Capella:** Handles the URL mappings and storage using Couchbase’s managed NoSQL cloud solution.

## Prerequisites

To run this project locally, you need the following installed on your machine:

- **Docker:** Install Docker

- **Docker Compose:** Install Docker Compose

- **Node.js:** Install Node.js

- **Couchbase Capella Account:** Sign up for Couchbase Capella

## 2\. Set up environment variables

You need to create environment variable files for both the backend and frontend services. Below are the required variables:

### For the Backend (api/.env):

```bash
COUCHBASE\_USERNAME=<your-couchbase-username>  
COUCHBASE\_PASSWORD=<your-couchbase-password>  
COUCHBASE\_URL=<your-couchbase-url>  
PORT=5001  
FRONTEND\_URL=http://localhost:3000
```

### For the Frontend (web/.env):

```bash
NEXT\_PUBLIC\_API\_URL=http://localhost:5001
```

## 3\. Docker Compose

Ensure Docker is installed and running. To start the application, run the following command:

docker-compose up --build

This command will start the following services:

- API (Nest.js) on http://localhost:5001

- Frontend (Next.js) on http://localhost:3000

- Nginx as a reverse proxy, handling routing between the frontend and backend.

## 4\. Couchbase Capella Setup

To set up Couchbase Capella:

- Log in to your Couchbase Capella account.

- Create a new database bucket for storing URL mappings.

- Get the connection string, username, and password from the Capella dashboard.

- Add these credentials to the backend \`.env\` file as shown in the backend environment example above.

## 5\. Custom Domain and DigitalOcean Deployment

The project is hosted on DigitalOcean with a custom domain. You need to configure the domain and DNS records through your domain provider.

### Steps to Deploy on DigitalOcean:

- Create a Droplet (Virtual Machine) on DigitalOcean.

- Install Docker and Docker Compose on the Droplet.

- Transfer the project files to the server.

- Run the command \`docker-compose up\` to start the services.

- Set up Nginx to handle requests and route them to the correct service.

### Nginx Configuration:

```bash
server {  
  listen 80;  
  server\_name your-domain.com;

  location = / {  
    proxy\_pass http://localhost:3000;  
    proxy\_set\_header Host $host;  
    proxy\_set\_header X-Real-IP $remote\_addr;  
    proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
    proxy\_set\_header X-Forwarded-Proto $scheme;  
  }

  location / {  
    proxy\_pass http://localhost:5001;  
    proxy\_set\_header Host $host;  
    proxy\_set\_header X-Real-IP $remote\_addr;  
    proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
    proxy\_set\_header X-Forwarded-Proto $scheme;  
  }  
}
```

## 6\. Accessing the Application

Once the application is running, you can access it through the following:

- Frontend: http://localhost:3000 or your custom domain.

- Backend API: http://localhost:5001.

## 7\. Testing

You can use tools like Postman or curl to test the API endpoints for shortening and retrieving URLs.

### Example API Request:

To shorten a URL, make a POST request to the backend API:


POST http://localhost:5001/shorten  
Content-Type: application/json


```bash
{  
"url": "https://www.example.com"  
}
```

### Example API Response:

```bash
www.your-domain.com/abcd123
```