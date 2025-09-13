"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Buyer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function BuyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [totalPages, setTotalPages] = useState(1);

  // Fetch buyers list
  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
      });
      const res = await fetch(`/api/buyers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setBuyers(json.data.data);
      setTotalPages(json.data.pagination.totalPages);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      toast.success("Buyer deleted successfully");
      fetchBuyers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Buyer Leads</h1>
        <Link
          href="/buyers/new"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + New Buyer
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-sm"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : buyers.length === 0 ? (
        <div>No buyers found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">Property</th>
                <th className="p-2 border">Budget</th>
                <th className="p-2 border">Timeline</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Updated</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{b.fullName}</td>
                  <td className="p-2 border">{b.phone}</td>
                  <td className="p-2 border">{b.city}</td>
                  <td className="p-2 border">{b.propertyType}</td>
                  <td className="p-2 border">
                    {b.budgetMin || "-"} - {b.budgetMax || "-"}
                  </td>
                  <td className="p-2 border">{b.timeline}</td>
                  <td className="p-2 border">{b.status}</td>
                  <td className="p-2 border">
                    {new Date(b.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-2 border flex gap-1">
                    <Link
                      href={`/buyers/${b.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/buyers/${b.id}?edit=true`}
                      className="text-yellow-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
