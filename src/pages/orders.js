import Header from "../components/Header";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query
} from "firebase/firestore";
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
    return { props: {} };
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  // 🔥 Convert to v9 Modular Syntax  
  const ordersRef = collection(
    db,
    "next-amazon-users",
    session.user.email,
    "orders"
  );

  const q = query(ordersRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  // 🔥 Fetch line items for each Stripe order
  const orders = await Promise.all(
    snapshot.docs.map(async (order) => ({
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
      session,
    },
  };
}
