function Newsletter() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

        <h2 className="text-4xl font-bold text-white">
          Stay Updated
        </h2>

        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
          Subscribe to receive exclusive offers, new arrivals,
          discounts and updates from BloomBasket.
        </p>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">

          <input
            type="email"
            placeholder="Enter your email"
            className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 w-full md:w-96 text-white outline-none focus:border-violet-500"
          />

          <button className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-xl font-semibold transition">
            Subscribe
          </button>

        </div>

      </div>
    </section>
  );
}

export default Newsletter;