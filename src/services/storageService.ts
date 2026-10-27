import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Upload file to Firebase Storage with progress tracking and fallback
 */
export async function uploadMediaFile(
  file: File | Blob,
  pathFolder: 'avatars' | 'chat_attachments' | 'statuses',
  onProgress?: UploadProgressCallback
): Promise<{ url: string; name: string; size: number; type: string }> {
  const fileName = file instanceof File ? file.name : `recording_${Date.now()}.ogg`;
  const fileType = file.type || 'application/octet-stream';
  const fileSize = file.size;
  const storagePath = `${pathFolder}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, '')}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(percent));
        },
        (error) => {
          console.warn('Storage upload error, falling back to data URL:', error);
          // Fallback to data URL / object URL so user operation succeeds
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              url: reader.result as string,
              name: fileName,
              size: fileSize,
              type: fileType,
            });
          };
          reader.onerror = () => reject(error);
          reader.readAsDataURL(file);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              name: fileName,
              size: fileSize,
              type: fileType,
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  } catch (err) {
    // Immediate fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: fileName,
          size: fileSize,
          type: fileType,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
