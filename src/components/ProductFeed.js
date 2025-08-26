import Product from "./Product";

function ProductFeed({ products }) {
  return (
    <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:-mt-52 mx-auto ">
      {products &&
        products
          .slice(0, 4)
          .map(({ id, title, category, image, price, description }) => (
            <Product
              key={id}
              id={id}
              title={title}
              category={category}
              description={description}
              price={Math.round(price * 98)}
              image={image}
            />
          ))}
      <img src="https://links.papareact.com/dyz" className="md:col-span-full" />
      <div className="md:col-span-2">
        {products &&
          products
            .slice(4, 5)
            .map(({ id, title, category, image, price, description }) => (
              <Product
                key={id}
                id={id}
                title={title}
                category={category}
                description={description}
                price={Math.round(price * 98)}
                image={image}
              />
            ))}
      </div>
      {products &&
        products
          .slice(5, 9)
          .map(({ id, title, category, image, price, description }) => (
            <Product
              key={id}
              id={id}
              title={title}
              category={category}
              description={description}
              price={Math.round(price * 98)}
              image={image}
            />
          ))}
      <img
        src="https://images-eu.ssl-images-amazon.com/images/G/31/img18/Fresh/Dec20/CatStore/SF_Header_1500x230_4.jpg"
        className="md:col-span-full"
      />
      <div className="md:col-span-2">
        {products &&
          products
            .slice(9, 10)
            .map(({ id, title, category, image, price, description }) => (
              <Product
                key={id}
                id={id}
                title={title}
                category={category}
                description={description}
                price={Math.round(price * 98)}
                image={image}
              />
            ))}
      </div>
      {products &&
        products
          .slice(10, products.length)
          .map(({ id, title, category, image, price, description }) => (
            <Product
              key={id}
              id={id}
              title={title}
              category={category}
              description={description}
              price={Math.round(price * 98)}
              image={image}
            />
          ))}
    </div>
  );
}

export default ProductFeed;
