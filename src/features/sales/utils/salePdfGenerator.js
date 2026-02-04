import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../../utils/dateFormat';
import { DATE_FORMATS } from '../../../constants';
import defaultLogoImage from '../../../assets/logo.jpg';
import { addFontToDoc } from './pdfFontLoader';

const DEFAULT_COMPANY_NAME = 'Salon Optyczny Family';

const LABELS = {
  title: 'Potwierdzenie sprzedaży',
  saleInfo: 'Informacje o sprzedaży',
  saleNumber: 'Numer',
  dateTime: 'Data i godzina',
  salesperson: 'Sprzedawca',
  customer: 'Klient',
  notes: 'Notatki',
  products: 'Produkty',
  product: 'Produkt',
  brand: 'Marka',
  quantity: 'Ilość',
  unitPrice: 'Cena',
  total: 'Suma',
  totalAmount: 'Suma całkowita',
  currency: 'zł',
};

const COLORS = {
  primary: [25, 118, 210],
  text: [33, 33, 33],
  secondary: [117, 117, 117],
  border: [200, 200, 200],
  headerBg: [240, 240, 240],
  white: [255, 255, 255],
};

const formatCurrency = (amount) => {
  return `${(amount || 0).toFixed(2)} ${LABELS.currency}`;
};

const getSaleNumber = (sale) => {
  return `#${sale.saleNumber || sale.id?.slice(0, 8) || '---'}`;
};

