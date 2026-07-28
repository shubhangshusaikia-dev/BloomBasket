import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import SpecialOffers from "../components/SpecialOffers";
import CustomerReviews from "../components/CustomerReviews";
import Newsletter from "../components/Newsletter";

function Home() {
  return (
    <div className="bg-slate-950 text-white">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <SpecialOffers />
      <CustomerReviews />
      <Newsletter />
    </div>
  );
}

export default Home;