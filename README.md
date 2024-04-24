# True Authenticate

True Authenticate is a simple authentication system built with Node.js, Express, and Sequelize.

## Features

- User registration
- User login
- Marking phone numbers as spam
- Searching users by name or phone number
- Retrieving user profile

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js
- npm (Node Package Manager)
- MySQL

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dhruv95goradiya/true-authenticate.git

2. Navigate to the project directory:

   ```bash
   cd true-authenticate

3. install dependencies
   
   npm install

4. Create a MySQL database and configure connection settings in config/config.mjs.

5. Run database migrations:

   npx sequelize-cli db:migrate

## Usage

1. start server
    npm start
2. The server will start running at http://localhost:3000.
3. You can now access the API endpoints using a tool like Postman or by making HTTP requests programmatically

## API Endpoints

POST /api/register: Register a new user.
POST /api/login: Log in with existing credentials.
POST /api/mark-spam: Mark a phone number as spam.
GET /api/search/by-name/:name: Search users by name.
GET /api/search/by-number/:phoneNumber: Search users by phone number.
GET /api/profile: Get user profile.

## Configuration

You can configure the application settings in config/config.mjs. Make sure to set the correct database connection settings and JWT secret.

## Tests

Run tests using Jest:
  npm test

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## postman collection

true-authenticate.postman_collection.json