import { useEffect, useState } from 'react';
import { useSampleStore } from '../store/sampleStore';
import { useToastStore } from '../store/toastStore';
import SampleForm from '../components/SampleForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';
import type { Sample } from '../lib/api';

export default function Samples() {
  const {
    samples,
    loading,
    error,
    fetchSamples,
    deleteSample,
    fetchSample,
  } = useSampleStore();
  const { showToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSample, setEditingSample] = useState<number | null>(null);
  const [filterGarmentType, setFilterGarmentType] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });
  const [selectedImage, setSelectedImage] = useState<Sample | null>(null);

  useEffect(() => {
    fetchSamples(filterGarmentType || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGarmentType]);

  const handleEdit = async (id: number) => {
    await fetchSample(id);
    setEditingSample(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSample(null);
    fetchSamples(filterGarmentType || undefined);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteSample(deleteConfirm.id);
        showToast('Sample deleted successfully', 'success');
        setDeleteConfirm({ show: false, id: null });
      } catch (error) {
        showToast('Failed to delete sample', 'error');
        setDeleteConfirm({ show: false, id: null });
      }
    }
  };

  const garmentTypes = Array.from(new Set(samples.map((s) => s.garment_type)));

  // Group samples by garment type
  const groupedSamples: Record<string, Sample[]> = {};
  samples.forEach((sample) => {
    if (!groupedSamples[sample.garment_type]) {
      groupedSamples[sample.garment_type] = [];
    }
    groupedSamples[sample.garment_type].push(sample);
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
            Sample Gallery
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Showcase your work samples to customers</p>
        </div>

        {/* Filters and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filterGarmentType}
              onChange={(e) => setFilterGarmentType(e.target.value)}
              className="input-modern w-full min-h-[44px]"
            >
              <option value="">All Garment Types</option>
              {garmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-success whitespace-nowrap min-h-[44px]"
          >
            + Add Sample
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        )}

        {/* Samples Gallery */}
        {!loading && (
          <>
            {samples.length === 0 ? (
              <div className="glass rounded-2xl shadow-xl shadow-black/5 p-12 text-center card-hover">
                <p className="text-gray-500 text-lg mb-4">No samples found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Add your first sample
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedSamples).map(([garmentType, typeSamples]) => (
                  <div key={garmentType} className="glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden card-hover">
                    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{typeSamples.length} sample(s)</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {typeSamples.map((sample) => (
                          <div
                            key={sample.id}
                            className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/50"
                          >
                            {/* Images */}
                            <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer relative">
                              {sample.images.length > 0 ? (
                                <>
                                  <img
                                    src={sample.images[0].image_url}
                                    alt={sample.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onClick={() => setSelectedImage(sample)}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                    }}
                                  />
                                  {sample.images.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                      +{sample.images.length - 1}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-gray-400"
                                  onClick={() => setSelectedImage(sample)}
                                >
                                  No Image
                                </div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                {sample.title}
                              </h3>
                              {sample.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {sample.description}
                                </p>
                              )}
                              
                              {/* Actions */}
                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                  onClick={() => handleEdit(sample.id)}
                                  className="text-blue-600 hover:text-blue-700 transition-all p-2 hover:bg-blue-50 rounded-lg"
                                  title="Edit sample"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(sample.id)}
                                  className="text-red-600 hover:text-red-700 transition-all p-2 hover:bg-red-50 rounded-lg"
                                  title="Delete sample"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sample Form Modal */}
        {showForm && (
          <SampleForm
            sampleId={editingSample}
            garmentType={filterGarmentType || undefined}
            onClose={handleFormClose}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <ConfirmDialog
            title="Delete Sample"
            message="Are you sure you want to delete this sample? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm({ show: false, id: null })}
          />
        )}

        {/* Image Modal */}
        {selectedImage && selectedImage.images.length > 0 && (
          <ImageModal
            images={selectedImage.images.map(img => img.image_url)}
            title={selectedImage.title}
            description={selectedImage.description}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  );
}

