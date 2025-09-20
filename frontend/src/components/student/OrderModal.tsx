import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, MapPin, MessageSquare, CheckCircle } from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { useOrders } from '../../hooks/useOrders';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  image?: string;
}

interface OrderModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: any) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createOrder, getServiceItems, isLoading } = useOrders();
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    special_instructions: '',
    delivery_address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (isOpen && service) {
      fetchServiceItems();
      setFormData({ special_instructions: '', delivery_address: '' });
      setOrderItems({});
      setError(null);
    }
  }, [isOpen, service]);

  const fetchServiceItems = async () => {
    if (!service.has_flexible_pricing) return;
    
    setLoadingItems(true);
    try {
      const items = await getServiceItems(service.id);
      setServiceItems(items);
    } catch (err) {
      console.error('Error fetching service items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 0) return;
    setOrderItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const getTotalPrice = () => {
    let total = 0;
    
    // Add base price if no flexible pricing
    if (!service.has_flexible_pricing && service.base_price) {
      total += service.base_price;
    }
    
    // Add item prices
    Object.entries(orderItems).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const item = serviceItems.find(i => i.id === itemId);
        if (item) {
          total += item.price * quantity;
        }
      }
    });
    
    return total;
  };

  const hasItemsSelected = () => {
    if (!service.has_flexible_pricing) return true; // Base price only
    return Object.values(orderItems).some(quantity => quantity > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasItemsSelected()) {
      setError('Please select at least one item to order.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        service: service.id,
        special_instructions: formData.special_instructions || undefined,
        delivery_address: formData.delivery_address || undefined,
        order_items: service.has_flexible_pricing 
          ? Object.entries(orderItems)
              .filter(([_, quantity]) => quantity > 0)
              .map(([itemId, quantity]) => ({ service_item: itemId, quantity }))
          : undefined
      };

      const order = await createOrder(orderData);

      if (order) {
        onSuccess?.(order);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ special_instructions: '', delivery_address: '' });
    setOrderItems({});
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Place Order</h2>
                <p className="text-sm text-gray-600">{service.service_name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Items */}
            {service.has_flexible_pricing ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Items</h3>
                {loadingItems ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading items...</p>
                  </div>
                ) : serviceItems.length > 0 ? (
                  <div className="space-y-4">
                    {serviceItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <p className="text-sm font-medium text-green-600 mt-1">
                              GHS {item.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (orderItems[item.id] || 0) - 1)}
                              disabled={!orderItems[item.id] || orderItems[item.id] <= 0}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {orderItems[item.id] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (orderItems[item.id] || 0) + 1)}
                              disabled={!item.is_available}
                              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No items available for this service</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">Service Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  GHS {service.base_price || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Fixed price for this service</p>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Special Instructions (Optional)
              </label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Any special requirements for your order..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Delivery Address (Optional)
              </label>
              <input
                type="text"
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                placeholder="Where should we deliver your order?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Total Price */}
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  GHS {getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₵</span>
                </div>
                <h3 className="font-medium text-gray-900">Payment Information</h3>
              </div>
              <p className="text-sm text-gray-600">
                Payment will be processed via mobile money (MTN MoMo, Vodafone Cash, Airtel Money, or Telecel Cash) 
                once your order is confirmed. You'll receive payment details from the service provider.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasItemsSelected() || isLoading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ordering...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
