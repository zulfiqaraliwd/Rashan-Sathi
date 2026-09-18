import api from './api';

const uploadService = {
  // Single image upload
  uploadSingle: async (file, folder = 'misc') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Multiple images upload
  uploadMultiple: async (files, folder = 'misc') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete image
  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
  },
};

export default uploadService;