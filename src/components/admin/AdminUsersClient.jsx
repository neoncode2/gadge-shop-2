"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";

export default function AdminUsersClient() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/admin/users${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ""}`);

      setUsers(data.users || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadUsers(search.trim());
  };

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Customer Directory</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">All registered users</h2>
          <p className="mt-2 text-sm text-slate-500">
            New registrations are saved with the <span className="font-semibold text-slate-700">user</span> role by default.
            You can promote selected accounts to <span className="font-semibold text-slate-700">admin</span> directly from your database.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, role..."
            className="w-64 bg-transparent text-sm outline-none"
          />
          <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
            Search
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {users.map((user) => (
              <div key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_1.2fr_120px_140px_160px] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name || "Unnamed user"}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.id}</p>
                </div>
                <p className="text-sm text-slate-600">{user.email || "No email"}</p>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                  user.role === "admin"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {user.role}
                </span>
                <span className="text-sm text-slate-600">{user.authType || "credentials"}</span>
                <span className="text-sm text-slate-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-BD")
                    : "N/A"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
