import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { supabase } from "../lib/supabase";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(name)
      `)
      .order("id", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Supabase Error:", error);
      setLoading(false);
      return;
    }

    const formattedProducts = data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      oldPrice: item.old_price,
      stock: item.stock,
      image: item.image_url,
      rating: item.rating,
      badge: item.badge,
      category: item.categories?.name || "Unknown",
    }));

    setProducts(formattedProducts);
    setLoading(false);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-white">
            Featured Products
          </h2>

          <p className="text-slate-400 mt-2">
            Handpicked products loved by our customers.
          </p>
        </div>

        <Link
          to="/shop"
          className="text-violet-400 hover:text-violet-300 font-semibold"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">
          Loading featured products...
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedProducts;