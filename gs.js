// Google Apps Script for Google Sheets integration
// Deploy as a Web App with "Execute as: Me" and "Who has access: Anyone"

// Configuration
const SPREADSHEET_ID = '1iMtiDmWlK-CjYa91rHvC3zM6-fudHtVSXKDNozrE_28';
const SHEET_NAME = 'Orders';
const SHEET_GID = '1660760755';

// Main doPost function to handle form submissions
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('action',action);
    
    let result;
    
    switch(action) {
      case 'create':
        result = createOrder(data);
        break;
      case 'read':
        result = readOrders();
        break;
      case 'update':
        result = updateOrder(data);
        break;
      case 'delete':
        result = deleteOrder(data);
        break;
      default:
        result = createOrder(data);
        //result = { success: false, message: 'Invalid action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests for reading data
function doGet(e) {
  try {
    const action = e.parameter.action || 'read';
      
    Logger.log('action - ',action);
    
    if (action === 'read') {
      const result = readOrders();
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid action for GET request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Create a new order
function createOrder(data) {
  try {
    const sheet = getSheet();
    
    // Prepare row data
    const timestamp = new Date().toLocaleString();
    const rowData = [
      timestamp,
      data.id || '',
      data.customerName || '',
      data.email || '',
      data.phone || '',
      data.serviceType || '',
      data.appointmentDate || '',
      data.garmentDetails || '',
      data.urgency || '',
      data.budget || '',
      data.amount || 0,
      data.reference || '',
      data.description || '',
      data.newsletter || '',
      data.status || 'Pending',
      data.source ||  'unknown',
      data.notes ||  'unknown',
      data.lastupdated || '',
      data.timestamp || timestamp
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Order created successfully',
      row: sheet.getLastRow()
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Read all orders
function readOrders() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    const headers = data[0];
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const order = {};
      
      // Map each column to its header
      headers.forEach((header, index) => {
        // Convert header to camelCase for JavaScript
        const key = header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
        order[key] = row[index] || '';
      });
      
      // Add row number for reference
      order.rowNumber = i + 1;
      orders.push(order);
    }
    
    return {
      success: true,
      data: orders
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Update an existing order
function updateOrder(data) {
  try {
    const sheet = getSheet();
    const row = parseInt(data.row);
    
    if (isNaN(row) || row < 2) {
      return {
        success: false,
        message: 'Invalid row number'
      };
    }
    
    // Get headers to know column positions
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Prepare update data
    const updateData = data.data || {};
    
    // Update specific cells based on headers
    headers.forEach((header, colIndex) => {
      const key = header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
      
      if (updateData.hasOwnProperty(key)) {
        // +1 because getRange is 1-indexed
        sheet.getRange(row, colIndex + 1).setValue(updateData[key]);
      }
    });
    
    return {
      success: true,
      message: 'Order updated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Delete an order
function deleteOrder(data) {
  try {
    const sheet = getSheet();
    
    const row = parseInt(data.row);

    console.log('row-',row);
    
    if (isNaN(row) || row < 2) {
      return {
        success: false,
        message: 'Invalid row number'
      };
    }
    
    // Delete the row
    sheet.deleteRow(row);
    
    return {
      success: true,
      message: 'Order deleted successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Helper function to get the sheet
function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

//function getSheet() {
//  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
//  spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
// Try to get sheet by GID first
//  const sheets = spreadsheet.getSheets();
//  for (let i = 0; i < sheets.length; i++) {
//    if (sheets[i].getSheetId().toString() === SHEET_GID) {
//      return sheets[i];
//    }
//  }
// If not found by GID, try by name
//  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
//}

// Initialize the sheet with headers if it's empty
function initializeSheet() {
  const sheet = getSheet();
  
  // Check if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Customer Name',
      'Email',
      'Phone',
      'Service Type',
      'Appointment Date',
      'Garment Details',
      'Urgency',
      'Budget',
      'amount',
      'Reference',
      'Newsletter',
      'description',
      'Status',
      'Source',
      'Notes',
      'Last Updated'
    ];
    
    sheet.appendRow(headers);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2c3e50');
    headerRange.setFontColor('#ffffff');
    
    // Set column widths
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 150); // Customer Name
    sheet.setColumnWidth(3, 200); // Email
    sheet.setColumnWidth(4, 130); // Phone
    sheet.setColumnWidth(5, 150); // Service Type
    sheet.setColumnWidth(6, 120); // Appointment Date
    sheet.setColumnWidth(7, 300); // Garment Details
    sheet.setColumnWidth(8, 150); // Urgency
    sheet.setColumnWidth(9, 100); // Budget
    sheet.setColumnWidth(10, 100); // Amount
    sheet.setColumnWidth(11, 120); // Reference
    sheet.setColumnWidth(12, 100); // Newsletter
     sheet.setColumnWidth(13, 100); // Description
    sheet.setColumnWidth(14, 120); // Status
    sheet.setColumnWidth(15, 120); // Source
    sheet.setColumnWidth(16, 120); // Notes
    sheet.setColumnWidth(17, 180); // Last Updated
  }
  
  return sheet;
}
