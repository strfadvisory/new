export type ImageContext = 'icon' | 'logo' | 'profile';

interface ImageLimits {
  maxSizeBytes: number;
  maxSizeLabel: string;
  maxWidth: number;
  maxHeight: number;
}

const IMAGE_LIMITS: Record<ImageContext, ImageLimits> = {
  icon: { maxSizeBytes: 500 * 1024, maxSizeLabel: '500KB', maxWidth: 512, maxHeight: 512 },
  logo: { maxSizeBytes: 2 * 1024 * 1024, maxSizeLabel: '2MB', maxWidth: 1024, maxHeight: 1024 },
  profile: { maxSizeBytes: 2 * 1024 * 1024, maxSizeLabel: '2MB', maxWidth: 2048, maxHeight: 2048 },
};

export function validateImageFile(file: File, context: ImageContext): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please upload a valid image file (JPG, PNG, GIF, or WebP)';
  }

  const limits = IMAGE_LIMITS[context];
  if (file.size > limits.maxSizeBytes) {
    return `File size must be less than ${limits.maxSizeLabel}. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return null;
}

export function validateImageResolution(file: File, context: ImageContext): Promise<string | null> {
  const limits = IMAGE_LIMITS[context];
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > limits.maxWidth || img.height > limits.maxHeight) {
        resolve(`Image resolution must be ${limits.maxWidth}x${limits.maxHeight}px or smaller. Your image is ${img.width}x${img.height}px`);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve('Unable to read image file. The file may be corrupted');
    };
    img.src = URL.createObjectURL(file);
  });
}
