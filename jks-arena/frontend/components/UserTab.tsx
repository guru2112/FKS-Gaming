"use client";

interface UsersTabProps {
  users: any[];
  onRefresh?: () => void;
}

export default function UsersTab({ users, onRefresh }: UsersTabProps) {
  if (!users || users.length === 0) {
    return <p className="text-slate-500">No users found.</p>;
  }

  return (
    <div className="grid gap-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
      {users.map((user: any) => (
        <div
          key={user._id}
          className="bg-white p-5 rounded-xl shadow flex justify-between items-center hover:shadow-md transition"
        >
          <div>
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
            {user.role === 'admin' ? 'ADMIN' : 'USER'}
          </span>
        </div>
      ))}
    </div>
  );
}