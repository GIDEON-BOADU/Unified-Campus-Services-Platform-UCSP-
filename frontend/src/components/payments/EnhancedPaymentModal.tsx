import React, { useState, useEffect } from 'react';
import { usePaymentSystem } from '../../hooks/usePaymentSystem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  Phone,
  Shield,
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: number;
    service_name: string;
    base_price: number;
  };
  quantity?: number;
  vendorInfo?: {
    mtn_momo_number?: string;
    vodafone_cash_number?: string;
    airtel_money_number?: string;
    telecel_cash_number?: string;
    preferred_payment_method?: string;
  };
  onSuccess: (message: string) => void;
}

export const EnhancedPaymentModal: React.FC<EnhancedPaymentModalProps> = ({
  isOpen,
  onClose,
  service,
  quantity = 1,
  vendorInfo,
  onSuccess
}) => {
  const {
    initiatePayment,
    verifyPayment,
    isProcessing,
    isVerifying,
    processError,
    verifyError
  } = usePaymentSystem();

  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'verification' | 'success' | 'error'>('select');
  const [selectedProvider, setSelectedProvider] = useState<'mtn' | 'vodafone' | 'airtel' | 'telecel' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = service.base_price * quantity;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedProvider(null);
      setPhoneNumber('');
      setReferenceId('');
      setPayment(null);
      setError(null);
    }
  }, [isOpen]);

  // Set default provider based on vendor preference
  useEffect(() => {
    if (vendorInfo?.preferred_payment_method) {
      setSelectedProvider(vendorInfo.preferred_payment_method as any);
    }
  }, [vendorInfo]);

  const providers = [
    {
      id: 'mtn' as const,
      name: 'MTN Mobile Money',
      icon: '📱',
      color: 'bg-yellow-500',
      number: vendorInfo?.mtn_momo_number
    },
    {
      id: 'vodafone' as const,
      name: 'Vodafone Cash',
      icon: '📞',
      color: 'bg-red-500',
      number: vendorInfo?.vodafone_cash_number
    },
    {
      id: 'airtel' as const,
      name: 'Airtel Money',
      icon: '📲',
      color: 'bg-orange-500',
      number: vendorInfo?.airtel_money_number
    },
    {
      id: 'telecel' as const,
      name: 'Telecel Cash',
      icon: '📱',
      color: 'bg-blue-500',
      number: vendorInfo?.telecel_cash_number
    }
  ];

  const handleProviderSelect = (provider: 'mtn' | 'vodafone' | 'airtel' | 'telecel') => {
    setSelectedProvider(provider);
    setStep('details');
    
    // Pre-fill phone number if available
    const providerInfo = providers.find(p => p.id === provider);
    if (providerInfo?.number) {
      setPhoneNumber(providerInfo.number);
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedProvider || !phoneNumber) return;

    setStep('processing');
    setError(null);

    try {
      const paymentData = {
        amount: totalAmount,
        phone: phoneNumber,
        provider: selectedProvider,
        orderId: service.id
      };

      const result = await initiatePayment(paymentData);
      
      if (result) {
        setPayment(result);
        setReferenceId(result.reference_number);
        setStep('verification');
      } else {
        setError(processError || 'Failed to initiate payment');
        setStep('error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setStep('error');
    }
  };

  const handleVerifyPayment = async () => {
    if (!referenceId) return;

    setStep('processing');

    try {
      const result = await verifyPayment(referenceId);
      
      if (result && result.status === 'successful') {
        setStep('success');
        onSuccess('Payment completed successfully!');
      } else {
        setError(verifyError || 'Payment verification failed');
        setStep('error');
      }
    } catch (err) {
      setError('An unexpected error occurred during verification');
      setStep('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getProviderInfo = () => {
    return providers.find(p => p.id === selectedProvider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{service.service_name}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Quantity: {quantity}</span>
              <span>Unit Price: ₵{service.base_price.toFixed(2)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-ucsp-green-600">₵{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Step 1: Provider Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-ucsp-green-300 hover:bg-ucsp-green-50 transition-colors"
                  >
                    <div className={`w-12 h-12 ${provider.color} rounded-full flex items-center justify-center text-white text-xl mb-2`}>
                      {provider.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                    {provider.number && (
                      <span className="text-xs text-gray-500 mt-1">{provider.number}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setStep('select')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change Method
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 ${getProviderInfo()?.color} rounded-full flex items-center justify-center text-white text-sm mr-3`}>
                    {getProviderInfo()?.icon}
                  </div>
                  <span className="font-medium text-gray-900">{getProviderInfo()?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Secure Payment</p>
                    <p>Your payment is processed securely through {getProviderInfo()?.name}. We never store your payment details.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={!phoneNumber || isProcessing}
                className="w-full bg-ucsp-green-500 hover:bg-ucsp-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₵{totalAmount.toFixed(2)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-ucsp-green-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 'verification' && payment && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Initiated</h3>
                <p className="text-gray-600">Please complete the payment on your phone</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Reference ID</span>
                  <button
                    onClick={() => copyToClipboard(payment.reference_number)}
                    className="text-ucsp-green-600 hover:text-ucsp-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono text-sm text-gray-900 break-all">{payment.reference_number}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Complete Payment</p>
                    <p>Check your phone for a payment prompt and complete the transaction using your {getProviderInfo()?.name} PIN.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="flex-1 bg-ucsp-green-500 hover:bg-ucsp-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Payment'
                  )}
                </button>
                
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
              <button
                onClick={onClose}
                className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Step 6: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">{error || 'An error occurred while processing your payment.'}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(processError || verifyError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Error</p>
                  <p>{processError || verifyError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
