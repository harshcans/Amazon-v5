// pages/api/webhook.js
import { buffer } from "micro";
import * as admin from "firebase-admin";
import Stripe from "stripe";

/* ----------------------------
 🔹 Firebase Admin Initialization
----------------------------- */
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString()
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin initialization failed:", err.message);
  }
}

const db = admin.firestore();

/* ----------------------------
 🔹 Stripe Initialization
----------------------------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

/* ----------------------------
 🔹 Save Order to Firestore
----------------------------- */
const fulfillOrder = async (session) => {
  console.log("🔔 Attempting to fulfill order:", session.id);

  const metadata = session.metadata || {};
  const images = metadata.images ? JSON.parse(metadata.images) : [];

  const orderData = {
    id: session.id,
    amount: (session.amount_total ?? 0) / 100,
    amount_shipping: (session.total_details?.amount_shipping ?? 0) / 100,
    images,
    email: metadata.email || "unknown",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db
      .collection("next-amazon-users")
      .doc(orderData.email)
      .collection("orders")
      .doc(orderData.id)
      .set(orderData);

    console.log(`✅ SUCCESS: Order ${orderData.id} written to Firestore`);
  } catch (err) {
    console.error(`❌ Firestore insertion failed for ${orderData.id}:`, err.message);
    throw err;
  }
};

/* ----------------------------
 🔹 Webhook Handler
----------------------------- */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  let event;

  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    // Verify signature
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    console.log(`📩 Received Stripe event: ${event.type} (${event.id})`);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await fulfillOrder(event.data.object);
        break;

      // Example: Expand in future
      case "payment_intent.succeeded":
        console.log(`💰 PaymentIntent succeeded: ${event.id}`);
        break;

      case "payment_intent.payment_failed":
        console.warn(`❌ Payment failed: ${event.id}`);
        break;

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`⚠️ Error processing event ${event.id}:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

/* ----------------------------
 🔹 Next.js API Config
----------------------------- */
export const config = {
  api: {
    bodyParser: false, // Needed for Stripe raw body
    externalResolver: true,
  },
};
