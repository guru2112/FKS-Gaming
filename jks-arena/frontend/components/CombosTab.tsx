export default function CombosTab({ combos }: any) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {combos.map((c: any) => (
        <div
          key={c._id}
          className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
        >
          <h3 className="font-semibold text-slate-800">{c.name}</h3>

          <p className="text-sm text-gray-500 mt-2">
            {c.items.join(", ")}
          </p>

          <div className="flex justify-between mt-4">
            <span className="text-orange-500 font-bold">₹{c.price}</span>
            <span className="text-xs text-gray-500">
              {c.durationHours} hrs
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}