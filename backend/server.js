// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
// Enable CORS for all routes and origins (adjust for production)
app.use(cors());

// Body parser middleware to handle JSON request bodies
// Stripe webhook endpoint needs raw body, so this will be configured specifically for that route later.
// For now, general JSON parsing can be added.
app.use(express.json());


// A simple root route to check if the server is running
app.get('/', (req, res) => {
  res.send('AI Fitness Planner Backend Server is running!');
});

// Define the port
const PORT = process.env.PORT || 4242; // Default to 4242 if not specified in .env

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// API endpoint to create a Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: 'Stripe Price ID is not configured in .env file.' });
    }

    // Define success and cancel URLs. These should be frontend routes.
    // Ensure your frontend application has routes set up to handle these.
    const successUrl = process.env.CLIENT_BASE_URL ? `${process.env.CLIENT_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}` : 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = process.env.CLIENT_BASE_URL ? `${process.env.CLIENT_BASE_URL}/payment-cancelled` : 'http://localhost:5173/payment-cancelled';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // Important for subscriptions
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // In a real application, you might pass a customer ID if the user is logged in
      // and you've already created a Stripe Customer object for them.
      // customer: 'cus_xxxxxxxxxxxxxx',
      // Or allow Stripe to create a new customer:
      // customer_creation: 'always', // If you want Stripe to handle customer creation
      success_url: successUrl,
      cancel_url: cancelUrl,
      // automatic_tax: { enabled: true }, // Consider enabling if you need to handle taxes
    });

    // Send the session ID or URL to the client
    // res.json({ id: session.id }); // Send session ID
    res.json({ url: session.url }); // Or directly send the redirect URL

  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ error: `Failed to create checkout session: ${error.message}` });
  }
});

// Stripe Webhook Handler
// Use express.raw({type: 'application/json'}) to get the body as a buffer for Stripe signature verification
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe Webhook Secret is not configured.');
    return res.status(400).send('Webhook Error: Missing webhook secret configuration.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`Received Stripe event: ${event.type}`, event.data.object);

  // TODO: Add logic to handle specific event types, e.g.:
  // - checkout.session.completed: Provision service, update subscription status.
  // - invoice.payment_succeeded: Confirm recurring payment.
  // - invoice.payment_failed: Notify user, handle payment failure.
  // - customer.subscription.updated / .deleted / .created: Update subscription status.

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // This is where you would typically:
      // 1. Retrieve customer details if needed (session.customer).
      // 2. Update your database to mark the user as subscribed.
      // 3. Provision access to the service.
      console.log(`Checkout session completed for session ID: ${session.id}`);
      // Example: if (session.payment_status === 'paid') { ... }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log(`Invoice payment succeeded for invoice ID: ${invoice.id}`);
      // Typically used for recurring payments.
      // Update subscription end date, ensure continued access.
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log(`Invoice payment failed for invoice ID: ${failedInvoice.id}`);
      // Notify the user, potentially restrict service access.
      break;
    // Add more event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

module.exports = app; // Export for potential testing or programmatic use (optional)
