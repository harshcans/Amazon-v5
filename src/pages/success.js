import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { collection, doc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase"; // make sure you have a firebase.js client config

function Success() {
  const router = useRouter();
  const { data: session } = useSession();
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    if (!session) return;

    const fetchOrder = async () => {
      try {
        const ordersRef = collection(db, "next-amazon-users", session.user.email, "orders");
        const q = query(ordersRef, orderBy("timestamp", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setLatestOrder(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("❌ Error fetching order:", err.message);
      }
    };

    fetchOrder();
  }, [session]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Thanks for Ordering | Riancci Success</title>
      </Head>
      <Header />
      <main className="max-w-screen-lg mx-auto">
        <div className="flex flex-col p-10 bg-white">
          <div className="flex items-center space-x-2 mb-5">
            <CheckCircleIcon className="text-green-500 h-10" />
            <h1 className="text-3xl">
              Thank you, your order has been confirmed!
            </h1>
          </div>
          <p>
            Thank you for shopping with us. We'll send a confirmation once your
            item has shipped.
          </p>

          {latestOrder && (
            <div className="mt-6 border-t pt-4">
              <h2 className="font-semibold text-xl mb-2">Your Order</h2>
              <p><strong>Order ID:</strong> {latestOrder.id}</p>
              <p><strong>Total:</strong> ${latestOrder.amount}</p>
              <div className="mt-2 flex gap-4 flex-wrap">
                {latestOrder.images?.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Order item"
                    className="h-24 object-contain"
                  />
                ))}
              </div>
            </div>
          )}

          <button onClick={() => router.push("/")} className="button mt-8">
            Shop More
          </button>
        </div>
      </main>
    </div>
  );
}

export default Success;
