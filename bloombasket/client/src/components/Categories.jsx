import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Electronics",
    image: "https://placehold.co/300x200?text=Electronics",
  },
  {
    id: 2,
    name: "Home Decor",
    image: "https://placehold.co/300x200?text=Home+Decor",
  },
  {
    id: 3,
    name: "Gifts",
    image: "https://placehold.co/300x200?text=Gifts",
  },
  {
    id: 4,
    name: "Photo Frames",
    image: "https://placehold.co/300x200?text=Photo+Frames",
  },
];

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-bold text-white">
            Shop by Category
          </h2>

          <p className="text-slate-400 mt-2">
            Find products from your favorite collections.
          </p>
        </div>

        <Link
          to="/shop"
          className="text-violet-400 hover:text-violet-300"
        >
          View All →
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/shop"
            className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500 transition-all duration-300"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
            />

            <div className="p-5">
              <h3 className="text-xl font-semibold text-white">
                {category.name}
              </h3>

              <p className="text-slate-400 mt-2">
                Explore our latest collection.
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;