import { useState, useEffect } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';
import type { PaymentCreate } from '../lib/api';

interface PaymentFormProps {
  orderId: number;
  onClose: () => void;
}

export default function PaymentForm({ orderId, onClose }: PaymentFormProps) {
  const { createPayment, loading } = usePaymentStore();
  const { selectedOrder, fetchOrder } = useOrderStore();

  const [formData, setFormData] = useState({
    amount: '',
    payment_type: 'partial' as 'advance' | 'partial' | 'full',
    payment_method: 'cash' as 'cash' | 'bkash' | 'nagad' | 'other',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderId && (!selectedOrder || selectedOrder.id !== orderId)) {
      fetchOrder(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const remainingAmount = selectedOrder ? selectedOrder.remaining_amount : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (amount > remainingAmount) {
      newErrors.amount = `Amount cannot exceed remaining balance of ৳${remainingAmount.toFixed(2)}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const paymentData: PaymentCreate = {
        order_id: orderId,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        date: formData.date,
        notes: formData.notes || undefined,
      };

      await createPayment(paymentData);
      if (selectedOrder) {
        await fetchOrder(orderId);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="glass rounded-2xl shadow-2xl max-w-md w-full border border-white/20 animate-slideUp">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Record Payment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedOrder && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Order Total: <span className="font-semibold text-gray-900">৳{selectedOrder.total_amount.toFixed(2)}</span></div>
              <div className="text-sm text-gray-600 mb-1">Paid: <span className="font-semibold text-green-600">৳{selectedOrder.paid_amount.toFixed(2)}</span></div>
              <div className="text-base font-bold text-red-600">
                Remaining: ৳{remainingAmount.toFixed(2)}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (BDT) *
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`input-modern w-full ${
                  errors.amount ? 'border-red-500 focus:ring-red-500/50' : ''
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type *
              </label>
              <select
                id="payment_type"
                value={formData.payment_type}
                onChange={(e) =>
                  setFormData({ ...formData, payment_type: e.target.value as PaymentCreate['payment_type'] })
                }
                className="input-modern w-full"
              >
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
              </select>
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value as PaymentCreate['payment_method'] })
                }
                className="input-modern w-full"
              >
                <option value="cash">Cash</option>
                <option value="bkash">Bkash</option>
                <option value="nagad">Nagad</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-modern w-full"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-modern w-full resize-none"
                placeholder="Payment notes..."
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

