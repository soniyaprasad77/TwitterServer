# TwitterServer

TwitterServer is a simple server built with Apollo Server and Express.

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Node.js
- Yarn (optional, you can also use npm)

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/TwitterServer.git
    ```

2. Install dependencies:

    ```sh
    yarn install
    ```

    or

    ```sh
    npm install
    
    ```
3. prisma migration
   ```sh
     npx prisma migrate dev --name any_name_you_like
   ```

  
  

## Running the server

You can start the development server with the following command:
```sh
yarn dev 
```

This will start the server on port 8000.

### Tech Stack

- **Description:**
  - This repository serves as the backend infrastructure for our Twitter application.
- **Tech Stack:**
  - **Node.js**, **GraphQL**, and **Prisma ORM** are used for backend development.
  - **Node.js** hosts the **GraphQL server**, offering flexibility and efficiency in defining and querying the data model.
  - **Prisma ORM** provides a type-safe interface for seamless interaction with the **PostgreSQL database**.
  - **PostgreSQL database** is hosted and managed on **Supabase** for scalability and reliability.
  - **Redis** is employed for query caching, enhancing query speeds and server-side performance.
  - User authentication is implemented using **Google OAuth** and **JSON Web Tokens** for secure access.
  - **AWS** offers storage, deployment, and CDN functionalities, bolstering the robustness and scalability of the backend infrastructure.
