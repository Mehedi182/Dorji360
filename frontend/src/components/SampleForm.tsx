import { useEffect, useState, useRef } from 'react';
import { useSampleStore } from '../store/sampleStore';
import { useToastStore } from '../store/toastStore';

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
  const { showToast } = useToastStore();
  const [formData, setFormData] = useState({
    garment_type: garmentType || '',
    title: '',
    description: '',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const prevSampleIdRef = useRef<number | null | undefined>(sampleId);
  const isInitializedRef = useRef(false);
  const hasImagesRef = useRef(false);

  // Debug: Log formData changes and track if images exist
  useEffect(() => {
    console.log('formData.images changed:', formData.images.length, 'images');
    hasImagesRef.current = formData.images.length > 0;
  }, [formData.images]);

  // Handle editing existing sample - ONLY run when sampleId exists
  useEffect(() => {
    if (!sampleId) {
      // Don't run this effect when creating new sample
      return;
    }
    
    if (selectedSample?.id === sampleId) {
      setFormData({
        garment_type: selectedSample.garment_type,
        title: selectedSample.title,
        description: selectedSample.description || '',
        images: selectedSample.images.map(img => img.image_url),
      });
      isInitializedRef.current = true;
    } else {
      // Fetch sample if we don't have it yet
      fetchSample(sampleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId, selectedSample?.id === sampleId ? selectedSample : null]);

  // Handle creating new sample - only run when sampleId changes
  useEffect(() => {
    if (!sampleId) {
      // Only reset if sampleId changed from a number to null/undefined (transitioning from edit to create)
      // OR if this is the very first render (!isInitializedRef.current)
      const sampleIdChanged = prevSampleIdRef.current !== sampleId;
      const wasEditing = typeof prevSampleIdRef.current === 'number';
      
      console.log('Create sample effect:', {
        sampleIdChanged,
        wasEditing,
        isInitialized: isInitializedRef.current,
        prevSampleId: prevSampleIdRef.current,
        currentSampleId: sampleId,
        hasImages: hasImagesRef.current
      });
      
      // CRITICAL: Never reset if form already has images (user has uploaded files)
      if (hasImagesRef.current) {
        console.log('SKIPPING reset - form has images!');
        isInitializedRef.current = true;
        prevSampleIdRef.current = sampleId;
        return;
      }
      
      // Only reset if:
      // 1. Transitioning from editing to creating (wasEditing && sampleIdChanged)
      // 2. OR first time opening the form (!isInitializedRef.current)
      if ((sampleIdChanged && wasEditing) || !isInitializedRef.current) {
        console.log('Resetting form');
        // Reset form only when transitioning from edit to create, or on first mount
        setFormData({
          garment_type: garmentType || '',
          title: '',
          description: '',
          images: [],
        });
        setUploadMethod('upload');
        isInitializedRef.current = true;
      } else {
        console.log('Preserving form data - already initialized');
      }
      // Otherwise, preserve existing form data (user might have uploaded images)
      // Don't reset if already initialized and sampleId hasn't changed
    }
    
    prevSampleIdRef.current = sampleId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log('Files selected:', files.length);
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const validationErrors: string[] = [];

    // First pass: validate all files
    fileArray.forEach((file) => {
      console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size);
      // Validate file type
      if (!file.type.startsWith('image/')) {
        validationErrors.push(`${file.name}: Please select only image files`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        validationErrors.push(`${file.name}: Image size must be less than 5MB`);
        return;
      }

      validFiles.push(file);
    });

    console.log('Valid files:', validFiles.length, 'Errors:', validationErrors.length);

    // If no valid files, show errors and return
    if (validFiles.length === 0) {
      console.log('No valid files, showing errors');
      setErrors((prev) => ({ ...prev, images: validationErrors.join('; ') }));
      e.target.value = '';
      return;
    }

    // Process valid files
    const newImages: (string | undefined)[] = new Array(validFiles.length);
    let processedCount = 0;
    const totalFiles = validFiles.length;

    console.log('Starting to process', totalFiles, 'files');

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(`File ${index + 1}/${totalFiles} loaded:`, file.name);
        const base64String = reader.result as string;
        if (base64String) {
          newImages[index] = base64String;
          console.log(`Base64 string length: ${base64String.length}`);
        } else {
          console.error(`No base64 string for file ${index + 1}`);
        }
        processedCount++;
        console.log(`Processed: ${processedCount}/${totalFiles}`);

        // When all files are processed, update state
        if (processedCount === totalFiles) {
          console.log('All files processed, updating state');
          // Filter out any undefined values and update state
          const validNewImages = newImages.filter((img): img is string => img !== undefined);
          console.log('Valid new images:', validNewImages.length);
          
          if (validNewImages.length > 0) {
            setFormData((prev) => {
              const updated = {
                ...prev,
                images: [...prev.images, ...validNewImages],
              };
              console.log('Updated formData.images count:', updated.images.length);
              return updated;
            });
          } else {
            console.error('No valid images to add!');
          }
          
          // Clear errors if we have valid images, or show validation errors if any
          if (validationErrors.length > 0) {
            setErrors((prev) => ({
              ...prev,
              images: validationErrors.join('; '),
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.images;
              return newErrors;
            });
          }
        }
      };
      reader.onerror = (error) => {
        console.error(`Error reading file ${index + 1}:`, error);
        validationErrors.push(`${file.name}: Failed to read image file`);
        processedCount++;
        
        if (processedCount === totalFiles) {
          // Update with successfully processed images if any
          const validNewImages = newImages.filter((img): img is string => img !== undefined);
          if (validNewImages.length > 0) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, ...validNewImages],
            }));
          }
          setErrors((prev) => ({
            ...prev,
            images: validationErrors.join('; '),
          }));
        }
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
      showToast(sampleId ? 'Sample updated successfully' : 'Sample created successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save sample';
      showToast(errorMessage, 'error');
      setErrors({ ...errors, submit: errorMessage });
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
              {(() => {
                console.log('Rendering image previews. formData.images.length:', formData.images.length);
                return formData.images.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Uploaded Images: ({formData.images.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((imageUrl, index) => {
                        console.log(`Rendering image ${index + 1}:`, imageUrl?.substring(0, 50) + '...');
                        return (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={imageUrl}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                                onError={(e) => {
                                  console.error(`Image ${index + 1} failed to load`);
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
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
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

