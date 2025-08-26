import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToBasket, removeFromBasket } from "../../slices/basketSlice";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Note: It's a good practice to name the file the same as the component.
// In this case, since the file is named `[id].js`, the component name is `ProductPage`.
// You can also just keep it as `Id`, but a more descriptive name is better.
function ProductPage({ product }) {
  const { id, title, category, image, price, description } = product;
  const dispatch = useDispatch();

  const MAX_RATING = 5;
  const MIN_RATING = 1;

  // Best practice to initialize state with a value.
  const [rating] = useState(
    Math.floor(Math.random() * (MAX_RATING - MIN_RATING + 1)) + MIN_RATING
  );
  // Using a boolean directly for a simple check is a good practice.
  const [hasPrime] = useState(Math.random() < 0.5);

  const Currency = ({ quantity, currency = "USD" }) => {
    // This hook is not needed here as it's a simple function component.
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(quantity);
    return <span>{formatted}</span>;
  };
  
  const addHandler = () => {
    // Use a descriptive name like `productToAdd`
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
    // Pass the product id to the reducer to identify which item to remove
    dispatch(removeFromBasket({ id }));
  };
  
  return (
    <div>
      <Head>
        <title>{title} | Amazon</title>
      </Head>
      <Header />
      <div className="bg-gray-200 p-10 mb-10">
        <div className="flex max-w-screen-xl mx-auto">
          <span className="font-medium">
            <Link href="/">Home</Link>
          </span>
          &nbsp;/
          <span className="font-medium">
            {/* The h3 tag is not necessary here. A span is more semantic. */}
            <span>Product</span>
          </span>
          &nbsp;/ <span className="text-yellow-500">{title}</span>
        </div>
      </div>
      <main className="max-w-screen-xl mx-auto mt-5">
        <div className="flex flex-wrap">
          <div className="px-5 mb-7 w-full md:w-7/12">
            <div className="w-full mb-4">
              {/* Use fill and objectFit for better image handling.
              The parent container must have position: "relative" for fill to work. */}
              <div style={{ position: "relative", width: "100%" }}>
                <Image
                  className="rounded-lg"
                  src={image}
                  alt={title} // Always include a descriptive alt text
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>

          <div className="px-5 mb-10 w-full md:w-5/12">
            <h1 className="my-2 text-3xl text-yellow-500 mb-2">{title}</h1>
            <p className="flex items-center mb-7">
              <b className="mr-1">Rating:</b>
              <div className="flex">
                {/* Use the index as a key for this simple case.
                Or even better, generate a unique key. You had a duplicate `key={id}` */}
                {Array(rating)
                  .fill()
                  .map((_, i) => (
                    <StarIcon key={i} className="h-6 text-yellow-500" />
                  ))}
              </div>
            </p>
            <p className="text-yellow-500 text-2xl my-4">
              <Currency quantity={price} currency="USD" />
            </p>
            <p className="text-gray-600 text-base mb-5">
              {description}
            </p>

            {hasPrime && (
              <div className="flex items-center space-x-2 mb-6">
                {/* Use the Next.js Image component for the prime logo as well */}
                <Image
                  src="https://links.papareact.com/fdw"
                  width={48} // You need to specify width and height. A rough estimate is fine.
                  height={48}
                  alt="Prime Delivery"
                  priority={true} // High-priority image for better performance
                />
                <p className="text-xs ml-2 text-gray-500">
                  FREE Next day Delivery
                </p>
              </div>
            )}
            <div className="flex-col flex space-y-2 my-auto justify-self-end">
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

// --- Data Fetching ---

export const getStaticPaths = async () => {
  const products = await fetch("https://fakestoreapi.com/products/").then(
    (response) => response.json()
  );

  const paths = products.map((product) => ({
    params: { id: product.id.toString() },
  }));

  return {
    paths,
    // Setting fallback to 'blocking' or true is more robust for production.
    // 'blocking' will server-render new paths on the first request.
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const { id } = context.params;
  const product = await fetch(`https://fakestoreapi.com/products/${id}`).then(
    (response) => response.json()
  );

  return {
    props: {
      product: {
        // Only get the properties you need to avoid bloated data
        id: product.id,
        price: Math.round(product.price * 98),
        image: product.image,
        description: product.description,
        title: product.title,
        category: product.category,
      },
    },
    // Use revalidate to incrementally update the page.
    // This is great for products where the price or info might change.
    revalidate: 60, // Regenerate the page every 60 seconds
  };
};