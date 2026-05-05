export default function UsersTab({ users }: any) {
  return (
    <div className="grid gap-4">
      {users.map((user: any) => (
        <div
          key={user._id}
          className="bg-white p-5 rounded-xl shadow flex justify-between items-center hover:shadow-md transition"
        >
          <div>
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
            USER
          </span>
        </div>
      ))}
    </div>
  );
}