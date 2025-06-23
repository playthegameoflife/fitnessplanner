# AI Fitness Planner - Backend Server

This directory contains the backend server for the AI Fitness Planner, primarily responsible for handling Stripe payment integration.

## Setup and Running

1.  **Navigate to Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    If you haven't already, install the necessary Node.js dependencies:
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in this `backend` directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    Then, populate the `.env` file with your actual Stripe API keys and other required values. See `.env.example` (or the created `.env`) for the list of required variables:
    *   `STRIPE_SECRET_KEY`: Your Stripe secret key (e.g., `sk_test_...`).
    *   `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (e.g., `pk_test_...`).
    *   `STRIPE_PRICE_ID`: The ID of your $19.99/month subscription price in Stripe.
    *   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (e.g., `whsec_...`).
    *   `PORT` (Optional): The port for the backend server to run on (defaults to 4242 if not set).
    *   `CLIENT_BASE_URL` (Optional): The base URL of your frontend application (e.g., `http://localhost:5173`), used for constructing success/cancel URLs for Stripe Checkout. Defaults to `http://localhost:5173`.

4.  **Running the Development Server:**
    To run the backend server with automatic restarts on file changes (using `nodemon`):
    ```bash
    npm run dev
    ```
    The server will typically start on port 4242 (or the port specified in your `.env` file).

5.  **Running in Production (Example):**
    To run the server in a production-like environment (without `nodemon`):
    ```bash
    npm start
    ```

## API Endpoints

*   **`POST /api/create-checkout-session`**: Creates a Stripe Checkout session for initiating a subscription.
    *   **Response**: `{ url: "stripe_checkout_session_url" }`
*   **`POST /api/webhook`**: Handles incoming webhooks from Stripe. This endpoint requires proper configuration in your Stripe Dashboard to point to this server's URL (potentially using a tool like `ngrok` for local development).

## Development Notes

*   **Stripe Webhooks Locally:** To test Stripe webhooks on your local machine, you'll need to expose your local server to the internet. Tools like `ngrok` or the Stripe CLI (`stripe listen --forward-to localhost:YOUR_PORT/api/webhook`) can be used for this. Remember to update your webhook endpoint in the Stripe dashboard with the URL provided by these tools and use the correct webhook signing secret.

## Next Steps for Payment System Development

This backend provides the initial infrastructure for Stripe subscriptions. Further development will involve:

1.  **User Authentication & Management:**
    *   Implement a system for user registration and login.
    *   Associate Stripe customer IDs with your application's user accounts.
2.  **Database Integration:**
    *   Set up a database (e.g., PostgreSQL, MongoDB) to store user information, subscription status, payment history, etc.
    *   Update the webhook handler to write relevant subscription lifecycle events to the database (e.g., `checkout.session.completed` should create/update a subscription record for the user).
3.  **Enhanced Webhook Handling:**
    *   Implement robust logic for all relevant Stripe events (e.g., `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`) to keep your application's data in sync with Stripe.
4.  **Frontend Integration:**
    *   Call the `/api/create-checkout-session` endpoint from the frontend when a user clicks "Subscribe".
    *   Redirect the user to the Stripe Checkout URL returned by the backend.
    *   Create frontend pages for payment success (`/payment-success`) and cancellation (`/payment-cancelled`).
    *   Implement logic on the frontend to check a user's subscription status (by querying your backend) to control access to premium features.
5.  **Subscription Management UI:**
    *   (Future) Allow users to view their subscription status, update payment methods, or cancel subscriptions (potentially via the Stripe Customer Portal).
6.  **Error Handling & Security:**
    *   Implement more comprehensive error handling and logging.
    *   Ensure all security best practices are followed, especially concerning API keys and sensitive data.
7.  **Testing:**
    *   Thoroughly test the payment flow with Stripe's test card numbers and simulate various webhook events.
