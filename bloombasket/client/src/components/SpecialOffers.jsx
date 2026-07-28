import { Link } from "react-router-dom";

function SpecialOffers() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left Offer */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 rounded-3xl p-10 flex flex-col justify-center">
          <span className="text-sm uppercase tracking-widest text-violet-200">
            Limited Time
          </span>

          <h2 className="text-4xl font-bold text-white mt-3">
            Save up to 50% Off
          </h2>

          <p className="text-slate-200 mt-4 leading-7">
            Discover amazing deals on gift hampers, home décor, and premium
            accessories.
          </p>

          <Link
            to="/shop"
            className="mt-8 w-fit bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
          >
            Shop Deals
          </Link>
        </div>

        {/* Right Offer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col justify-center">
          <span className="text-sm uppercase tracking-widest text-violet-400">
            New Arrival
          </span>

          <h2 className="text-4xl font-bold text-white mt-3">
            Premium Decoration Collection
          </h2>

          <p className="text-slate-400 mt-4 leading-7">
            Elegant photo frames, personalized gifts, and handcrafted décor
            designed to make every occasion special.
          </p>

          <Link
            to="/shop"
            className="mt-8 w-fit bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </section>
  );
}

export default SpecialOffers;