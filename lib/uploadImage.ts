/**
 * Reusable image upload utility using internal server-side /api/upload route
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB limit to stay within Vercel body bounds

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file type (JPEG, PNG, WebP) and size (<= 4MB)
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
      error: 'File size must be less than 4MB.',
    };
  }

  return { valid: true };
}

/**
 * Uploads an image via the secure server-side /api/upload route.
 * Returns the hosted image URL on success.
 */
export async function uploadImage(imageFile: File): Promise<string> {
  const validation = validateImageFile(imageFile);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (response.ok && data?.url) {
    return data.url;
  }

  throw new Error(data?.error || 'Failed to upload image. Please try again.');
}

export default uploadImage;
