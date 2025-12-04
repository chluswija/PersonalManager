const CLOUD_NAME = 'dqjhjeqrj';
const UPLOAD_PRESET = 'PersonalManager';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryResponse> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed: Network error'));
    });
    
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

export function getCloudinaryThumbnail(
  publicId: string,
  width: number = 200,
  height: number = 200
): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height}/${publicId}`;
}

export function getCloudinaryUrl(publicId: string, transformation?: string): string {
  const transformPart = transformation ? `${transformation}/` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformPart}${publicId}`;
}
