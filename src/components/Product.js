import { useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { addToBasket } from "../slices/basketSlice";
import { useRouter } from "next/router";
import styles from "../styles/Product.module.css";

const MAX_RATING = 5;
const MIN_RATING = 1;

function Product({ id, title, category, image, price, description }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [rating, setRating] = useState(null);
  const [hasPrime, setHasPrime] = useState(null);

  // Generate random values client-side only
  useEffect(() => {
    setRating(
      Math.floor(Math.random() * (MAX_RATING - MIN_RATING + 1)) + MIN_RATING
    );
    setHasPrime(Math.random() < 0.5);
  }, []);

  const Currency = ({ quantity, currency = "USD" }) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(quantity);
    return <span>{formatted}</span>;
  };

  const addItemsHandler = () => {
    const products = {
      id,
      title,
      category,
      image,
      price,
      description,
      rating,
      hasPrime,
    };
    dispatch(addToBasket(products));
  };

  return (
    <div className="relative flex flex-col m-5 bg-white z-30 p-10 transform hover:scale-105 transition ease-out duration-300 cursor-pointer">
      <p className="absolute top-2 right-2 text-xs italic text-gray-400">
        {category}
      </p>

      {/* Image + Overlay */}
      <div
        className={`relative rounded-lg justify-center flex ${styles.product_image_wrapper}`}
      >
        <Image
          src={image}
          width={200}
          height={200}
          alt={title}
          className="cursor-pointer"
        />
        <div className={`rounded-lg cursor-pointer ${styles.product_image_overly}`}>
          <div className={`button rounded-lg ${styles.product_image_overly_button}`}>
            <span onClick={() => router.push("/products/" + id)}>
              View Details
            </span>
            <EyeIcon className="h-6" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className="my-3">{title}</h4>

      {/* Stars (only render after hydration) */}
      {rating !== null && (
        <div className="flex">
          {Array(rating)
            .fill()
            .map((_, i) => (
              <StarIcon key={i} className="h-5 text-yellow-500" />
            ))}
        </div>
      )}

      {/* Description */}
      <p className="text-xs my-2 line-clamp-2">{description}</p>

      {/* Price */}
      <div className="mb-5">
        <Currency quantity={price} currency="USD" />
      </div>

      {/* Prime badge (only after hydration) */}
      {hasPrime && (
        <div className="flex items-center space-x-2 -mt-5">
          <img src="https://links.papareact.com/fdw" alt="Prime" className="w-12" />
          <p className="text-xs ml-2 text-gray-500">FREE Next-day Delivery</p>
        </div>
      )}

      {/* Add to basket */}
      <button className="mt-auto button" onClick={addItemsHandler}>
        Add to basket
      </button>
    </div>
  );
}

export default Product;
