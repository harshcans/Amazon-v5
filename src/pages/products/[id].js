import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToBasket, removeFromBasket } from "../../slices/basketSlice";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// ------------------------
// PAGE COMPONENT
// ------------------------

function ProductPage({ product }) {
  const { id, title, category, image, price, description } = product;
  const dispatch = useDispatch();

  const MAX_RATING = 5;
  const MIN_RATING = 1;

  const [rating] = useState(
    Math.floor(Math.random() * (MAX_RATING - MIN_RATING + 1)) + MIN_RATING
  );

  const [hasPrime] = useState(Math.random() < 0.5);

  const Currency = ({ quantity, currency = "USD" }) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(quantity);
    return <span>{formatted}</span>;
  };

  const addHandler = () => {
    const productToAdd = {
      id,
      title,
      category,
      image,
      price,
      description,
      rating,
      hasPrime,
    };
    dispatch(addToBasket(productToAdd));
  };

  const removeHandler = () => {
    dispatch(removeFromBasket({ id }));
  };

  return (
    <div>
      <Head>
        <title>{title} | Amazon</title>
      </Head>

      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-200 p-10 mb-10">
        <div className="flex max-w-screen-xl mx-auto">
          <span className="font-medium">
            <Link href="/">Home</Link>
          </span>
          &nbsp;/&nbsp;
          <span className="font-medium">Product</span>
          &nbsp;/&nbsp;
          <span className="text-yellow-500">{title}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-screen-xl mx-auto mt-5">
        <div className="flex flex-wrap">
          {/* IMAGE */}
          <div className="px-5 mb-7 w-full md:w-7/12">
            <div className="w-full mb-4">
              <div style={{ position: "relative", width: "100%", height: "500px" }}>
                <Image
                  className="rounded-lg"
                  src={image}
                  alt={title}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="px-5 mb-10 w-full md:w-5/12">
            <h1 className="my-2 text-3xl text-yellow-500 mb-2">{title}</h1>

            {/* RATING */}
            <p className="flex items-center mb-7">
              <b className="mr-1">Rating:</b>
              <div className="flex">
                {Array(rating)
                  .fill()
                  .map((_, i) => (
                    <StarIcon key={i} className="h-6 text-yellow-500" />
                  ))}
              </div>
            </p>

            {/* PRICE */}
            <p className="text-yellow-500 text-2xl my-4">
              <Currency quantity={price} currency="USD" />
            </p>

            {/* DESCRIPTION */}
            <p className="text-gray-600 text-base mb-5">{description}</p>

            {/* PRIME DELIVERY */}
            {hasPrime && (
              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src="https://links.papareact.com/fdw"
                  width={48}
                  height={48}
                  alt="Prime"
                />
                <p className="text-xs text-gray-500">FREE Next Day Delivery</p>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex-col flex space-y-2 mt-5">
              <button className="button" onClick={addHandler}>
                Add to Basket
              </button>
              <button className="button" onClick={removeHandler}>
                Remove from Basket
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default ProductPage;

// ------------------------
// FIRESTORE DATA FETCHING (SSR)
// ------------------------

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

// Runs on every request
export async function getServerSideProps({ params }) {
  try {
    const docRef = doc(db, "products", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { notFound: true };
    }

    const data = docSnap.data();

    return {
      props: {
        product: {
          id: params.id,
          title: data.title,
          price: data.price,
          image: data.image,
          description: data.description,
          category: data.category,
        },
      },
    };
  } catch (err) {
    console.error("🔥 Firestore error:", err);
    return { notFound: true };
  }
}
