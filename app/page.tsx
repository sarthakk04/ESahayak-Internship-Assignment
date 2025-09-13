"use client";

import { useEffect, useState, useRef } from "react";
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

const CITIES = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Office", "Retail"];
const STATUSES = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];
const TIMELINES = ["0-3m", "3-6m", ">6m", "Exploring"];

export default function BuyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [timeline, setTimeline] = useState(searchParams.get("timeline") || "");
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        city,
        propertyType,
        status,
        timeline,
      });
      const res = await fetch(`/api/buyers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch buyers");
      const json = await res.json();
      setBuyers(json.data.data);
      setTotalPages(json.data.pagination.totalPages);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [page, search, city, propertyType, status, timeline]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      toast.success("Buyer deleted successfully");
      fetchBuyers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams({
      search,
      city,
      propertyType,
      status,
      timeline,
    });
    window.open(`/api/buyers/export?${params.toString()}`, "_blank");
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Import failed");
      toast.success(`${json.data.inserted} buyers imported successfully`);
      if (json.data.errors.length > 0) {
        toast.error(`${json.data.errors.length} rows had errors`);
      }
      fetchBuyers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setPage(1), 500);
  };

  return (
    <div className="p-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Buyer Leads</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            Import CSV
          </button>
          <Link
            href="/buyers/new"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            + New Buyer
          </Link>
        </div>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImportCSV}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Property Types</option>
          {PROPERTY_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Timelines</option>
          {TIMELINES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Buyers Table & Loader */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <svg
              className="animate-spin h-12 w-12 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        )}

        {buyers.length === 0 && !loading ? (
          <div className="text-center py-6 text-gray-600">No buyers found.</div>
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
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}
