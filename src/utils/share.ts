export async function shareResult(blob: Blob | null, url: string) {
  const shareData: ShareData = {
    title: 'Students India World Cup Quiz',
    text: "I just played Students India's World-Cup 2026 quiz. Why dont you try this too!",
    url: url,
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    let hasFile = false;
    if (blob) {
      const file = new File([blob], 'WorldCupQuiz_Certificate.png', { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
        hasFile = true;
      }
    }

    try {
      await navigator.share(shareData);
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (hasFile) {
          // Some browsers fail when sharing files, try again without the file
          delete shareData.files;
          try {
            await navigator.share(shareData);
            return true;
          } catch (fallbackErr) {
            console.error('Fallback sharing failed:', fallbackErr);
          }
        }
        console.error('Error sharing:', err);
      }
      return false;
    }
  } else {
    // Fallback if Web Share API is not supported (Desktop/Non-HTTPS)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("Link copied to clipboard! (Native sharing is only available on supported mobile browsers)");
      } else {
        alert("Sharing is not supported on this device/browser.");
      }
      return true;
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert("Sharing is not supported on this device.");
      return false;
    }
  }
}
