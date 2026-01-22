// Admin JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Modal Elements
    const modal = document.getElementById('orderModal');
    const addOrderBtn = document.getElementById('addOrderBtn');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');
    const modalTitle = document.getElementById('modalTitle');
    const adminOrderForm = document.getElementById('adminOrderForm');
    const orderIdInput = document.getElementById('orderId');
    
    // Table Elements
    const ordersTableBody = document.getElementById('ordersTableBody');
    const searchInput = document.getElementById('searchOrders');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Stats Elements
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');
    const revenueCount = document.getElementById('revenueCount');
    const customerCount = document.getElementById('customerCount');
    
    // Config Elements
    const sheetUrlInput = document.getElementById('sheetUrl');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    
    // Sample data (in real app, this would come from Google Sheets)
    let orders = [
        { id: 1, name: 'John Smith', phone: '(555) 123-4567', email: 'john@example.com', service: 'Custom Suit', date: '2024-01-15', status: 'completed', amount: 450, description: 'Bespoke navy suit', notes: 'Customer very satisfied' },
        { id: 2, name: 'Emma Wilson', phone: '(555) 234-5678', email: 'emma@example.com', service: 'Alterations', date: '2024-01-18', status: 'in-progress', amount: 75, description: 'Hem 3 dresses', notes: 'Rush order' },
        { id: 3, name: 'Robert Chen', phone: '(555) 345-6789', email: 'robert@example.com', service: 'Repairs', date: '2024-01-20', status: 'pending', amount: 40, description: 'Replace zipper on jacket', notes: '' },
        { id: 4, name: 'Sarah Johnson', phone: '(555) 456-7890', email: 'sarah@example.com', service: 'Bridal/Formal', date: '2024-01-22', status: 'pending', amount: 120, description: 'Wedding dress fitting', notes: 'Appointment scheduled' },
        { id: 5, name: 'Michael Brown', phone: '(555) 567-8901', email: 'michael@example.com', service: 'Custom Suit', date: '2024-01-25', status: 'ready', amount: 520, description: 'Custom tuxedo for wedding', notes: 'Pickup scheduled for Friday' }
    ];

    // Initialize
    loadOrders();
    updateStats();
    loadConfig();
    
    // Modal Functions
    function openModal(order = null) {
        if (order) {
            modalTitle.textContent = 'Edit Order';
            document.getElementById('adminName').value = order.name;
            document.getElementById('adminPhone').value = order.phone;
            document.getElementById('adminEmail').value = order.email;
            document.getElementById('adminService').value = order.service;
            document.getElementById('adminStatus').value = order.status;
            document.getElementById('adminAmount').value = order.amount;
            document.getElementById('adminDescription').value = order.description;
            document.getElementById('adminNotes').value = order.notes;
            orderIdInput.value = order.id;
        } else {
            modalTitle.textContent = 'Add New Order';
            adminOrderForm.reset();
            orderIdInput.value = '';
        }
        modal.classList.add('active');
    }
    
    function closeModal() {
        modal.classList.remove('active');
        adminOrderForm.reset();
    }
    
    // Event Listeners for Modal
    addOrderBtn.addEventListener('click', () => openModal());
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    
    // Save Order
    modalSave.addEventListener('click', async () => {
        if (!adminOrderForm.checkValidity()) {
            adminOrderForm.reportValidity();
            return;
        }
        
        const formData = new FormData(adminOrderForm);
        const orderData = Object.fromEntries(formData);
        
        if (orderData.orderId) {
            // Update existing order
            const index = orders.findIndex(o => o.id == orderData.orderId);
            if (index !== -1) {
                orders[index] = {
                    ...orders[index],
                    name: orderData.adminName,
                    phone: orderData.adminPhone,
                    email: orderData.adminEmail,
                    service: orderData.adminService,
                    status: orderData.adminStatus,
                    amount: parseFloat(orderData.adminAmount) || 0,
                    description: orderData.adminDescription,
                    notes: orderData.adminNotes
                };
            }
        } else {
            // Add new order
            const newOrder = {
                id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
                name: orderData.adminName,
                phone: orderData.adminPhone,
                email: orderData.adminEmail,
                service: orderData.adminService,
                date: new Date().toISOString().split('T')[0],
                status: orderData.adminStatus,
                amount: parseFloat(orderData.adminAmount) || 0,
                description: orderData.adminDescription,
                notes: orderData.adminNotes
            };
            orders.push(newOrder);
            
            // Save to Google Sheets
            await saveToGoogleSheets(newOrder);
        }
        
        loadOrders();
        updateStats();
        closeModal();
        
        // Show success message
        showNotification('Order saved successfully!', 'success');
    });
    
    // Load orders into table
    function loadOrders(filter = '') {
        ordersTableBody.innerHTML = '';
        
        const filteredOrders = filter 
            ? orders.filter(order => 
                order.name.toLowerCase().includes(filter.toLowerCase()) ||
                order.service.toLowerCase().includes(filter.toLowerCase()) ||
                order.status.toLowerCase().includes(filter.toLowerCase())
              )
            : orders;
        
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id.toString().padStart(3, '0')}</td>
                <td>
                    <strong>${order.name}</strong><br>
                    <small>${order.phone}</small>
                </td>
                <td>${formatService(order.service)}</td>
                <td>${order.date}</td>
                <td><span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></td>
                <td>$${order.amount.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editOrder(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }
    
    // Format service name
    function formatService(service) {
        const serviceNames = {
            'custom-suit': 'Custom Suit',
            'alterations': 'Alterations',
            'bridal-formal': 'Bridal/Formal',
            'repairs': 'Repairs',
            'consultation': 'Consultation'
        };
        return serviceNames[service] || service;
    }
    
    // Format status
    function formatStatus(status) {
        const statusNames = {
            'pending': 'Pending',
            'in-progress': 'In Progress',
            'ready': 'Ready',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusNames[status] || status;
    }
    
    // Update stats
    function updateStats() {
        const pending = orders.filter(o => o.status === 'pending').length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const revenue = orders.filter(o => o.status === 'completed')
                           .reduce((sum, o) => sum + o.amount, 0);
        const customers = [...new Set(orders.map(o => o.email))].length;
        
        pendingCount.textContent = pending;
        completedCount.textContent = completed;
        revenueCount.textContent = `$${revenue.toFixed(0)}`;
        customerCount.textContent = customers;
    }
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        loadOrders(e.target.value);
    });
    
    // Refresh data
    refreshBtn.addEventListener('click', () => {
        // In a real app, this would fetch from Google Sheets
        showNotification('Data refreshed!', 'info');
        loadOrders();
        updateStats();
    });
    
    // Save configuration
    saveConfigBtn.addEventListener('click', () => {
        const sheetUrl = sheetUrlInput.value.trim();
        if (sheetUrl) {
            localStorage.setItem('googleSheetUrl', sheetUrl);
            showNotification('Configuration saved!', 'success');
        } else {
            showNotification('Please enter a valid URL', 'error');
        }
    });
    
    // Load configuration
    function loadConfig() {
        const savedUrl = localStorage.getItem('googleSheetUrl');
        if (savedUrl) {
            sheetUrlInput.value = savedUrl;
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.admin-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'success' ? 'var(--success-color)' : 
                              type === 'error' ? 'var(--secondary-color)' : 
                              'var(--accent-color)'};
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Save to Google Sheets function
    async function saveToGoogleSheets(order) {
        const sheetUrl = localStorage.getItem('googleSheetUrl') || sheetUrlInput.value;
        
        if (!sheetUrl || !sheetUrl.includes('https://script.google.com/')) {
            console.warn('No valid Google Sheets URL configured');
            return false;
        }
        
        try {
            const response = await fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addOrder',
                    data: {
                        ...order,
                        timestamp: new Date().toISOString(),
                        source: 'admin_panel'
                    }
                })
            });
            
            return true;
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            showNotification('Error saving to Google Sheets', 'error');
            return false;
        }
    }

    // Save order changes
    async function saveOrderChanges() {
        try {
            if (!editForm.checkValidity()) {
                editForm.reportValidity();
                return;
            }
            
            const index = currentEditRow;
            const updatedOrder = {
                customerName: document.getElementById('editName').value,
                email: document.getElementById('editEmail').value,
                serviceType: document.getElementById('editService').value,
                appointmentDate: document.getElementById('editDate').value,
                status: document.getElementById('editStatus').value,
                urgency: document.getElementById('editUrgency').value
            };
            
            // In a real implementation, you would send this to Google Sheets
            // For now, we'll update locally
            ordersData[index] = { ...ordersData[index], ...updatedOrder };
            
            // Send update to Google Sheets
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    row: index + 2, // +2 because row 1 is headers, and arrays are 0-indexed
                    data: updatedOrder
                })
            });
            
            // Update local display
            renderOrders(ordersData);
            closeEditModal();
            
            // Show success message (you could add a toast notification here)
            alert('Order updated successfully!');
            
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order. Please try again.');
        }
    }
    
    // Delete order
    async function deleteOrder(index) {
        if (!confirm('Are you sure you want to delete this order?')) {
            return;
        }
        
        try {
            const orderId = ordersData[index].id || index;
            
            // Send delete request to Google Sheets
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    row: index + 2
                })
            });
            
            // Remove from local data
            ordersData.splice(index, 1);
            
            // Update display
            renderOrders(ordersData);
            
            // Show success message
            alert('Order deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        }
    }
    
    // Make functions globally available for inline onclick handlers
    window.editOrder = function(id) {
        const order = orders.find(o => o.id === id);
        if (order) {
            openModal(order);
        }
    };
    
    window.deleteOrder = function(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            orders = orders.filter(o => o.id !== id);
            loadOrders();
            updateStats();
            showNotification('Order deleted!', 'success');
        }
    };
});


