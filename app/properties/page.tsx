"use client";

import { useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import {
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiInbox,
  FiHome,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";

export default function AdminProperties() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "live">("pending");
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        const res = await api.get("/properties/admin/pending");
        setData(res.data);
      } else {
        const res = await api.get("/properties", {
          params: { limit: 100 },
        });
        setData(res.data.properties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    if (confirm("Are you sure you want to approve this listing? It will become visible to all users.")) {
      try {
        setSubmitting(true);
        await api.patch(`/properties/admin/${id}/approve`);
        alert("Listing approved successfully!");
        setSelectedProperty(null);
        fetchProperties();
      } catch (error: any) {
        alert(error?.response?.data?.message || "Could not approve listing.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReject = async (id: number) => {
    if (confirm("Are you sure you want to reject this listing?")) {
      try {
        setSubmitting(true);
        await api.patch(`/properties/admin/${id}/reject`);
        alert("Listing rejected successfully.");
        setSelectedProperty(null);
        fetchProperties();
      } catch (error: any) {
        alert(error?.response?.data?.message || "Could not reject listing.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleTakeDown = async (id: number) => {
    if (confirm("Are you sure you want to take down this property? It will be archived.")) {
      try {
        setSubmitting(true);
        await api.patch(`/properties/admin/${id}/reject`);
        alert("Listing taken down successfully.");
        setSelectedProperty(null);
        fetchProperties();
      } catch (error: any) {
        alert(error?.response?.data?.message || "Could not archive listing.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">
              Properties <span className="text-brandRed">Studio</span>
            </h1>
            <p className="admin-hero-subtitle">
              Verify listing credentials, view ownership proofs, and manage property approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex bg-white/5 border border-white/10 rounded-md p-1">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "pending"
                    ? "bg-brandRed text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Awaiting Approval
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`px-4 py-2 rounded text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "live"
                    ? "bg-brandRed text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Active Listings
              </button>
            </div>

            <button onClick={fetchProperties} className="admin-red-button">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="admin-table">
          <table className="w-full min-w-[860px] text-left border-collapse">
            <thead>
              <tr className="admin-table-head">
                <th className="admin-th text-left">Property Details</th>
                <th className="admin-th text-left">Owner Info</th>
                <th className="admin-th text-center">Type / Price</th>
                <th className="admin-th text-center">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">
                    Loading properties data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <FiInbox className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                      No listings in this category
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((property) => (
                  <tr key={property.id} className="admin-row group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-brandBlack text-white flex items-center justify-center text-[11px] font-black group-hover:bg-brandRed transition-colors overflow-hidden">
                          {property.frontImage ? (
                            <img
                              src={`${API_URL}/uploads/properties/${property.frontImage}`}
                              alt="Property"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiHome size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-brandBlack uppercase tracking-tight group-hover:text-brandRed transition-colors">
                            {property.title}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5 max-w-[280px] truncate">
                            {property.address}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <p className="text-xs font-bold text-zinc-700">{property.owner?.name || "Unknown Owner"}</p>
                      <p className="text-[9px] text-zinc-400 font-semibold">{property.owner?.phone || "No phone"}</p>
                    </td>

                    <td className="p-5 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                        property.mode === "RENT" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {property.mode}
                      </span>
                      <p className="text-xs font-black text-brandBlack mt-1.5">
                        ₹{parseFloat(property.price).toLocaleString("en-IN")}
                        {property.mode === "RENT" ? "/mo" : ""}
                      </p>
                    </td>

                    <td className="p-5 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-md border ${
                        property.status === "LIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        property.status === "REVIEW" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-red-50 text-brandRed border-red-100"
                      }`}>
                        {property.status}
                      </span>
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProperty(property)}
                          className="p-2 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={14} />
                        </button>
                        {property.status === "REVIEW" ? (
                          <>
                            <button
                              onClick={() => handleApprove(property.id)}
                              className="p-2 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Approve Listing"
                            >
                              <FiCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(property.id)}
                              className="p-2 rounded bg-red-100 text-brandRed hover:bg-brandRed hover:text-white transition-colors"
                              title="Reject Listing"
                            >
                              <FiX size={14} />
                            </button>
                          </>
                        ) : property.status === "LIVE" ? (
                          <button
                            onClick={() => handleTakeDown(property.id)}
                            className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded bg-red-100 text-brandRed hover:bg-brandRed hover:text-white transition-colors"
                            title="Take Down"
                          >
                            Take Down
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-white/10 rounded-md shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-brandBlack text-white p-6 flex items-center justify-between">
              <div>
                <span className={`inline-block text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-brandRed mb-2`}>
                  {selectedProperty.category}
                </span>
                <h3 className="text-base font-black uppercase tracking-widest text-white">
                  {selectedProperty.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-zinc-400 hover:text-white transition-colors p-2"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Photo Previews */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/3] rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {selectedProperty.frontImage ? (
                    <img
                      src={`${API_URL}/uploads/properties/${selectedProperty.frontImage}`}
                      alt="Front View"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "No Front View Uploaded"
                  )}
                </div>
                <div className="aspect-[4/3] rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {selectedProperty.roomsImage ? (
                    <img
                      src={`${API_URL}/uploads/properties/${selectedProperty.roomsImage}`}
                      alt="Rooms View"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "No Rooms Image Uploaded"
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-3 gap-6 border-b border-zinc-100 pb-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Listing Price</h4>
                  <p className="text-sm font-black text-brandBlack mt-1">
                    ₹{parseFloat(selectedProperty.price).toLocaleString("en-IN")}
                    {selectedProperty.mode === "RENT" ? "/mo" : ""}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Listing Type</h4>
                  <p className="text-sm font-black text-zinc-800 uppercase tracking-widest mt-1">{selectedProperty.mode}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pace / Size</h4>
                  <p className="text-sm font-black text-zinc-800 mt-1">{selectedProperty.size}</p>
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-3 gap-6 border-b border-zinc-100 pb-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Floor</h4>
                  <p className="text-xs font-black text-zinc-800 mt-1">{selectedProperty.floor || "Ground"}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Furnishing</h4>
                  <p className="text-xs font-black text-zinc-800 mt-1 uppercase tracking-wide">
                    {selectedProperty.furnished?.replace("_", " ") || "UNFURNISHED"}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</h4>
                  <p className="text-xs font-black text-zinc-800 mt-1 uppercase tracking-widest">{selectedProperty.status}</p>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.details && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Owner Notes / Description</h4>
                  <p className="text-xs font-medium text-zinc-600 mt-2 leading-relaxed whitespace-pre-line">
                    {selectedProperty.details}
                  </p>
                </div>
              )}

              {/* Owner Info & Ownership Proof */}
              <div className="grid grid-cols-2 gap-6 bg-zinc-50 border border-zinc-200 rounded p-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Owner Contact Details</h4>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-zinc-800 flex items-center gap-2">
                      <FiUser size={12} className="text-brandRed" /> {selectedProperty.owner?.name || "Unknown Owner"}
                    </p>
                    <p className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                      <FiPhone size={12} className="text-brandRed" /> {selectedProperty.owner?.phone || "No phone number"}
                    </p>
                    <p className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                      <FiMail size={12} className="text-brandRed" /> {selectedProperty.owner?.email || "No email address"}
                    </p>
                  </div>
                </div>

                <div className="border-l border-zinc-200 pl-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ownership Document</h4>
                    <p className="text-[10px] font-medium text-zinc-500 mb-4">Verification proof submitted by user.</p>
                  </div>
                  {selectedProperty.docsFile ? (
                    <a
                      href={`${API_URL}/uploads/properties/${selectedProperty.docsFile}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brandBlack hover:bg-brandRed text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-md transition-colors w-full justify-center"
                    >
                      <FiDownload size={14} /> Download Document
                    </a>
                  ) : (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic py-3">
                      No document proof uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-zinc-50 p-6 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProperty(null)}
                disabled={submitting}
                className="px-6 py-3 border border-zinc-200 rounded-md text-zinc-700 hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Close
              </button>
              {selectedProperty.status === "REVIEW" && (
                <>
                  <button
                    onClick={() => handleReject(selectedProperty.id)}
                    disabled={submitting}
                    className="px-6 py-3 bg-red-100 text-brandRed hover:bg-brandRed hover:text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Reject Listing
                  </button>
                  <button
                    onClick={() => handleApprove(selectedProperty.id)}
                    disabled={submitting}
                    className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Approve Listing
                  </button>
                </>
              )}
              {selectedProperty.status === "LIVE" && (
                <button
                  onClick={() => handleTakeDown(selectedProperty.id)}
                  disabled={submitting}
                  className="px-6 py-3 bg-brandRed text-white hover:bg-brandBlack rounded-md text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Take Down Listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
