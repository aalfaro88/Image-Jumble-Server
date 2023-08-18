// routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.use(express.json());

router.get("/get-stripe-key", (req, res) => {
  res.json({ publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY });
});

const clientSecrets = {}; // Store client secrets in memory or a database

router.post("/create-hello-payment-intent", async (req, res) => {
  try {
    const amountInCents = 1000; // $10.00

    console.log("Creating payment intent...");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${process.env.REACT_APP_URI}/payment-success`,
      line_items: [
        {
          price: 'price_1NdRHdI46dWt0phzTfwBp1KY', 
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.body.currentUrl}?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.REACT_APP_URI}/payment-cancel`,
    });

    console.log("Payment intent created:", session);
    console.log("Payment intent created:", session.id);
    clientSecrets[session.id] = session.client_secret;

    res.json({
      clientSecret: session.id,
    });
  } catch (error) {
    console.error("Error creating hello payment intent:", error);
    res.status(500).json({ error: "Failed to create hello payment intent." });
  }
});

router.post("/stripe-webhook", async (req, res) => {
  const event = req.body;

  try {
    if (event.type === "payment_intent.succeeded") {
      const clientSecret = event.data.object.client_secret;
      // ... Process the payment and store relevant data in your database ...

      // Send a response back to the frontend
      res.status(200).json({ message: "Payment confirmed", clientSecret });
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    res.status(500).json({ error: "Failed to handle webhook event" });
  }
});


router.get("/payment-success", (req, res) => {
  const { sessionId } = req.query;

  if (sessionId && clientSecrets[sessionId]) {
    // Payment was successful, you have the clientSecret
    // Do your payment verification and handling here
  } else {
    res.status(400).send("Missing or invalid sessionId parameter");
  }
});

// In the webhook endpoint
router.post('/stripe-webhook', (req, res) => {
  const event = req.body;

  // Log the incoming event for debugging
  console.log("Webhook received:", event);

  if (event.type === 'payment_intent.succeeded') {
    // Payment was successful, you can use event.data.object.client_secret
    // to retrieve the client secret and use it for verification
    const clientSecret = event.data.object.client_secret;

    // Do your payment verification and handling here
    // For example, update order status, send confirmation emails, etc.
  }

  res.json({ received: true });
});




module.exports = router;

