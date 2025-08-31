import Header from "../components/Header";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import db from "../../firebase";
import Order from "../components/Order";

function Orders({ orders = [] }) {
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
          {orders.length > 0 ? (
            orders.map(
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
            )
          ) : (
            <p className="text-gray-500">No orders found.</p>
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
    return { props: { orders: [] } };
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  let orders = [];

  try {
    const stripeOrders = await db
      .collection("next-amazon-users")
      .doc(session.user.email)
      .collection("orders")
      .orderBy("timestamp", "desc")
      .get();

    orders = await Promise.all(
      stripeOrders.docs.map(async (order) => {
        const data = order.data();

        const ts = data.timestamp?.toDate
          ? moment(data.timestamp.toDate()).unix()
          : 0;

        let lineItems = [];
        try {
          if (data.id) {
            lineItems = (
              await stripe.checkout.sessions.listLineItems(data.id, { limit: 100 })
            ).data;
          }
        } catch (err) {
          console.error("Stripe error:", err.message);
        }

        return {
          id: order.id,
          amount: data.amount || 0,
          amountShipping: data.amount_shipping || 0,
          images: data.images || [],
          timestamp: ts,
          items: lineItems,
        };
      })
    );
  } catch (err) {
    console.error("Error loading orders:", err.message);
  }

  return {
    props: { orders, session },
  };
}
