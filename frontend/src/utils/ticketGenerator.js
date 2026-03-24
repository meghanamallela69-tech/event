// Simple ticket generator utility
export const generateTicketPDF = async (ticketData) => {
  try {
    // Create a simple HTML ticket that can be printed
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Ticket - ${ticketData.eventTitle}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
          }
          .ticket {
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .ticket-id {
            font-size: 18px;
            color: #666;
            font-family: monospace;
          }
          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .detail-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .detail-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
          }
          .detail-value {
            font-size: 16px;
            color: #333;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #333;
            padding-top: 20px;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #e9ecef;
            border: 1px solid #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            font-size: 10px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="title">${ticketData.eventTitle}</div>
            <div class="ticket-id">Ticket ID: ${ticketData.ticketId}</div>
          </div>
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Attendee</div>
              <div class="detail-value">${ticketData.userName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Event Date</div>
              <div class="detail-value">${ticketData.eventDate ? new Date(ticketData.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Date TBD'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">${ticketData.location || 'Venue TBD'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Organizer</div>
              <div class="detail-value">${ticketData.merchantName || 'Event Organizer'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tickets</div>
              <div class="detail-value">${ticketData.ticketCount || 1} ticket${(ticketData.ticketCount || 1) > 1 ? 's' : ''}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Amount Paid</div>
              <div class="detail-value">₹${ticketData.amount?.toLocaleString() || '0'}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div class="qr-placeholder">QR CODE</div>
            <p style="margin: 10px 0; font-size: 12px; color: #666;">Scan at venue entrance</p>
          </div>
          
          <div class="footer">
            <p><strong>Important Instructions:</strong></p>
            <p>• Please arrive 30 minutes before the event starts</p>
            <p>• Bring a valid ID for verification</p>
            <p>• Present this ticket (digital or printed) at the entrance</p>
            <p>• Contact the organizer for any queries</p>
            <br>
            <p>Booking ID: ${ticketData.bookingId}</p>
            ${ticketData.paymentId ? `<p>Payment ID: ${ticketData.paymentId}</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    return Promise.resolve();
  } catch (error) {
    console.error('Ticket generation error:', error);
    throw new Error('Failed to generate ticket');
  }
};