import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";
import { useRouter } from "next/router";
import Head from "next/head";

function success() {
  const router = useRouter();
  return (
    <div className="bg-gray-100 h-screen">
      <Head>
        <title>Thanks for Ordering | Riancci Success </title>
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
            item has shipped, if you would like to buy another then look at our shop
          </p>
          <button onClick={() => router.push("/")} className="button mt-8">
            Shop More
          </button>
        </div>
      </main>
    </div>
  );
}
export default success;
