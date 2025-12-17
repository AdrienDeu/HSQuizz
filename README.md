# HSQuizz

This project is a Hearthstone quiz application.

## How to run the application

To run the application, you need to run both the frontend and the backend server.

### Backend

The backend is a Node.js server that acts as a proxy to the Hearthstone APIs.

1.  Open a terminal in the root of the project.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the backend server:
    ```bash
    node backend/server.js
    ```
    The server will start on port 3000.

### Frontend

The frontend is an Angular application.

1.  Open another terminal in the `frontend` directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the frontend application:
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:4200`.

The frontend is configured to proxy API requests to the backend server running on port 3000.
