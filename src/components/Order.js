import moment from "moment";

function Order({ id, amount, amountShipping, images, timestamp, items }) {

  const Currency = ({ quantity, currency = "USD" }) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(quantity);

  return <span>{formatted}</span>;
};

  return (
    <>
      <div className="relative border ">
        <div className="flex item-center space-x-10 p-5 bg-gray-100 text-sm text-gray-600">
          <div className="font-bold text-xs">
            <p>ORDER CED</p>
            <p>{moment.unix(timestamp).format("DD MM YYYY")}</p>
          </div>

          <div>
            <p className="text-xs font-bold">TOTAL</p>
            <p>
              <Currency quantity={amount} currency="USD" /> - Next Day
              Delivery&nbsp;
              <Currency quantity={amountShipping} currency="USD" />
            </p>
          </div>
          <p className="text-sm whitespace-nowrap sm:text-xl self-end flex-1 text-right text-blue-500">
            {items.length} items
          </p>
          <p className=" absolute top-2 right-2 w-40 lg:w-72 truncate text-xs whitespace-nowrap ">
            ORDER # {id}
          </p>
        </div>
        <div className="p-5 sm:p-10 ">
          <div className="flex space-x-6 overflow-x-auto ">
            {images?.map((image) => (
              <img src={image} alt="" className="h-20 object-contain sm:32" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Order;
