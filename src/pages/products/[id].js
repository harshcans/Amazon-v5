import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ProductPage({ product }) {
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-semibold">Product Not Found</h1>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{product.title} | Riancci</title>
      </Head>

      <Header />

      <main className="max-w-screen-xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        <img
          src={product.image}
          alt={product.title}
          className="w-full object-contain max-h-[500px]"
        />

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-4 text-gray-700">{product.description}</p>

          <p className="mt-6 text-2xl font-semibold">
            ₹ {product.price}
          </p>

          <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded">
            Add to Cart
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(
      `https://fakestoreapi.com/products/${params.id}`
    );

    if (!res.ok) {
      return { props: { product: null } };
    }

    const product = await res.json();

    return {
      props: { product },
    };
  } catch (err) {
    console.error("Product page error:", err);
    return {
      props: { product: null },
    };
  }
}
