import { useEffect, useState } from 'react';
import { useSampleStore } from '../store/sampleStore';

interface SampleFormProps {
  sampleId?: number | null;
  garmentType?: string;
  onClose: () => void;
}

const GARMENT_TYPES = [
  'blazer',
  'pant',
  'shirt',
  'salwar',
  'panjabi',
  'blouse',
  'kurta',
  'saree',
  'other',
];

export default function SampleForm({ sampleId, garmentType, onClose }: SampleFormProps) {
  const { createSample, updateSample, fetchSample, loading, selectedSample } = useSampleStore();
  const [formData, setFormData] = useState({
    garment_type: garmentType || '',
    title: '',
    description: '',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');

  useEffect(() => {
    if (sampleId && selectedSample?.id === sampleId) {
      setFormData({
        garment_type: selectedSample.garment_type,
        title: selectedSample.title,
        description: selectedSample.description || '',
        images: selectedSample.images.map(img => img.image_url),
      });
    } else if (sampleId) {
      fetchSample(sampleId);
    } else if (!sampleId) {
      // Reset form when creating new sample
      setFormData({
        garment_type: garmentType || '',
        title: '',
        description: '',
        images: [],
      });
      setUploadMethod('upload');
    }
  }, [sampleId, selectedSample, garmentType, fetchSample]);

  useEffect(() => {
    if (sampleId && selectedSample?.id === sampleId) {
      setFormData({
        garment_type: selectedSample.garment_type,
        title: selectedSample.title,
        description: selectedSample.description || '',
        images: selectedSample.images.map(img => img.image_url),
      });
    }
  }, [sampleId, selectedSample]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let processedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, images: 'Please select only image files' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, images: 'Image size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push(base64String);
        processedCount++;

        if (processedCount === totalFiles) {
          setFormData({ ...formData, images: [...formData.images, ...newImages] });
          setErrors({ ...errors, images: '' });
        }
      };
      reader.onerror = () => {
        setErrors({ ...errors, images: 'Failed to read image file' });
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = '';
  };

  const handleUrlAdd = (url: string) => {
    if (!url.trim()) return;
    try {
      new URL(url);
      setFormData({ ...formData, images: [...formData.images, url] });
      setErrors({ ...errors, images: '' });
    } catch {
      setErrors({ ...errors, images: 'Please enter a valid URL' });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.garment_type.trim()) {
      newErrors.garment_type = 'Garment type is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (sampleId) {
        await updateSample(sampleId, {
          garment_type: formData.garment_type,
          title: formData.title,
          description: formData.description,
          images: formData.images,
        });
      } else {
        await createSample({
          garment_type: formData.garment_type,
          title: formData.title,
          description: formData.description,
          images: formData.images,
        });
      }
      onClose();
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slideUp">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {sampleId ? 'Edit Sample' : 'Add New Sample'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Garment Type */}
            <div>
              <label htmlFor="garment_type" className="block text-sm font-medium text-gray-700 mb-2">
                Garment Type <span className="text-red-500">*</span>
              </label>
              <select
                id="garment_type"
                value={formData.garment_type}
                onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                className={`input-modern w-full ${errors.garment_type ? 'border-red-500' : ''}`}
                disabled={!!sampleId}
              >
                <option value="">Select garment type</option>
                {GARMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.garment_type && (
                <p className="mt-1 text-sm text-red-600">{errors.garment_type}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`input-modern w-full ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Classic Blue Blazer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input-modern w-full"
                placeholder="Add details about this sample..."
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">({formData.images.length} uploaded)</span>
              </label>
              
              {/* Upload Method Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadMethod === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadMethod === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload Files
                </button>
              </div>

              {/* URL Input */}
              {uploadMethod === 'url' && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    id="image_url"
                    className="input-modern flex-1"
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleUrlAdd(target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleUrlAdd(input.value);
                      input.value = '';
                    }}
                    className="btn-primary whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* File Upload */}
              {uploadMethod === 'upload' && (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mb-3"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (multiple files supported)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                </label>
              )}

              {errors.images && (
                <p className="mt-1 text-sm text-red-600 mb-3">{errors.images}</p>
              )}

              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Uploaded Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/200x200?text=Invalid';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : sampleId ? 'Update Sample' : 'Add Sample'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

