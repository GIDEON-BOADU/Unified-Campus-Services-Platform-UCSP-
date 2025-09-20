import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Service } from '../../types';

interface MobileMoneyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  quantity: number;
  totalAmount: number;
  vendorInfo?: {
    mtn_momo_number?: string;
    vodafone_cash_number?: string;
    airtel_money_number?: string;
    telecel_cash_number?: string;
    preferred_payment_method?: string;
  } | null;
  onSuccess?: (message: string) => void;
}

const MobileMoneyPaymentModal: React.FC<MobileMoneyPaymentModalProps> = ({
  isOpen,
  onClose,
  service,
  quantity,
  totalAmount,
  vendorInfo,
  onSuccess
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const paymentMethods = [
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      icon: '🟡',
      number: vendorInfo?.mtn_momo_number,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      icon: '🔴',
      number: vendorInfo?.vodafone_cash_number,
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      icon: '🔵',
      number: vendorInfo?.airtel_money_number,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'telecel_cash',
      name: 'Telecel Cash',
      icon: '🟣',
      number: vendorInfo?.telecel_cash_number,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ].filter(method => method.number);

  // Set default selected payment method when payment methods are available
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      // Try to use preferred payment method if available
      const preferredMethod = paymentMethods.find(method => 
        method.id === vendorInfo?.preferred_payment_method
      );
      
      if (preferredMethod) {
        setSelectedPaymentMethod(preferredMethod.id);
      } else {
        // Use first available method
        setSelectedPaymentMethod(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, selectedPaymentMethod, vendorInfo?.preferred_payment_method]);

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!selectedMethod) {
      setError('Selected payment method not available');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Import the payment service
      const { initiateMoMoPayment } = await import('../../services/payments');
      
      // Initiate MoMo payment
      const paymentResult = await initiateMoMoPayment({
        amount: totalAmount,
        phone: selectedMethod.number || '',
        provider: selectedMethod.id,
        order_id: `ORDER_${Date.now()}`,
        booking_id: null,
        service_id: service.id
      });

      if (paymentResult.success) {
        onSuccess?.(`Payment of GHS ${totalAmount.toFixed(2)} initiated successfully via ${selectedMethod.name}! Transaction ID: ${paymentResult.transaction_id}`);
        onClose();
      } else {
        setError(paymentResult.message || 'Payment initiation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaymentApp = (method: typeof paymentMethods[0]) => {
    const phoneNumber = method.number?.replace(/\D/g, '');
    if (!phoneNumber) return;

    // Create payment message
    const message = `Hi! I want to pay GHS ${totalAmount.toFixed(2)} for ${service.service_name} (${quantity} ${quantity > 1 ? 'items' : 'item'}). Please confirm.`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mobile Money Payment</h2>
                <p className="text-sm text-gray-600">Secure payment via mobile money</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{service.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">GHS {service.base_price}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-green-600">GHS {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Select Payment Method</h3>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? `${method.color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.number}</p>
                        </div>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-current" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">No Payment Methods Available</p>
                    <p className="text-sm text-yellow-700">
                      This vendor hasn't configured any mobile money payment methods yet. 
                      Please contact them directly to arrange payment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Payment Instructions</h4>
                <p className="text-sm text-blue-800">
                  After clicking "Pay Now", you'll be redirected to your mobile money app to complete the payment.
                  Make sure you have sufficient balance in your account.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-green-800">
                  Your payment is processed securely through mobile money. We never store your payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentMethods.length > 0 ? (
              <>
                <button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay GHS {totalAmount.toFixed(2)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {selectedPaymentMethod && (
                  <button
                    onClick={() => {
                      const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
                      if (method) openPaymentApp(method);
                    }}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Contact via WhatsApp
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  // Open WhatsApp with vendor contact info
                  const vendorPhone = vendorInfo?.mtn_momo_number || vendorInfo?.vodafone_cash_number || vendorInfo?.airtel_money_number || vendorInfo?.telecel_cash_number;
                  if (vendorPhone) {
                    const phoneNumber = vendorPhone.replace(/\D/g, '');
                    const message = `Hi! I'm interested in your service "${service.service_name}" and would like to arrange payment. Please let me know your available payment methods.`;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Contact Vendor
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPaymentModal;
