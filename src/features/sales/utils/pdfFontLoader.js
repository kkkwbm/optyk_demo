// Font loader for jsPDF with Polish character support
// Uses local Noto Sans fonts bundled with the application (full Unicode support)

import notoSansRegularUrl from '../../../assets/fonts/NotoSans-Regular.ttf';
import notoSansBoldUrl from '../../../assets/fonts/NotoSans-Bold.ttf';

let fontsLoaded = false;
let fontRegularBase64 = null;
let fontBoldBase64 = null;

const loadFontAsBase64 = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

export const loadFonts = async () => {
  if (fontsLoaded && fontRegularBase64 && fontBoldBase64) {
    return { regular: fontRegularBase64, bold: fontBoldBase64, name: 'NotoSans' };
  }

  try {
    console.log('Loading local Noto Sans fonts...');
    const [regular, bold] = await Promise.all([
      loadFontAsBase64(notoSansRegularUrl),
      loadFontAsBase64(notoSansBoldUrl),
    ]);

    fontRegularBase64 = regular;
    fontBoldBase64 = bold;
    fontsLoaded = true;

    console.log('Successfully loaded Noto Sans fonts');
    return { regular: fontRegularBase64, bold: fontBoldBase64, name: 'NotoSans' };
  } catch (error) {
    console.error('Failed to load fonts:', error);
    return null;
  }
};

export const addFontToDoc = async (doc) => {
  const fonts = await loadFonts();

  if (fonts) {
    // Add regular font
    doc.addFileToVFS('NotoSans-Regular.ttf', fonts.regular);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');

    // Add bold font
    doc.addFileToVFS('NotoSans-Bold.ttf', fonts.bold);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');

    doc.setFont('NotoSans');
    return true;
  }

  return false;
};
