'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ownerApi from '@/lib/ownerApi';

interface OwnershipDocument {
  id: string;
  propertyId: string;
  property: {
    name: string;
    address: string;
  };
  documentType: string;
  documentUrl: string;
  documentName: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  uploadedAt: string;
  expiryDate?: string;
  notes?: string;
}

export default function OwnershipDocuments() {
  const [documents, setDocuments] = useState<OwnershipDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [documentType, setDocumentType] = useState('title_deed');
  const [properties, setProperties] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { value: 'title_deed', label: 'Title Deed' },
    { value: 'mutation', label: 'Mutation Certificate' },
    { value: 'tax_receipt', label: 'Property Tax Receipt' },
    { value: 'sale_agreement', label: 'Sale Agreement' },
    { value: 'reg_certificate', label: 'Registration Certificate' },
    { value: 'layout_plan', label: 'Layout Plan' },
    { value: 'completion_cert', label: 'Completion Certificate' },
    { value: 'ownership_doc', label: 'Ownership Document' },
  ];

  useEffect(() => {
    loadDocuments();
    loadProperties();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await ownerApi.getOwnershipDocuments();
      if (res.data?.success) {
        setDocuments(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await ownerApi.getProperties();
      if (res.data?.success) {
        setProperties(res.data.data.map((op: any) => op.property));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!selectedProperty || !uploadedFile || !documentType) {
        toast.error('Please fill all required fields');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('propertyId', selectedProperty);
      formData.append('documentType', documentType);
      formData.append('file', uploadedFile);

      const res = await ownerApi.uploadOwnershipDocument(formData);

      if (res.data?.success) {
        setDocuments([...documents, res.data.data]);
        setUploadedFile(null);
        setSelectedProperty('');
        setDocumentType('title_deed');
        setShowUploadForm(false);
        toast.success('Document uploaded successfully');
      } else {
        toast.error(res.data?.message || 'Failed to upload document');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await ownerApi.deleteOwnershipDocument(id);

      if (res.data?.success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        toast.success('Document deleted successfully');
      } else {
        toast.error(res.data?.message || 'Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting document');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
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
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ownership Documents</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and verify your property ownership documents</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {showUploadForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Property *</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select property...</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name} - {prop.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Document Type *</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Upload File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="document-file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="document-file" className="cursor-pointer block">
                    <p className="text-sm text-gray-600">Drop file here or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or Image (Max 10MB)</p>
                  </label>
                </div>
                {uploadedFile && (
                  <p className="mt-2 text-sm text-green-600">✓ {uploadedFile.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {/* Documents List */}
        <div className="px-6 py-6">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No documents uploaded yet</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.documentName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{doc.property.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 text-gray-900">
                        {documentTypes.find((t) => t.value === doc.documentType)?.label}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                          doc.verificationStatus
                        )}`}
                      >
                        {doc.verificationStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="ml-2 text-gray-900">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {doc.expiryDate && (
                      <div>
                        <span className="text-gray-600">Expiry:</span>
                        <span className="ml-2 text-gray-900">{new Date(doc.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {doc.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-gray-600">
                        {doc.notes}
                      </div>
                    )}
                  </div>

                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 font-medium"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
