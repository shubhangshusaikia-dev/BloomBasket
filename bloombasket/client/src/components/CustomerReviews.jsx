const reviews = [
  {
    id: 1,
    name: "Aarav Sharma",
    rating: 5,
    review:
      "Excellent quality! The gift hamper was beautifully packed and delivered on time.",
  },
  {
    id: 2,
    name: "Priya Das",
    rating: 5,
    review:
      "The photo frame looks amazing. The finish and design exceeded my expectations.",
  },
  {
    id: 3,
    name: "Rohan Patel",
    rating: 4,
    review:
      "Great shopping experience. Easy ordering process and fast delivery.",
  },
];

function CustomerReviews() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white">
          What Our Customers Say
        </h2>

        <p className="text-slate-400 mt-4">
          Thousands of happy customers trust BloomBasket.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-violet-500 transition duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold">
                {review.name.charAt(0)}
              </div>

              <div className="ml-4">
                <h3 className="font-semibold text-lg text-white">
                  {review.name}
                </h3>

                <p className="text-yellow-400">
                  {"⭐".repeat(review.rating)}
                </p>
              </div>
            </div>

            <p className="text-slate-400 leading-7">
              "{review.review}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;