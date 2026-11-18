/**
 * Reusable image upload utility using ImgBB API per @docs/resource-imgbb.md
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file type (JPEG, PNG, WebP) and size (<= 5MB)
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size must be less than 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Uploads an image to ImgBB.
 * If NEXT_PUBLIC_IMGBB_API_KEY is configured, uploads directly to ImgBB.
 * Otherwise, falls back to local data URL for seamless development testing.
 */
export async function uploadImage(imageFile: File): Promise<string> {
  const validation = validateImageFile(imageFile);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey.trim()}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success && data.data?.url) {
      return data.data.url;
    }

    throw new Error(
      data?.error?.message || 'ImgBB upload failed. Please try again.'
    );
  }

  // Fallback for offline/mock development when API key is not yet set
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file into preview data.'));
    };
    reader.readAsDataURL(imageFile);
  });
}

export default uploadImage;
