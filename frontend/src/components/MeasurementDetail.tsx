import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { MeasurementWithCustomer } from '../lib/api';

interface MeasurementDetailProps {
  measurement: MeasurementWithCustomer;
  onClose: () => void;
  onEdit: () => void;
}

export default function MeasurementDetail({ measurement, onClose, onEdit }: MeasurementDetailProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Measurement_${measurement.customer_name}_${measurement.garment_type}`,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Measurement Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Printable Content */}
          <div ref={printRef} className="print:p-8">
            <div className="mb-6 print:mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2 print:text-2xl">
                Measurement Slip
              </h3>
              <div className="text-sm text-gray-500 print:text-base">
                Date: {new Date(measurement.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="space-y-4 print:space-y-6">
              {/* Customer Info */}
              <div className="border-b pb-4 print:pb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2 print:text-base">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 print:gap-6">
                  <div>
                    <p className="text-sm text-gray-500 print:text-base">Name</p>
                    <p className="text-lg font-semibold text-gray-900 print:text-xl">
                      {measurement.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 print:text-base">Phone</p>
                    <p className="text-lg font-semibold text-gray-900 print:text-xl">
                      {measurement.customer_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Garment Info */}
              <div className="border-b pb-4 print:pb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2 print:text-base">Garment Information</h4>
                <div className="grid grid-cols-2 gap-4 print:gap-6">
                  <div>
                    <p className="text-sm text-gray-500 print:text-base">Garment Type</p>
                    <p className="text-lg font-semibold text-gray-900 print:text-xl">
                      {measurement.garment_type.charAt(0).toUpperCase() + measurement.garment_type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 print:text-base">Template</p>
                    <p className="text-lg font-semibold text-gray-900 print:text-xl">
                      {measurement.template_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-4 print:text-base print:mb-6">
                  Measurements (in cm)
                </h4>
                <div className="grid grid-cols-2 gap-4 print:gap-6">
                  {Object.entries(measurement.measurements_json).map(([field, value]) => (
                    <div key={field} className="border-b pb-2 print:pb-3">
                      <p className="text-sm text-gray-500 print:text-base capitalize">
                        {field.replace(/_/g, ' ')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 print:text-xl">
                        {value} cm
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-8 pt-4 border-t print:mt-12 print:pt-6">
              <p className="text-xs text-gray-400 text-center print:text-sm">
                Measurement ID: {measurement.id} | Created: {new Date(measurement.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Measurement
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Measurement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

