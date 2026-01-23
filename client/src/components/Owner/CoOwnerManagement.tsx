'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ownerApi from '@/lib/ownerApi';

interface CoOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  sharePercentage: number;
  status: 'active' | 'invited' | 'pending' | 'rejected';
  joinedAt?: string;
}

export default function CoOwnerManagement() {
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sharePercentage: 50,
  });

  useEffect(() => {
    loadCoOwners();
  }, []);

  const loadCoOwners = async () => {
    try {
      setLoading(true);
      const res = await ownerApi.getCoOwners();
      if (res.data?.success) {
        setCoOwners(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load co-owners');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleAddCoOwner = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.name || !formData.email) {
        toast.error('Please fill all required fields');
        return;
      }

      if (formData.sharePercentage <= 0 || formData.sharePercentage > 100) {
        toast.error('Share percentage must be between 1 and 100');
        return;
      }

      const res = await ownerApi.addCoOwner(formData);

      if (res.data?.success) {
        setCoOwners([...coOwners, res.data.data]);
        setFormData({
          name: '',
          email: '',
          phone: '',
          sharePercentage: 50,
        });
        setShowAddForm(false);
        toast.success('Co-owner invitation sent successfully!');
      } else {
        toast.error(res.data?.message || 'Failed to add co-owner');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error adding co-owner');
    }
  };

  const handleRemoveCoOwner = async (id: string) => {
    if (!confirm('Are you sure you want to remove this co-owner?')) return;

    try {
      const res = await ownerApi.removeCoOwner(id);

      if (res.data?.success) {
        setCoOwners(coOwners.filter((co) => co.id !== id));
        toast.success('Co-owner removed successfully');
      } else {
        toast.error(res.data?.message || 'Failed to remove co-owner');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error removing co-owner');
    }
  };

  const handleUpdateShare = async (id: string, newShare: number) => {
    try {
      if (newShare <= 0 || newShare > 100) {
        toast.error('Share percentage must be between 1 and 100');
        return;
      }

      const res = await ownerApi.updateCoOwnerShare(id, newShare);

      if (res.data?.success) {
        setCoOwners(
          coOwners.map((co) => (co.id === id ? { ...co, sharePercentage: newShare } : co))
        );
        toast.success('Share updated successfully');
      } else {
        toast.error(res.data?.message || 'Failed to update share');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating share');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading co-owners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Co-Owner Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage ownership shares with other property owners</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Co-Owner'}
          </button>
        </div>

        {/* Add Co-Owner Form */}
        {showAddForm && (
          <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={handleAddCoOwner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter co-owner's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter co-owner's email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ownership Share (%) *</label>
                  <input
                    type="number"
                    name="sharePercentage"
                    value={formData.sharePercentage}
                    onChange={handleFormChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ownership percentage"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> An invitation will be sent to the co-owner's email. They need to verify and
                  accept to become an active co-owner.
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Send Invitation
              </button>
            </form>
          </div>
        )}

        {/* Co-Owners List */}
        <div className="px-6 py-6">
          {coOwners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No co-owners yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Add First Co-Owner
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {coOwners.map((coOwner) => (
                <div
                  key={coOwner.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{coOwner.name[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{coOwner.name}</h3>
                          <p className="text-sm text-gray-600">{coOwner.email}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">SHARE</p>
                          <p className="text-lg font-bold text-gray-900">{coOwner.sharePercentage}%</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 font-medium">STATUS</p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                              coOwner.status
                            )}`}
                          >
                            {coOwner.status}
                          </span>
                        </div>

                        {coOwner.phone && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium">PHONE</p>
                            <p className="text-sm text-gray-900">{coOwner.phone}</p>
                          </div>
                        )}

                        {coOwner.joinedAt && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium">JOINED</p>
                            <p className="text-sm text-gray-900">
                              {new Date(coOwner.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {coOwner.status === 'active' && (
                        <input
                          type="number"
                          value={coOwner.sharePercentage}
                          onChange={(e) => handleUpdateShare(coOwner.id, parseFloat(e.target.value))}
                          min="1"
                          max="100"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}

                      <button
                        onClick={() => handleRemoveCoOwner(coOwner.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
