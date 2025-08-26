import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToBasket, removeFromBasket } from "../slices/basketSlice";

function CheckoutProducts({
  id,
  title,
  category,
  image,
  price,
  description,
  rating,
  hasPrime
}) {
  const dispatch = useDispatch();
  const addHandler = () => {
    const products = {
      id,
      title,
      category,
      image,
      price,
      description,
      rating,
      hasPrime
    };
    dispatch(addToBasket(products));
  };
  const removeBasket = () => {
    dispatch(removeFromBasket({ id }));
  };

  const Currency = ({ amount, currency = "USD" }) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  return <span>{formatted}</span>;
};


  return (
    <>
      <div className="grid grid-cols-5">
        <Image src={image} width={200} height={201} objectFit="contain" />
        <div className="col-span-3 mx-5">
          <p>{title}</p>
          <div className="flex">
            {Array(rating)
              .fill()
              .map((_, i) => (
                <StarIcon className="h-5 text-yellow-500" key={i} />
              ))}
          </div>
          <p className="text-xs my-2 line-clamp-3">{description}</p>
          <Currency amount={price} currency="USD" />
          {hasPrime && (
            <div className="flex items-center space-x-2">
              <img src="https://links.papareact.com/fdw" className="w-12" />
              <p className="text-xs ml-2 text-gray-500">
                FREE Next day Delivery
              </p>
            </div>
          )}
        </div>
        <div className="flex-col flex space-y-2 my-auto justify-self-end">
          <button className="button" onClick={addHandler}>
            Add to Basket
          </button>
          <button className="button" onClick={removeBasket}>
            Remove from Basket
          </button>
        </div>
      </div>
    </>
  );
}

export default CheckoutProducts;
