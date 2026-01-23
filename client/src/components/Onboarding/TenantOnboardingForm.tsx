'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import onboardingApi from '@/lib/onboardingApi';
import { VehicleType, OnboardingStatus } from '../../../../shared/types';

const onboardingFormSchema = z.object({
  apartmentId: z.string().min(1, 'Apartment is required'),
  propertyId: z.string().min(1, 'Property is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive'),
  vehicleType: z.enum(['TWO_WHEELER', 'FOUR_WHEELER', 'SUV', 'COMMERCIAL']),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

interface OnboardingFormProps {
  apartmentId?: string;
  propertyId?: string;
  onSuccess?: (onboardingId: string) => void;
}

export default function TenantOnboardingForm({
  apartmentId,
  propertyId,
  onSuccess,
}: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [onboardingId, setOnboardingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leaseSignature, setLeaseSignature] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      apartmentId: apartmentId || '',
      propertyId: propertyId || '',
      vehicleType: 'FOUR_WHEELER',
    },
  });

  const vehicleType = watch('vehicleType');

  // Step 1: Create Onboarding Inquiry
  const onSubmitInquiry = async (data: OnboardingFormData) => {
    try {
      setIsLoading(true);
      const response = await onboardingApi.createOnboarding(data);

      if (response.data.success) {
        setOnboardingId(response.data.data.id);
        setStep(2);
        toast.success('Onboarding inquiry created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create onboarding inquiry');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Upload Documents
  const handleLeaseAgreementUpload = async (file: File) => {
    try {
      setIsLoading(true);
      // Upload file to storage (implement based on your storage solution)
      // const fileUrl = await uploadFileToStorage(file);

      // Mock file URL
      const fileUrl = `https://storage.example.com/${file.name}`;

      const response = await onboardingApi.uploadLeaseAgreement(
        onboardingId,
        fileUrl,
        file.name,
      );

      if (response.data.success) {
        setUploadedDocuments([...uploadedDocuments, 'LEASE']);
        toast.success('Lease agreement uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload lease agreement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleRegistrationUpload = async (file: File) => {
    try {
      setIsLoading(true);
      // Mock file URL
      const fileUrl = `https://storage.example.com/${file.name}`;

      const response = await onboardingApi.uploadVehicleRegistration(
        onboardingId,
        fileUrl,
        file.name,
      );

      if (response.data.success) {
        setUploadedDocuments([...uploadedDocuments, 'VEHICLE_REG']);
        toast.success('Vehicle registration uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload vehicle registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Sign Lease
  const handleSignLease = async () => {
    if (!leaseSignature.trim()) {
      toast.error('Please provide your signature');
      return;
    }

    try {
      setIsLoading(true);
      const response = await onboardingApi.signLeaseAgreement(
        onboardingId,
        leaseSignature,
      );

      if (response.data.success) {
        setStep(4);
        toast.success('Lease agreement signed successfully');
      }
    } catch (error) {
      toast.error('Failed to sign lease agreement');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Process Payment
  // COMMENTED OUT - Payment process to be enabled later
  // const handlePayment = async (amount: number) => {
  //   try {
  //     setIsLoading(true);

  //     // Initiate payment
  //     const initiateResponse = await onboardingApi.initiateSecurityDepositPayment(
  //       onboardingId,
  //       amount,
  //       'user@example.com',
  //       '9876543210',
  //     );

  //     if (initiateResponse.data.success) {
  //       const { orderId } = initiateResponse.data.data;

  //       // Simulate Razorpay payment (in real implementation, use Razorpay SDK)
  //       // This would trigger the Razorpay payment gateway
  //       toast.success('Payment initiated. Please complete payment in the popup.');

  //       // After payment completion, verify payment
  //       setTimeout(async () => {
  //         try {
  //           const verifyResponse = await onboardingApi.verifySecurityDepositPayment(
  //             onboardingId,
  //             orderId,
  //             'mock_payment_id',
  //             'mock_signature',
  //             amount,
  //           );

  //           if (verifyResponse.data.success) {
  //             setStep(5);
  //             toast.success('Payment verified successfully');
  //           }
  //         } catch (error) {
  //           toast.error('Payment verification failed');
  //         }
  //       }, 2000);
  //     }
  //   } catch (error) {
  //     toast.error('Failed to initiate payment');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Step 5: Assign Parking
  const handleAssignParking = async () => {
    try {
      setIsLoading(true);
      const response = await onboardingApi.assignParkingSlot(
        onboardingId,
        vehicleType,
      );

      if (response.data.success) {
        setStep(6);
        toast.success(
          `Parking slot ${response.data.data.slotNumber} assigned successfully`,
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Failed to assign parking slot',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Complete Onboarding
  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true);
      const response = await onboardingApi.completeOnboarding(onboardingId);

      if (response.data.success) {
        toast.success('Onboarding completed successfully!');
        onSuccess?.(onboardingId);
      }
    } catch (error) {
      toast.error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8">Tenant Onboarding</h1>

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
          {step === 1 && 'Flat Details'}
          {step === 2 && 'Document Upload'}
          {step === 3 && 'Lease Signing'}
          {step === 4 && 'Security Deposit'}
          {step === 5 && 'Parking Assignment'}
          {step === 6 && 'Completion'}
        </div>
      </div>

      {/* Step 1: Flat Details */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmitInquiry)} className="space-y-4">
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
              Move-in Date
            </label>
            <input
              type="date"
              {...register('moveInDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
            />
            {errors.moveInDate && (
              <p className="text-red-500 text-sm">{errors.moveInDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Security Deposit Amount
            </label>
            <input
              type="number"
              {...register('securityDeposit', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              min="0"
            />
            {errors.securityDeposit && (
              <p className="text-red-500 text-sm">
                {errors.securityDeposit.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <select
              {...register('vehicleType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
            >
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="FOUR_WHEELER">Four Wheeler</option>
              <option value="SUV">SUV</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Next'}
          </button>
        </form>
      )}

      {/* Step 2: Document Upload */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lease Agreement
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleLeaseAgreementUpload(e.target.files[0]);
                }
              }}
              className="block w-full"
              disabled={isLoading}
            />
            {uploadedDocuments.includes('LEASE') && (
              <p className="text-green-600 text-sm">✓ Lease agreement uploaded</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Registration
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleVehicleRegistrationUpload(e.target.files[0]);
                }
              }}
              className="block w-full"
              disabled={isLoading}
            />
            {uploadedDocuments.includes('VEHICLE_REG') && (
              <p className="text-green-600 text-sm">✓ Vehicle registration uploaded</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={uploadedDocuments.length < 2}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Lease Signing */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Signature
            </label>
            <textarea
              value={leaseSignature}
              onChange={(e) => setLeaseSignature(e.target.value)}
              placeholder="Please enter your full signature"
              className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border h-24"
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
              onClick={handleSignLease}
              disabled={isLoading || !leaseSignature.trim()}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing...' : 'Sign & Next'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Security Deposit Payment */}
      {/* COMMENTED OUT - Payment process to be enabled later */}
      {/* {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-700">
              You need to pay security deposit to proceed with the onboarding.
            </p>
          </div>

          <button
            onClick={() => handlePayment(5000)} // Replace with actual amount
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing Payment...' : 'Pay Security Deposit'}
          </button>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      )} */

      {/* Step 5: Parking Assignment */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-700">
              We will assign a parking slot based on your vehicle type:
              <strong> {vehicleType}</strong>
            </p>
          </div>

          <button
            onClick={handleAssignParking}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Assigning...' : 'Assign Parking Slot'}
          </button>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 6: Completion */}
      {step === 6 && (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-lg text-green-700 font-semibold">
              ✓ All steps completed!
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Your onboarding is almost complete. Click below to finalize.
            </p>
          </div>

          <button
            onClick={handleCompleteOnboarding}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>
      )}
    </div>
  );
}
