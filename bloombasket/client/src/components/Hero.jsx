import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div>

            <span className="inline-block bg-violet-600/20 text-violet-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ New Collection 2026
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Shop Smarter.
              <br />
              Live Better.
            </h1>

            <p className="text-slate-400 text-lg mt-6 max-w-xl leading-8">
              Discover premium electronics, gifts, home decor, fashion,
              personalized items, and much more—all in one place.
            </p>

            <div className="flex gap-4 mt-10">

              <Link
                to="/shop"
                className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-xl font-semibold transition"
              >
                Shop Now
              </Link>

              <Link
                to="/shop"
                className="border border-slate-700 hover:border-violet-500 px-8 py-4 rounded-xl transition"
              >
                Explore
              </Link>

            </div>

            <div className="grid grid-cols-3 gap-8 mt-14">

              <div>
                <h2 className="text-3xl font-bold">10K+</h2>
                <p className="text-slate-400">Customers</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">500+</h2>
                <p className="text-slate-400">Products</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">4.9★</h2>
                <p className="text-slate-400">Rating</p>
              </div>

            </div>

          </div>

          {/* Right Side */}
          <div className="flex justify-center">

            <div className="w-full max-w-md h-[450px] rounded-3xl bg-gradient-to-br from-violet-600 to-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">

              <span className="text-8xl">
                🛍️
              </span>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;