# Contact Keeper Service

## Overview

The Contact Keeper Service is designed to identify and keep track of a customer's identity across multiple purchases. It ensures that contacts with either a common email or phone number are correctly linked, with the oldest contact treated as "primary" and any new information linked as "secondary".

## Features

- Identifies and consolidates customer contact information.
- Links contacts with common email or phone number.
- Ensures the oldest contact remains as primary.
- Supports updating primary and secondary contacts based on new information.

## Technologies Used

- **Node.js** - Backend runtime environment.
- **Express** - Web framework for Node.js.
- **Sequelize** - ORM for SQL databases.
- **SQLite** - SQL database for storing contact information.

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd contact-keeper
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the database:
    ```bash
    npx sequelize-cli db:migrate
    ```

4. Start the server:
    ```bash
    npm start
    ```

### Running the Server

The server will run on `https://contact-service-g844.onrender.com/` by default.

## API Endpoints

### Identify Contact

#### URL

`POST /identify`

#### Request Body

The request body should be a JSON object containing either an email, a phone number, or both.

```json
{
  "email": "string",
  "phoneNumber": "string"
}
