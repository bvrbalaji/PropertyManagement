'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ownerApi from '@/lib/ownerApi';

interface Property {
  id: string;
  name: string;
  address: string;
}

export default function PropertyTransfer() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [step, setStep] = useState<'select' | 'newowner' | 'review' | 'confirm'>('select');
  const [formData, setFormData] = useState({
    newOwnerEmail: '',
    newOwnerPhone: '',
    newOwnerName: '',
    reason: '',
    documents: [] as File[],
  });
  const [loading, setLoading] = useState(false);
  const [transferId, setTransferId] = useState('');

  React.useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const res = await ownerApi.getProperties();
      if (res.data?.success) {
        setProperties(res.data.data.map((op: any) => op.property));
      }
    } catch (error) {
      toast.error('Failed to load properties');
    }
  };

  const handlePropertySelect = () => {
    if (!selectedProperty) {
      toast.error('Please select a property');
      return;
    }
    setStep('newowner');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        documents: Array.from(e.target.files!),
      }));
    }
  };

  const handleSubmitTransfer = async () => {
    try {
      if (!formData.newOwnerEmail || !formData.newOwnerName) {
        toast.error('Please fill all required fields');
        return;
      }

      setLoading(true);

      const data = new FormData();
      data.append('propertyId', selectedProperty);
      data.append('newOwnerEmail', formData.newOwnerEmail);
      data.append('newOwnerPhone', formData.newOwnerPhone);
      data.append('newOwnerName', formData.newOwnerName);
      data.append('reason', formData.reason);

      formData.documents.forEach((doc, index) => {
        data.append(`documents`, doc);
      });

      const res = await ownerApi.initiatePropertyTransfer(data);

      if (res.data?.success) {
        setTransferId(res.data.data.id);
        setStep('confirm');
        toast.success('Transfer initiated successfully!');
      } else {
        toast.error(res.data?.message || 'Failed to initiate transfer');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error initiating transfer');
    } finally {
      setLoading(false);
    }
  };

  const property = properties.find((p) => p.id === selectedProperty);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Property Transfer</h1>
          <p className="mt-2 text-blue-100">Transfer ownership of your property to a new owner</p>
          <div className="mt-4 text-sm text-blue-200">
            <p>✓ Initiated in minutes</p>
            <p>✓ Completed within 5 business days</p>
            <p>✓ Full legal compliance</p>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['Select Property', 'New Owner Details', 'Review', 'Confirmation'].map((title, index) => (
              <React.Fragment key={index}>
                <div
                  className={`flex items-center space-x-2 ${
                    index <= ['select', 'newowner', 'review', 'confirm'].indexOf(step)
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      index <= ['select', 'newowner', 'review', 'confirm'].indexOf(step)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="hidden sm:inline font-medium">{title}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`hidden sm:block w-16 h-0.5 ${
                      index < ['select', 'newowner', 'review', 'confirm'].indexOf(step)
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Property */}
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Property *</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a property...</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name} - {prop.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only transfer properties where you are listed as the primary owner.
                </p>
              </div>

              <button
                onClick={handlePropertySelect}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: New Owner Details */}
          {step === 'newowner' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Selected Property:</strong> {property?.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">{property?.address}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">New Owner Name *</label>
                <input
                  type="text"
                  name="newOwnerName"
                  value={formData.newOwnerName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new owner's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="newOwnerEmail"
                  value={formData.newOwnerEmail}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new owner's email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="newOwnerPhone"
                  value={formData.newOwnerPhone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new owner's phone (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Transfer Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for transfer (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="documents"
                  />
                  <label htmlFor="documents" className="cursor-pointer block">
                    <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Max 10MB per file</p>
                  </label>
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.documents.map((doc, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        ✓ {doc.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Property:</strong> {property?.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {property?.address}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">New Owner Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Name:</strong> {formData.newOwnerName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.newOwnerEmail}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.newOwnerPhone || 'Not provided'}
                  </p>
                  {formData.reason && (
                    <p>
                      <strong>Reason:</strong> {formData.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This transfer process will require verification from both parties and
                  typically completes within 5 business days.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('newowner')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitTransfer}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Initiated Successfully!</h3>

              <div className="bg-gray-50 p-4 rounded-md my-6 text-left">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Transfer ID:</strong> {transferId}
                </p>
                <p className="text-sm text-gray-600">
                  An invitation has been sent to <strong>{formData.newOwnerEmail}</strong>. They will need to verify
                  and accept the transfer.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Expected completion:</strong> 5 business days. You'll receive updates via email.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep('select');
                  setFormData({
                    newOwnerEmail: '',
                    newOwnerPhone: '',
                    newOwnerName: '',
                    reason: '',
                    documents: [],
                  });
                  setSelectedProperty('');
                  setTransferId('');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Start New Transfer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
