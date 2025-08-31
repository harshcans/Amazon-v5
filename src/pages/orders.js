// pages/orders.js

import Header from "../components/Header";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import db from "../../firebase";
import Order from "../components/Order";

function Orders({ orders }) {
  const { data: session } = useSession();

  return (
    <div>
      <Header />
      <main className="max-w-screen-lg mx-auto p-10">
        <div className="flex items-center border-b mb-2 pb-1 border-yellow-300">
          <h1 className="text-3xl">Your Orders</h1>
          {session && (
            <h5 className="ml-2">(Refresh the page to get recent orders)</h5>
          )}
        </div>

        {session ? (
          <h2>{orders.length} Orders</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}

        <div className="mt-5 space-y-4">
          {orders?.map(
            ({ id, amount, amountShipping, images, timestamp, items }) => (
              <Order
                key={id}
                id={id}
                amount={amount}
                images={images}
                amountShipping={amountShipping}
                timestamp={timestamp}
                items={items}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default Orders;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return { props: { orders: [] } }; // ✅ safe fallback
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  // Get user’s Firestore orders
  const stripeOrders = await db
    .collection("next-amazon-users")
    .doc(session.user.email)
    .collection("orders")
    .orderBy("timestamp", "desc")
    .get();

  // Attach Stripe line items
  const orders = await Promise.all(
    stripeOrders.docs.map(async (order) => {
      const data = order.data();

      // ✅ Ensure timestamp works whether it's Firestore Timestamp or UNIX
      const ts = data.timestamp?.toDate
        ? moment(data.timestamp.toDate()).unix()
        : data.timestamp;

      // ✅ Ensure we use Stripe Checkout Session ID for fetching items
      const sessionId = data.id || order.id; // store Stripe session.id in Firestore at order creation

      let lineItems = [];
      try {
        lineItems = (
          await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 })
        ).data;
      } catch (err) {
        console.error("Error fetching line items for order:", sessionId, err);
      }

      return {
        id: order.id,
        amount: data.amount,
        amountShipping: data.amount_shipping,
        images: data.images,
        timestamp: ts,
        items: lineItems,
      };
    })
  );

  return {
    props: {
      orders,
      session,
    },
  };
}
