'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface PaymentFormData {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  tenantEmail: string;
  phoneNumber: string;
  paymentNotes: string;
}

export default function PaymentForm() {
  const [formData, setFormData] = useState<PaymentFormData>({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'UPI',
    paymentGateway: 'RAZORPAY',
    tenantEmail: '',
    phoneNumber: '',
    paymentNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleFetchInvoice = async () => {
    if (!formData.invoiceId.trim()) {
      toast.error('Please enter an invoice ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/finances/invoices/${formData.invoiceId}`);
      const data = await response.json();
      
      if (data.data) {
        setInvoiceDetails(data.data);
        setFormData(prev => ({
          ...prev,
          amount: data.data.amount,
          tenantEmail: data.data.tenantEmail || '',
        }));
        toast.success('Invoice details loaded');
      } else {
        toast.error('Invoice not found');
        setInvoiceDetails(null);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceId || !formData.amount || !formData.tenantEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/finances/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment initiated successfully');
        // In a real implementation, redirect to payment gateway
        if (data.paymentLink) {
          window.location.href = data.paymentLink;
        }
      } else {
        toast.error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Processing</h1>
            <p className="text-gray-600 mt-2">Initiate and process payments for invoices</p>
          </div>
          <Link href="/finances" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Invoice ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice ID <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="invoiceId"
                    value={formData.invoiceId}
                    onChange={handleInputChange}
                    placeholder="e.g., INV-001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchInvoice}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Fetch'}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Enter amount in rupees</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-600">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="NETBANKING">Net Banking</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="WALLET">Digital Wallet</option>
                </select>
              </div>

              {/* Payment Gateway */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Gateway <span className="text-red-600">*</span>
                </label>
                <select
                  name="paymentGateway"
                  value={formData.paymentGateway}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="PAYTM">Paytm</option>
                  <option value="PHONEPE">PhonePe</option>
                  <option value="GOOGLEPAY">Google Pay</option>
                </select>
              </div>

              {/* Tenant Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="tenantEmail"
                  value={formData.tenantEmail}
                  onChange={handleInputChange}
                  placeholder="tenant@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes</label>
                <textarea
                  name="paymentNotes"
                  value={formData.paymentNotes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Initiate Payment'}
              </button>
            </form>
          </div>

          {/* Invoice Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
              
              {invoiceDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Invoice Number</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{invoiceDetails.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Tenant Name</p>
                    <p className="text-gray-900 mt-1">{invoiceDetails.tenantName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Property</p>
                    <p className="text-gray-900 mt-1">{invoiceDetails.property}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Invoice Amount</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">₹{invoiceDetails.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Due Date</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(invoiceDetails.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
                    <p className={`mt-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      invoiceDetails.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoiceDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoiceDetails.status}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Enter an invoice ID and click "Fetch" to see details</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Payments are processed securely</li>
                <li>• Confirmation email sent to tenant</li>
                <li>• Transaction ID saved in system</li>
                <li>• Refunds available within 30 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
