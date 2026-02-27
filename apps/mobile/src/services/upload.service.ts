import apiClient from './api';

export interface UploadedFile {
  url: string;
  type: 'image' | 'video';
  publicId: string;
}

class UploadService {
  async uploadPostImages(files: { uri: string; name: string; type: string }[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });
    const response = await apiClient.post('/upload/post-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data?.files || [];
  }

  async uploadPostVideo(file: { uri: string; name: string; type: string }): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('video', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    const response = await apiClient.post('/upload/post-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data?.file;
  }

  async uploadStatusMedia(file: { uri: string; name: string; type: string }): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('media', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    const response = await apiClient.post('/upload/status-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data?.file;
  }
}

export default new UploadService();
