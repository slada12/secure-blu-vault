import jsPDF from 'jspdf';

interface ReceiptData {
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  note?: string;
  reference: string;
  transferType: 'domestic' | 'international';
  routingNumber: string;
  date: Date;
}

export function generateTransferReceipt(data: ReceiptData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59); // Navy
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NexusBank', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Wire Transfer Receipt', pageWidth / 2, 32, { align: 'center' });

  // Success badge
  doc.setTextColor(34, 139, 34);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Transfer Successful', pageWidth / 2, 60, { align: 'center' });

  // Amount
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.amount);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(28);
  doc.text(formattedAmount, pageWidth / 2, 78, { align: 'center' });

  // Transfer type
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    data.transferType === 'domestic' ? 'Domestic Wire Transfer' : 'International Wire Transfer',
    pageWidth / 2, 88,
    { align: 'center' }
  );

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 95, pageWidth - 20, 95);

  // Details section
  let y = 108;
  const leftX = 25;
  const rightX = pageWidth - 25;

  const addRow = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(label, leftX, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(value, rightX, y, { align: 'right' });
    y += 14;
  };

  addRow('Date & Time', data.date.toLocaleString());
  addRow('Reference', data.reference);
  addRow('Transfer Type', data.transferType === 'domestic' ? 'Domestic Wire' : 'International Wire');

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y - 4, pageWidth - 20, y - 4);
  y += 8;

  // Sender section
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Sender Details', leftX, y);
  y += 12;
  addRow('Name', data.senderName);
  addRow('Account Number', data.senderAccount);
  addRow('Routing Number', data.routingNumber);

  // Divider
  doc.line(20, y - 4, pageWidth - 20, y - 4);
  y += 8;

  // Recipient section
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Recipient Details', leftX, y);
  y += 12;
  addRow('Name', data.recipientName);
  addRow('Account Number', `•••• ${data.recipientAccount.slice(-4)}`);

  if (data.note) {
    addRow('Note', data.note);
  }

  addRow('Fee', 'Free');

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is an official transfer receipt from NexusBank. Keep this document for your records.',
    pageWidth / 2, y, { align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2, y + 10, { align: 'center' }
  );

  // Save
  doc.save(`NexusBank-Transfer-${data.reference}.pdf`);
}
