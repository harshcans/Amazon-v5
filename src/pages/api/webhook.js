// pages/api/webhook.js
import { buffer } from "micro";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// ✅ Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString()
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

// 🔹 Save order into Firestore
const fulfillOrder = async (session) => {
  console.log("🔔 Fulfilling order:", session.id);

  return db
    .collection("next-amazon-users")
    .doc(session.metadata.email)
    .collection("orders")
    .doc(session.id)
    .set({
      id: session.id,
      amount: session.amount_total / 100,
      amount_shipping: session.total_details?.amount_shipping / 100 || 0,
      images: JSON.parse(session.metadata.images || "[]"),
      email: session.metadata.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(`✅ SUCCESS: Order ${session.id} added to Firestore`);
    })
    .catch((err) => {
      console.error("❌ Firestore insertion error:", err.message);
      throw new Error(err.message);
    });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    // ✅ Verify Stripe event signature
    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        await fulfillOrder(session);
        return res.status(200).end();
      } catch (err) {
        console.error("⚠️ Webhook Fulfill Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// ✅ Required by Next.js API routes (for raw body parsing)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
