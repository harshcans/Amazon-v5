import { buffer } from "micro";
import * as admin from "firebase-admin";

// Secure a connection to firebase from the backend
const serviceAccount = require("../../../permission.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

// Save order to Firestore
const fulfillOrder = async (session) => {
  console.log("🔔 Fulfilling order:", session.id);

  return admin
    .firestore()
    .collection("next-amazon-users")
    .doc(session.metadata.email)
    .collection("orders")
    .doc(session.id) // Firestore doc ID = Stripe session.id
    .set({
      id: session.id, // ✅ Save Stripe session.id explicitly
      amount: session.amount_total / 100,
      amount_shipping: session.total_details.amount_shipping / 100,
      images: JSON.parse(session.metadata.images || "[]"),
      email: session.metadata.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(`✅ SUCCESS: Order ${session.id} added to Firestore`);
    })
    .catch((err) => {
      console.error("❌ Firestore insertion error:", err.message);
    });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const requestBuffer = await buffer(req);
    const payload = requestBuffer.toString();
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify Stripe signature
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Fulfill order
      return fulfillOrder(session)
        .then(() => res.status(200).end())
        .catch((err) => {
          console.error("⚠️ Webhook Fulfill Error:", err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// Required by Next.js API routes
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
