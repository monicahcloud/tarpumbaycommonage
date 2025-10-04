"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
export type ApplicationType = {
  id: string;
  applicantName: string;
  submittedAt: string | Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  feesPaid: boolean;
};

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/applications?status=${filter}&search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications);
        setLoading(false);
      });
  }, [filter, search]);

  return (
    <div className="p-6">
      <div className="flex space-x-2 mb-4">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setLoading(true);
          }}>
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by applicant or ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLoading(true);
          }}
        />
        <button
          onClick={() => {
            setLoading(true);
            // trigger fetch
          }}>
          Search
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Fees Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td>{app.applicantName}</td>
                <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                <td>{app.status}</td>
                <td>{app.feesPaid ? "✅" : "❌"}</td>
                <td>
                  <Link href={`/admin/${app.id}`}>View / Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
