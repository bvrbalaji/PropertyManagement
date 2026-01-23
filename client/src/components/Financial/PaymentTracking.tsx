'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Payment {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  property: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  paidDate: string;
  createdAt: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

export default function PaymentTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filterStatus, filterMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterMethod !== 'ALL') params.append('method', filterMethod);

      const response = await fetch(`/api/finances/payments?${params}`);
      const data = await response.json();
      
      const paymentList = data.data || [];
      setPayments(paymentList);

      // Calculate stats
      const totalAmount = paymentList.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      const successful = paymentList.filter((p: Payment) => p.status === 'SUCCESS').length;
      const failed = paymentList.filter((p: Payment) => p.status === 'FAILED').length;
      const pending = paymentList.filter((p: Payment) => p.status === 'PENDING').length;

      setStats({
        totalPayments: paymentList.length,
        totalAmount,
        successfulPayments: successful,
        failedPayments: failed,
        pendingPayments: pending,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetryPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/finances/payments/${paymentId}/retry`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Payment retry initiated');
        fetchPayments();
      } else {
        toast.error('Failed to retry payment');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast.error('Failed to retry payment');
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    
    try {
      const response = await fetch(`/api/finances/payments/${paymentId}/refund`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Refund processed successfully');
        fetchPayments();
      } else {
        toast.error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
            <p className="text-gray-600 mt-2">Monitor payments, refunds, and transaction history</p>
          </div>
          <Link href="/finances" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalPayments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{(stats?.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Successful</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats?.successfulPayments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Failed</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{stats?.failedPayments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{stats?.pendingPayments || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Invoice #, Tenant, Transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="NETBANKING">Net Banking</option>
                <option value="CARD">Card</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPayments}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tenant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.property}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.transactionId}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          {payment.status === 'FAILED' && (
                            <button
                              onClick={() => handleRetryPayment(payment.id)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                            >
                              Retry
                            </button>
                          )}
                          {payment.status === 'SUCCESS' && (
                            <button
                              onClick={() => handleRefundPayment(payment.id)}
                              className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