export const generateSalePdf = async (sale, location, selectedFields, companySettings = null) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Get company name from settings or use default
  const companyName = companySettings?.companyName || DEFAULT_COMPANY_NAME;

  // Set PDF metadata with sale number for proper filename
  const saleNum = sale.saleNumber || sale.id?.slice(0, 8) || 'dokument';
  doc.setProperties({
    title: `Sprzedaz_${saleNum}`,
    subject: 'Potwierdzenie sprzedazy',
    creator: companyName,
  });

  // Load custom font with Polish character support
  const fontLoaded = await addFontToDoc(doc);
  const fontName = fontLoaded ? 'NotoSans' : 'helvetica';

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Logo - use custom logo from settings or default
  const logoWidth = 15;
  const logoHeight = 15;

  if (companySettings?.logoBase64) {
    const logoFormat = companySettings.logoContentType?.includes('png') ? 'PNG' : 'JPEG';
    try {
      doc.addImage(
        `data:${companySettings.logoContentType || 'image/jpeg'};base64,${companySettings.logoBase64}`,
        logoFormat,
        margin,
        yPosition,
        logoWidth,
        logoHeight
      );
    } catch {
      // Fallback to default logo if custom logo fails to load
      doc.addImage(defaultLogoImage, 'JPEG', margin, yPosition, logoWidth, logoHeight);
    }
  } else {
    doc.addImage(defaultLogoImage, 'JPEG', margin, yPosition, logoWidth, logoHeight);
  }

  // Header with location data next to logo (left-aligned)
  const textX = margin + logoWidth + 5;
  let textY = yPosition + 4;

  // Company name from settings
  doc.setFontSize(10);
  doc.setFont(fontName, 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(companyName, textX, textY);
  textY += 4;

  if (selectedFields.locationData && location) {
    doc.setFontSize(8);
    doc.setFont(fontName, 'normal');

    const addressParts = [];
    if (location.address) addressParts.push(location.address);
    if (location.postalCode && location.city) {
      addressParts.push(`${location.postalCode} ${location.city}`);
    } else if (location.city) {
      addressParts.push(location.city);
    }

    if (addressParts.length > 0) {
      doc.text(addressParts.join(', '), textX, textY);
      textY += 3.5;
    }

    if (location.phone) {
      doc.text(`Tel: ${location.phone}`, textX, textY);
    }
  }

  yPosition += logoHeight + 3;

  // Separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // Title
  doc.setFontSize(11);
  doc.setFont(fontName, 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(`${LABELS.title} ${getSaleNumber(sale)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Sale Information Section
  const infoItems = [];

  if (selectedFields.saleNumber) {
    infoItems.push({ label: LABELS.saleNumber, value: getSaleNumber(sale) });
  }

  if (selectedFields.dateTime) {
    infoItems.push({
      label: LABELS.dateTime,
      value: formatDate(sale.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME),
    });
  }

  if (selectedFields.salesperson && sale.userFullName) {
    infoItems.push({ label: LABELS.salesperson, value: sale.userFullName });
  }

  if (selectedFields.customer) {
    const customerName = [sale.customerFirstName, sale.customerLastName]
      .filter(Boolean)
      .join(' ');
    if (customerName) {
      infoItems.push({ label: LABELS.customer, value: customerName });
    }
  }

  if (selectedFields.notes && sale.notes) {
    infoItems.push({ label: LABELS.notes, value: sale.notes });
  }

  if (infoItems.length > 0) {
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(LABELS.saleInfo, margin, yPosition);
    yPosition += 4;

    doc.setFontSize(8);
    doc.setFont(fontName, 'normal');

    infoItems.forEach((item) => {
      doc.setFont(fontName, 'bold');
      doc.text(`${item.label}:`, margin, yPosition);
      doc.setFont(fontName, 'normal');
      const labelWidth = doc.getTextWidth(`${item.label}: `);
      doc.text(item.value || '-', margin + labelWidth + 2, yPosition);
      yPosition += 4;
    });

    yPosition += 3;
  }

  // Products Table
  if (selectedFields.products && sale.items && sale.items.length > 0) {
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(LABELS.products, margin, yPosition);
    yPosition += 4;

    const tableColumns = [{ header: LABELS.product, dataKey: 'product' }];
    if (selectedFields.productBrand) {
      tableColumns.push({ header: LABELS.brand, dataKey: 'brand' });
    }
    if (selectedFields.productQuantity) {
      tableColumns.push({ header: LABELS.quantity, dataKey: 'quantity' });
    }
    if (selectedFields.productUnitPrice) {
      tableColumns.push({ header: LABELS.unitPrice, dataKey: 'unitPrice' });
    }
    if (selectedFields.productTotal) {
      tableColumns.push({ header: LABELS.total, dataKey: 'total' });
    }

    const tableData = sale.items.map((item) => {
      const row = {
        product: item.product?.model || item.productModel || item.productName || '-',
      };
      if (selectedFields.productBrand) {
        row.brand = item.product?.brand?.name || item.brand?.name || '-';
      }
      if (selectedFields.productQuantity) {
        row.quantity = String(item.quantity);
      }
      if (selectedFields.productUnitPrice) {
        row.unitPrice = formatCurrency(item.unitPrice);
      }
      if (selectedFields.productTotal) {
        row.total = formatCurrency(item.quantity * item.unitPrice);
      }
      return row;
    });

    autoTable(doc, {
      startY: yPosition,
      columns: tableColumns,
      body: tableData,
      margin: { left: margin, right: margin },
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        textColor: COLORS.text,
        font: fontName,
        fillColor: COLORS.white,
      },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.text,
        fontStyle: 'bold',
        font: fontName,
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      },
      alternateRowStyles: {
        fillColor: COLORS.white,
      },
      columnStyles: {
        product: { halign: 'left', cellWidth: 'auto' },
        brand: { halign: 'left' },
        quantity: { halign: 'left' },
        unitPrice: { halign: 'left' },
        total: { halign: 'left' },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 5;
  }

  // Total Amount
  if (selectedFields.totalAmount) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.text(`${LABELS.totalAmount}: ${formatCurrency(sale.totalAmount)}`, margin, yPosition);
    yPosition += 6;
  }

  // Bottom separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  return doc;
};

export const generatePdfBlob = async (sale, location, selectedFields, companySettings = null) => {
  const doc = await generateSalePdf(sale, location, selectedFields, companySettings);
  return doc.output('blob');
};

export const downloadPdf = async (sale, location, selectedFields, companySettings = null) => {
  const doc = await generateSalePdf(sale, location, selectedFields, companySettings);
  const saleNumber = sale.saleNumber || sale.id?.slice(0, 8) || 'dokument';
  const fileName = `Sprzedaz_${saleNumber}.pdf`;
  doc.save(fileName);
};

export const DEFAULT_SELECTED_FIELDS = {
  locationData: true,
  saleNumber: true,
  dateTime: true,
  salesperson: true,
  customer: true,
  notes: true,
  products: true,
  productBrand: true,
  productQuantity: true,
  productUnitPrice: true,
  productTotal: true,
  totalAmount: true,
};
