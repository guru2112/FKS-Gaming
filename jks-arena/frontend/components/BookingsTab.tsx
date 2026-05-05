export default function BookingsTab({ bookings }: any) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((b: any) => (
        <div
          key={b._id}
          className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
        >
          <p className="text-sm text-gray-500">{b.device}</p>

          <h3 className="text-lg font-semibold text-slate-800 mt-1">
            {b.game || "Gaming Session"}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            {new Date(b.slotStart).toLocaleString()}
          </p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-orange-500 font-bold">
              ₹{b.totalPrice}
            </span>

            <span
              className={`text-xs px-3 py-1 rounded-full ${
                b.status === "upcoming"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {b.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}