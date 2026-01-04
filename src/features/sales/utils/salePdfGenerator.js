import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../../utils/dateFormat';
import { DATE_FORMATS } from '../../../constants';
import logoImage from '../../../assets/logo.jpg';
import { addFontToDoc } from './pdfFontLoader';

const LABELS = {
  title: 'POTWIERDZENIE SPRZEDAŻY',
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
  summary: 'Podsumowanie',
  totalQuantity: 'Łączna ilość',
  totalAmount: 'SUMA CAŁKOWITA',
  generated: 'Wygenerowano',
  pcs: 'szt.',
  currency: 'zł',
};

const COLORS = {
  primary: [25, 118, 210],
  text: [33, 33, 33],
  secondary: [117, 117, 117],
  border: [200, 200, 200],
  headerBg: [245, 245, 245],
};

const formatCurrency = (amount) => {
  return `${(amount || 0).toFixed(2)} ${LABELS.currency}`;
};

const getSaleNumber = (sale) => {
  return `#${sale.saleNumber || sale.id?.slice(0, 8) || '---'}`;
};

export const generateSalePdf = async (sale, location, selectedFields) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load custom font with Polish character support
  const fontLoaded = await addFontToDoc(doc);
  const fontName = fontLoaded ? 'Roboto' : 'helvetica';

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Logo in top left corner
  const logoWidth = 25;
  const logoHeight = 25;
  doc.addImage(logoImage, 'JPEG', margin, yPosition, logoWidth, logoHeight);

  // Header with location data next to logo (left-aligned)
  if (selectedFields.locationData && location) {
    const textX = margin + logoWidth + 8;
    let textY = yPosition + 8;

    doc.setFontSize(10);
    doc.setFont(fontName, 'normal');
    doc.setTextColor(...COLORS.text);

    const addressParts = [];
    if (location.address) addressParts.push(location.address);
    if (location.postalCode && location.city) {
      addressParts.push(`${location.postalCode} ${location.city}`);
    } else if (location.city) {
      addressParts.push(location.city);
    }

    if (addressParts.length > 0) {
      doc.text(addressParts.join(', '), textX, textY);
      textY += 5;
    }

    if (location.phone) {
      doc.text(`Tel: ${location.phone}`, textX, textY);
    }
  }

  yPosition += logoHeight + 5;

  // Separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Title
  doc.setFontSize(14);
  doc.setFont(fontName, 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(`${LABELS.title} ${getSaleNumber(sale)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

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
    doc.setFontSize(11);
    doc.setFont(fontName, 'bold');
    doc.text(LABELS.saleInfo, margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont(fontName, 'normal');

    infoItems.forEach((item) => {
      doc.setFont(fontName, 'bold');
      doc.text(`${item.label}:`, margin, yPosition);
      doc.setFont(fontName, 'normal');
      const labelWidth = doc.getTextWidth(`${item.label}: `);
      doc.text(item.value || '-', margin + labelWidth + 2, yPosition);
      yPosition += 5;
    });

    yPosition += 5;
  }

  // Products Table
  if (selectedFields.products && sale.items && sale.items.length > 0) {
    doc.setFontSize(11);
    doc.setFont(fontName, 'bold');
    doc.text(LABELS.products, margin, yPosition);
    yPosition += 6;

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
        product: item.productModel || item.productName || '-',
      };
      if (selectedFields.productBrand) {
        row.brand = item.brand?.name || '-';
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
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: COLORS.text,
        font: fontName,
      },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.text,
        fontStyle: 'bold',
        font: fontName,
      },
      columnStyles: {
        quantity: { halign: 'center' },
        unitPrice: { halign: 'right' },
        total: { halign: 'right' },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 8;
  }

  // Summary Section
  if (selectedFields.summary || selectedFields.totalAmount) {
    doc.setFontSize(11);
    doc.setFont(fontName, 'bold');
    doc.text(LABELS.summary, margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);

    if (selectedFields.summary) {
      const totalQuantity = sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      doc.setFont(fontName, 'normal');
      doc.text(`${LABELS.totalQuantity}: ${totalQuantity} ${LABELS.pcs}`, margin, yPosition);
      yPosition += 5;
    }

    if (selectedFields.totalAmount) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(12);
      doc.text(`${LABELS.totalAmount}: ${formatCurrency(sale.totalAmount)}`, margin, yPosition);
      yPosition += 8;
    }
  }

  // Footer
  yPosition += 10;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFontSize(8);
  doc.setFont(fontName, 'normal');
  doc.setTextColor(...COLORS.secondary);
  const generatedDate = formatDate(new Date(), DATE_FORMATS.DISPLAY_WITH_TIME);
  doc.text(`${LABELS.generated}: ${generatedDate}`, margin, yPosition);

  return doc;
};

export const generatePdfBlob = async (sale, location, selectedFields) => {
  const doc = await generateSalePdf(sale, location, selectedFields);
  return doc.output('blob');
};

export const downloadPdf = async (sale, location, selectedFields) => {
  const doc = await generateSalePdf(sale, location, selectedFields);
  const fileName = `sprzedaz-${sale.saleNumber || sale.id?.slice(0, 8) || 'dokument'}.pdf`;
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
  summary: true,
  totalAmount: true,
};
