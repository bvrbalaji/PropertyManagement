'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import offboardingApi from '@/lib/offboardingApi';
import { OffboardingStatus } from '../../../../shared/types';

const offboardingFormSchema = z.object({
  apartmentId: z.string().min(1, 'Apartment is required'),
  propertyId: z.string().min(1, 'Property is required'),
  onboardingId: z.string().min(1, 'Onboarding ID is required'),
  moveOutDate: z.string().min(1, 'Move-out date is required'),
});

type OffboardingFormData = z.infer<typeof offboardingFormSchema>;

interface OffboardingFormProps {
  apartmentId?: string;
  propertyId?: string;
  onboardingId?: string;
  onSuccess?: (offboardingId: string) => void;
}

export default function TenantOffboardingForm({
  apartmentId,
  propertyId,
  onboardingId: initialOnboardingId,
  onSuccess,
}: OffboardingFormProps) {
  const [step, setStep] = useState(1);
  const [offboardingId, setOffboardingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalSettlement, setFinalSettlement] = useState<any>(null);
  const [damageCharges, setDamageCharges] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OffboardingFormData>({
    resolver: zodResolver(offboardingFormSchema),
    defaultValues: {
      apartmentId: apartmentId || '',
      propertyId: propertyId || '',
      onboardingId: initialOnboardingId || '',
    },
  });

  // Step 1: Create Offboarding Request
  const onSubmitRequest = async (data: OffboardingFormData) => {
    try {
      setIsLoading(true);

      const response = await offboardingApi.createOffboardingRequest(data);

      if (response.data.success) {
        setOffboardingId(response.data.data.id);
        setStep(2);
        toast.success('Move-out request submitted successfully!');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Failed to submit move-out request',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Schedule Inspection
  const handleScheduleInspection = async (inspectionDate: string) => {
    try {
      setIsLoading(true);

      const response = await offboardingApi.scheduleInspection(
        offboardingId,
        'checklist_id', // Use actual checklist ID
        inspectionDate,
      );

      if (response.data.success) {
        setStep(3);
        toast.success('Inspection scheduled successfully');
      }
    } catch (error) {
      toast.error('Failed to schedule inspection');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Record Inspection
  const handleRecordInspection = async (inspectionData: any) => {
    try {
      setIsLoading(true);

      const response = await offboardingApi.recordMoveOutInspection(
        offboardingId,
        inspectionData,
      );

      if (response.data.success) {
        setStep(4);
        toast.success('Inspection recorded successfully');
      }
    } catch (error) {
      toast.error('Failed to record inspection');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Calculate Settlement
  const handleCalculateSettlement = async () => {
    try {
      setIsLoading(true);

      const response = await offboardingApi.calculateFinalSettlement(
        offboardingId,
        {
          damageCharges,
          description: 'Damage assessment based on move-out inspection',
        },
      );

      if (response.data.success) {
        setFinalSettlement(response.data.data.settlement);
        setStep(5);
        toast.success('Settlement calculated successfully');
      }
    } catch (error) {
      toast.error('Failed to calculate settlement');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Process Refund
  // COMMENTED OUT - Payment process to be enabled later
  // const handleProcessRefund = async () => {
  //   try {
  //     setIsLoading(true);

  //     const response = await offboardingApi.processRefund(
  //       offboardingId,
  //       'RAZORPAY',
  //       {
  //         bankAccount: 'XXXXXX1234',
  //         ifscCode: 'SBIN0001234',
  //       },
  //     );

  //     if (response.data.success) {
  //       setStep(6);
  //       toast.success('Refund processed successfully');
  //     }
  //   } catch (error) {
  //     toast.error('Failed to process refund');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Step 6: Issue Certificate and Complete
  const handleCompleteOffboarding = async () => {
    try {
      setIsLoading(true);

      // Issue clearance certificate
      await offboardingApi.issueClearanceCertificate(
        offboardingId,
        'https://storage.example.com/clearance_certificate.pdf',
      );

      // Complete offboarding
      const response = await offboardingApi.completeOffboarding(offboardingId);

      if (response.data.success) {
        toast.success('Offboarding completed successfully!');
        onSuccess?.(offboardingId);
      }
    } catch (error) {
      toast.error('Failed to complete offboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8">Tenant Offboarding</h1>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                s <= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Step {step} of 6:{' '}
          {step === 1 && 'Move-Out Request'}
          {step === 2 && 'Schedule Inspection'}
          {step === 3 && 'Move-Out Inspection'}
          {step === 4 && 'Final Settlement'}
          {step === 5 && 'Process Refund'}
          {step === 6 && 'Completion'}
        </div>
      </div>

      {/* Step 1: Move-Out Request */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-md mb-4">
            <p className="text-sm text-yellow-700">
              Please note: You must provide at least 30 days notice for move-out.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apartment ID
            </label>
            <input
              type="text"
              {...register('apartmentId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              disabled={!!apartmentId}
            />
            {errors.apartmentId && (
              <p className="text-red-500 text-sm">{errors.apartmentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property ID
            </label>
            <input
              type="text"
              {...register('propertyId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              disabled={!!propertyId}
            />
            {errors.propertyId && (
              <p className="text-red-500 text-sm">{errors.propertyId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Onboarding ID
            </label>
            <input
              type="text"
              {...register('onboardingId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              disabled={!!initialOnboardingId}
            />
            {errors.onboardingId && (
              <p className="text-red-500 text-sm">{errors.onboardingId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Intended Move-Out Date
            </label>
            <input
              type="date"
              {...register('moveOutDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              min={
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0]
              }
            />
            {errors.moveOutDate && (
              <p className="text-red-500 text-sm">{errors.moveOutDate.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit Request'}
          </button>
        </form>
      )}

      {/* Step 2: Schedule Inspection */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Date
            </label>
            <input
              type="datetime-local"
              id="inspectionDate"
              className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => {
                const dateInput = document.getElementById(
                  'inspectionDate',
                ) as HTMLInputElement;
                handleScheduleInspection(dateInput.value);
              }}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Move-Out Inspection */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Notes
            </label>
            <textarea
              placeholder="Describe the condition of the flat..."
              className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border h-24"
              id="inspectionNotes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Before/After Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="block w-full"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() =>
                handleRecordInspection({
                  inspectedBy: 'current_user',
                  damageAssessment: (
                    document.getElementById('inspectionNotes') as HTMLTextAreaElement
                  ).value,
                  items: [],
                  photos: [],
                })
              }
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Complete Inspection'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Settlement */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Damage Charges (INR)
            </label>
            <input
              type="number"
              value={damageCharges}
              onChange={(e) => setDamageCharges(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              min="0"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Settlement Preview</h3>
            <div className="space-y-1 text-sm">
              <p>Security Deposit: INR 50,000</p>
              <p>Damage Charges: INR {damageCharges}</p>
              <p>Pending Dues: INR 0</p>
              <p className="font-semibold text-green-600 pt-2">
                Refund Amount: INR {50000 - damageCharges}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={handleCalculateSettlement}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Calculate Settlement'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Process Refund */}
      {/* COMMENTED OUT - Payment process to be enabled later */}
      {/* {step === 5 && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">
              Your refund of{' '}
              <strong>
                INR {finalSettlement?.refundAmount || 50000}
              </strong>{' '}
              will be processed to your registered bank account.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(4)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={handleProcessRefund}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </div>
      )} */

      {/* Step 6: Completion */}
      {step === 6 && (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-lg text-green-700 font-semibold">
              ✓ Offboarding Complete!
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Thank you for your stay. Your clearance certificate has been
              issued.
            </p>
          </div>

          <button
            onClick={handleCompleteOffboarding}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Completing...' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
}
