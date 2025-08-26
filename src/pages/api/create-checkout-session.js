import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    // Reject anything that's not a POST
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { items, email } = req.body;

    if (!items || !email) {
      return res.status(400).json({ error: "Missing items or email" });
    }

    console.log("📦 Items received:", items);
    console.log("📧 Email:", email);

    // Transform cart items for Stripe
    const transformedItems = items.map((item) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: item.price * 100, // cents
        product_data: {
          name: item.title,
          description: item.description,
          images: [item.image],
        },
      },
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_rates: ["shr_1KCpjZJ8paY3e8AjgjOmoF9o"], // keep your shipping rate ID
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "IN"],
      },
      line_items: transformedItems,
      mode: "payment",
      success_url: `${process.env.HOST}/success`,
      cancel_url: `${process.env.HOST}/checkout?order=cancel_payment`,
      metadata: {
        email,
        images: JSON.stringify(items.map((item) => item.image)),
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe checkout session error:", err);
    return res.status(500).json({ error: err.message });
  }
}
