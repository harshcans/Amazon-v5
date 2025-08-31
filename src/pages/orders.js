import Header from "../components/Header";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import db from "../../firebase";
import Order from "../components/Order";

function Orders({ orders }) {
  const { data: session } = useSession(); // ✅ fixed

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
  const session = await getSession(context); // ✅ keep only once

  if (!session) {
    return { props: {} };
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  // Get orders from Firestore
  const stripeOrders = await db
    .collection("next-amazon-users")
    .doc(session.user.email)
    .collection("orders")
    .orderBy("timestamp", "desc")
    .get();

  // Attach Stripe line items to each order
  const orders = await Promise.all(
    stripeOrders.docs.map(async (order) => ({
      id: order.id,
      amount: order.data().amount,
      amountShipping: order.data().amount_shipping,
      images: order.data().images,
      timestamp: moment(order.data().timestamp.toDate()).unix(),
      items: (
        await stripe.checkout.sessions.listLineItems(order.id, {
          limit: 100,
        })
      ).data,
    }))
  );

  return {
    props: {
      orders,
      session, // ✅ pass only one session prop
    },
  };
}
