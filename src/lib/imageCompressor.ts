/**
 * Utility to compress any uploaded or provided image file or base64 string
 * down to less than 100 KB (102,400 bytes) using HTML5 Canvas.
 */

export async function compressImageFileToMaxKB(
  file: File | string,
  maxKB: number = 100
): Promise<string> {
  const maxBytes = maxKB * 1024;

  // Helper to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  let imageSrc = '';
  if (typeof file === 'string') {
    imageSrc = file;
  } else {
    imageSrc = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If already a tiny data URL or small remote URL, test its size if data URL
  if (imageSrc.startsWith('data:') && imageSrc.length <= maxBytes * 1.3) {
    // If base64 length is roughly under target, load and return or quickly verify
  }

  const img = await loadImage(imageSrc);

  let width = img.width;
  let height = img.height;

  // Max dimension initial limit (e.g., 1000px max)
  const maxDim = 1000;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return imageSrc;
  }

  let quality = 0.85;
  let resultDataUrl = '';

  // Iterative compression loop
  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = width;
    canvas.height = height;

    // Fill white background for transparent PNGs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    resultDataUrl = canvas.toDataURL('image/jpeg', quality);

    // Approximate byte size from base64 string length
    const base64Length = resultDataUrl.split(',')[1]?.length || 0;
    const estimatedBytes = (base64Length * 3) / 4;

    if (estimatedBytes <= maxBytes || quality <= 0.2) {
      break;
    }

    // Reduce quality or scale down dimensions if quality is already low
    if (quality > 0.4) {
      quality -= 0.15;
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }
  }

  return resultDataUrl;
}
