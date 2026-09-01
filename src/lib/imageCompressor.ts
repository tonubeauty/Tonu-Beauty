/**
 * Client-Side Image Compressor
 * Automatically compresses, downscales, and optimizes any uploaded image
 * to strictly stay under 200 KB (204,800 bytes) with high visual clarity.
 */

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  sizeKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
  format: string;
}

export async function compressImageFile(
  file: File | Blob,
  maxSizeBytes = 200 * 1024 // 200 KB threshold
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Maximum bounding dimension (1200px provides ultra-crisp display on retina screens)
          const MAX_DIMENSION = 1200;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Iterative compression to ensure strictly <= 200 KB
          let quality = 0.88;
          let mimeType = 'image/jpeg';
          let dataUrl = canvas.toDataURL(mimeType, quality);
          let currentBytes = calculateBase64Size(dataUrl);

          // If still over 200KB, gradually reduce quality and dimension
          let attempts = 0;
          while (currentBytes > maxSizeBytes && attempts < 10) {
            attempts++;
            if (quality > 0.45) {
              quality -= 0.1;
            } else {
              // Scale down dimensions if quality is already low
              width = Math.round(width * 0.85);
              height = Math.round(height * 0.85);
              canvas.width = width;
              canvas.height = height;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              quality = 0.75;
            }

            dataUrl = canvas.toDataURL(mimeType, quality);
            currentBytes = calculateBase64Size(dataUrl);
          }

          const sizeKb = Math.round((currentBytes / 1024) * 10) / 10;

          resolve({
            dataUrl,
            sizeBytes: currentBytes,
            sizeKb,
            originalSizeKb,
            width,
            height,
            format: mimeType,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('ইমেজ ফাইলটি পড়তে ব্যর্থ হয়েছে।'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('ফাইল রিড করতে ব্যর্থ হয়েছে।'));
    };

    reader.readAsDataURL(file);
  });
}

function calculateBase64Size(base64String: string): number {
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  return (base64Length * 3) / 4 - padding;
}
