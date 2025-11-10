import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useStaffStore } from '../store/staffStore';
import type { OrderItemCreate, OrderCreate } from '../lib/api';

interface OrderFormProps {
  orderId?: number | null;
  customerId?: number | null;
  onClose: () => void;
}

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    master_tailor: 'Master Tailor',
    tailor: 'Tailor',
    assistant_tailor: 'Assistant Tailor',
    cutting_master: 'Cutting Master',
    sewing_operator: 'Sewing Operator',
    finishing: 'Finishing',
    receptionist: 'Receptionist',
    delivery_person: 'Delivery Person',
    accountant: 'Accountant',
    other: 'Other',
  };
  return roleMap[role] || role;
};

export default function OrderForm({ orderId, customerId, onClose }: OrderFormProps) {
  const { createOrder, updateOrder, loading, selectedOrder, fetchOrder } = useOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { staff, fetchStaff } = useStaffStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>(customerId || '');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'cutting' | 'sewing' | 'ready' | 'delivered'>('pending');
  const [notes, setNotes] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [items, setItems] = useState<OrderItemCreate[]>([
    { garment_type: '', quantity: 1, price: 0, fabric_details: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
    fetchStaff();
    // Set default order date to today
    const today = new Date().toISOString().split('T')[0];
    setOrderDate(today);
    
    if (orderId) {
      fetchOrder(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder && orderId && selectedOrder.id === orderId) {
      setSelectedCustomerId(selectedOrder.customer_id);
      setOrderDate(selectedOrder.order_date.split(' ')[0]);
      setDeliveryDate(selectedOrder.delivery_date.split(' ')[0]);
      setStatus(selectedOrder.status as any);
      setNotes(selectedOrder.notes || '');
      setSelectedStaffIds(selectedOrder.assigned_staff?.map(as => as.staff_id) || []);
      setItems(
        selectedOrder.items.map((item) => ({
          garment_type: item.garment_type,
          quantity: item.quantity,
          price: item.price,
          fabric_details: item.fabric_details || '',
        }))
      );
    } else if (!orderId) {
      // Reset form when creating new order
      setSelectedCustomerId(customerId || '');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setStatus('pending');
      setNotes('');
      setSelectedStaffIds([]);
      setItems([{ garment_type: '', quantity: 1, price: 0, fabric_details: '' }]);
    }
  }, [selectedOrder, orderId, customerId]);

  const handleItemChange = (index: number, field: keyof OrderItemCreate, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { garment_type: '', quantity: 1, price: 0, fabric_details: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedCustomerId) {
      newErrors.customer = 'Customer is required';
    }
    if (!deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }
    items.forEach((item, index) => {
      if (!item.garment_type) {
        newErrors[`item_${index}_type`] = 'Garment type is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.price < 0) {
        newErrors[`item_${index}_price`] = 'Price must be 0 or greater';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const orderData: OrderCreate = {
        customer_id: Number(selectedCustomerId),
        order_date: orderDate || undefined,
        delivery_date: deliveryDate,
        items: items.map((item) => ({
          garment_type: item.garment_type,
          quantity: item.quantity,
          price: item.price,
          fabric_details: item.fabric_details || undefined,
        })),
        notes: notes || undefined,
        assigned_staff_ids: selectedStaffIds.length > 0 ? selectedStaffIds : undefined,
      };

      if (orderId) {
        await updateOrder(orderId, {
          status: status,
          delivery_date: deliveryDate,
          notes: notes || undefined,
        });
      } else {
        await createOrder(orderData);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="glass rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slideUp">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {orderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                id="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                disabled={!!customerId}
                className={`input-modern w-full ${
                  errors.customer ? 'border-red-500 focus:ring-red-500/50' : ''
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
            </div>

            {/* Dates and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                  <input
                  type="date"
                  id="orderDate"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  disabled={!!orderId}
                  className="input-modern w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className={`input-modern w-full ${
                    errors.deliveryDate ? 'border-red-500 focus:ring-red-500/50' : ''
                  }`}
                />
                {errors.deliveryDate && <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>}
              </div>
              {orderId && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="input-modern w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="cutting">Cutting</option>
                    <option value="sewing">Sewing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200/50 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Order Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 text-sm font-medium shadow-lg shadow-green-500/25 transition-all duration-200"
                >
                  + Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="mb-4 p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Garment Type *
                      </label>
                      <input
                        type="text"
                        value={item.garment_type}
                        onChange={(e) => handleItemChange(index, 'garment_type', e.target.value)}
                        className={`input-modern w-full ${
                          errors[`item_${index}_type`] ? 'border-red-500 focus:ring-red-500/50' : ''
                        }`}
                        placeholder="e.g., Blazer, Pant, Shirt"
                      />
                      {errors[`item_${index}_type`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_type`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (BDT) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`item_${index}_price`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_price`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric Details
                      </label>
                      <input
                        type="text"
                        value={item.fabric_details}
                        onChange={(e) => handleItemChange(index, 'fabric_details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Fabric description"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Staff Assignment */}
            {!orderId && (
              <div className="border-t border-gray-200/50 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Assign Staff (Optional)</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Staff Members
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {staff.length === 0 ? (
                      <p className="text-sm text-gray-500">No staff members available</p>
                    ) : (
                      staff.map((staffMember) => (
                        <label
                          key={staffMember.id}
                          className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.includes(staffMember.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStaffIds([...selectedStaffIds, staffMember.id]);
                              } else {
                                setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffMember.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{staffMember.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({getRoleLabel(staffMember.role)})</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedStaffIds.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedStaffIds.length} staff member(s) selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
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
                {loading ? 'Saving...' : orderId ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

