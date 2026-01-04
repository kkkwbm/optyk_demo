// Font loader for jsPDF with Polish character support
// Uses Roboto font from Google Fonts CDN

let fontLoaded = false;
let fontBase64 = null;

const FONT_URL = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf';

export const loadFont = async () => {
  if (fontLoaded && fontBase64) {
    return fontBase64;
  }

  try {
    const response = await fetch(FONT_URL);
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    fontBase64 = btoa(binary);
    fontLoaded = true;

    return fontBase64;
  } catch (error) {
    console.error('Failed to load font:', error);
    return null;
  }
};

export const addFontToDoc = async (doc) => {
  const font = await loadFont();

  if (font) {
    doc.addFileToVFS('Roboto-Regular.ttf', font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    return true;
  }

  return false;
};
