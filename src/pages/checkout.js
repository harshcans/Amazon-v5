import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useSelector } from "react-redux";
import CheckoutProduct from "../components/CheckoutProducts";
import Header from "../components/Header";
import { selectItems, selectTotal } from "../slices/basketSlice";

// Load Stripe outside component to avoid reloading
const stripePromise = loadStripe(process.env.stripe_public_key);

function Checkout() {
  const { data: session } = useSession(); // ✅ FIXED destructuring

  const items = useSelector(selectItems);
  const total = useSelector(selectTotal);

  const Currency = ({ quantity, currency = "USD" }) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(quantity);
    return <span>{formatted}</span>;
  };

  const createCheckoutSession = async () => {
    const stripe = await stripePromise;

    // Call backend to create checkout session
    const checkoutSession = await axios.post("/api/create-checkout-session", {
      items,
      email: session.user.email,
    });

    // Redirect user to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: checkoutSession.data.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Checkout | Riancci</title>
      </Head>
      <Header />

      <main className="lg:flex max-w-screen-2xl mx-auto">
        {/* Left */}
        <div className="flex-grow m-5 shadow-sm">
          <img
            src="https://links.papareact.com/ikj"
            width={1020}
            height={250}
            alt="checkout banner"
            className="object-contain"
          />

          <div className="flex flex-col p-5 space-y-10 bg-white">
            <h1 className="text-3xl border-b pb-4">
              {items.length === 0 ? "Your cart is Empty" : "Shopping Cart"}
            </h1>

            {items.map((item, i) => (
              <CheckoutProduct
                key={i}
                id={item.id}
                title={item.title}
                rating={item.rating}
                price={item.price}
                description={item.description}
                category={item.category}
                image={item.image}
                hasPrime={item.hasPrime}
              />
            ))}
          </div>
        </div>

        {/* Right */}
        {items.length > 0 && (
          <div className="flex flex-col bg-white p-10 shadow-md">
            <h2 className="whitespace-nowrap">
              Subtotal ({items.length} items):{" "}
              <span className="font-bold">
                <Currency quantity={total} currency="USD" />
              </span>
            </h2>

            <button
              role="link"
              onClick={createCheckoutSession}
              disabled={!session}
              className={`button mt-2 ${
                !session &&
                "from-gray-300 to-gray-500 border-gray-200 cursor-not-allowed"
              }`}
            >
              {!session ? "Sign in to checkout" : "Proceed to checkout"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Checkout;

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}
