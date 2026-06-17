export async function generateCertificateBlob(name: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    const img = new Image();
    // Path relative to the public directory on the client
    img.src = '/images/cert.png';
    // Ensure cross-origin is set just in case, though it's same-origin here
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Wait for the Parisienne font to be loaded by the browser before drawing
      document.fonts.load('100px Parisienne').then(() => {
        // Maximum width for the name is 1816 - 650 = 1166
        const MAX_WIDTH = 1100;
        let fontSize = 160; 
        ctx.font = `${fontSize}px 'Parisienne', serif`;
        let textMetrics = ctx.measureText(name);
        
        // Scale down if name is too long
        while (textMetrics.width > MAX_WIDTH && fontSize > 40) {
          fontSize -= 5;
          ctx.font = `${fontSize}px 'Parisienne', serif`;
          textMetrics = ctx.measureText(name);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#222222'; // Dark charcoal/almost black for elegance
        
        // Coordinates: Center of X (650 to 1816) = 1233, Y (687 to 994) = 840
        ctx.fillText(name, 1233, 840);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      }).catch(err => {
        console.error("Failed to load font", err);
        // Fallback drawing if font fails
        ctx.font = `140px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#222222';
        ctx.fillText(name, 1233, 840);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    };
    
    img.onerror = () => {
      console.error("Failed to load certificate template image.");
      resolve(null);
    };
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
