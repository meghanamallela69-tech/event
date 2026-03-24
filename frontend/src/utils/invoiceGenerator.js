// Simple invoice generator utility for service bookings
export const generateInvoicePDF = async (bookingData) => {
  try {
    // Create a simple HTML invoice that can be printed
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Invoice - ${bookingData.eventTitle}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
          }
          .invoice {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 40px;
            max-width: 700px;
            margin: 0 auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
          }
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-section {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .info-title {
            font-weight: bold;
            color: #333;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .info-content {
            color: #555;
            line-height: 1.6;
          }
          .service-details {
            margin-bottom: 30px;
          }
          .service-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .service-table th,
          .service-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .service-table th {
            background: #f1f3f4;
            font-weight: bold;
            color: #333;
          }
          .total-section {
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #333;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #2e7d32;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .payment-status {
            display: inline-block;
            padding: 8px 16px;
            background: #4caf50;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="title">SERVICE INVOICE</div>
            <div class="subtitle">Full Service Event Booking</div>
            <div style="margin-top: 15px;">
              <span class="payment-status">PAID</span>
            </div>
          </div>
          
          <div class="invoice-info">
            <div class="info-section">
              <div class="info-title">Bill To</div>
              <div class="info-content">
                <strong>${bookingData.userName}</strong><br>
                Customer ID: ${bookingData.userId || 'N/A'}<br>
                Booking Date: ${new Date(bookingData.bookingDate || Date.now()).toLocaleDateString()}
              </div>
            </div>
            <div class="info-section">
              <div class="info-title">Service Provider</div>
              <div class="info-content">
                <strong>${bookingData.merchantName}</strong><br>
                Event Organizer<br>
                Contact for service details
              </div>
            </div>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <div class="info-title">Invoice Details</div>
              <div class="info-content">
                <strong>Invoice #:</strong> INV-${bookingData._id?.substring(0, 8).toUpperCase()}<br>
                <strong>Booking ID:</strong> ${bookingData._id}<br>
                <strong>Payment ID:</strong> ${bookingData.paymentId}<br>
                <strong>Issue Date:</strong> ${new Date().toLocaleDateString()}
              </div>
            </div>
            <div class="info-section">
              <div class="info-title">Payment Information</div>
              <div class="info-content">
                <strong>Payment Method:</strong> ${bookingData.paymentMethod}<br>
                <strong>Payment Date:</strong> ${new Date().toLocaleDateString()}<br>
                <strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">PAID</span>
              </div>
            </div>
          </div>
          
          <div class="service-details">
            <table class="service-table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Event Date</th>
                  <th>Location</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${bookingData.eventTitle}</strong><br>
                    <small>Full Service Event Planning & Management</small>
                    ${bookingData.guestCount ? `<br><small>Guest Count: ${bookingData.guestCount} people</small>` : ''}
                  </td>
                  <td>
                    ${bookingData.serviceDate ? 
                      new Date(bookingData.serviceDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      'To be confirmed by merchant'
                    }
                  </td>
                  <td>${bookingData.location || 'To be confirmed'}</td>
                  <td>₹${bookingData.totalPrice?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="total-section">
            <div style="margin-bottom: 10px;">
              <strong>Subtotal: ₹${bookingData.totalPrice?.toLocaleString()}</strong>
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Tax: ₹0.00</strong>
            </div>
            <div class="total-amount">
              Total Paid: ₹${bookingData.totalPrice?.toLocaleString()}
            </div>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">Service Agreement</h4>
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
              This invoice confirms your payment for the full-service event booking. The merchant will contact you within 24 hours to finalize service details, confirm the exact date and location, and provide a comprehensive service agreement. Please keep this invoice for your records.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>For any questions regarding this invoice, please contact the service provider directly.</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <br>
            <p style="font-size: 10px; color: #999;">
              Generated on ${new Date().toLocaleString()} | Invoice ID: INV-${bookingData._id?.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    return Promise.resolve();
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw new Error('Failed to generate invoice');
  }
};