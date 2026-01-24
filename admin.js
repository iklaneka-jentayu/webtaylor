// Table CRUD operations with Google Sheets
document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Replace with your actual values
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5dcOe62WNEEdor-BdRIpOizy2ZcsWJJ7XaXWnYj1W05pBGOCzOYmZ4SQG-LVQ-GoiPg/exec';
    //const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzBvodJHZVzFoDX1hawHLM3XNFS4iJWBRIFclt2MAcQ3k7tZnWF1Udh1bKZNdwFWM98g/exec';    
    
    // DOM Elements
    const ordersTable = document.getElementById('ordersTable');
    const ordersBody = document.getElementById('ordersBody');
    const loading = document.getElementById('loading');
    const noOrders = document.getElementById('noOrders');
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Modal Elements
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveEdit = document.getElementById('saveEdit');
    const editForm = document.getElementById('editForm');
    
    let ordersData = [];
    let currentEditRow = null;
    alert('init..')
    // Initialize
    loadOrders();
    
    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadOrders);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditModal);
    }
    
    if (saveEdit) {
        saveEdit.addEventListener('click', saveOrderChanges);
    }
    
    // Close modal when clicking outside
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Load orders from Google Sheets
    async function loadOrders() {

        alert('loadOrders');
        try {
            alert('loadOrders - 2');
            showLoading();
            alert('loadOrders - 3');
            // Fetch data from Google Apps Script
            const response = await fetch(`${SCRIPT_URL}?action=read`);
            alert('Fetch data from Google Apps Script');
            const data = await response.json();

            alert('data - '+JSON.stringfy(data));
            
            if (data.success && data.data) {
                ordersData = data.data;
                alert('data.success');
                renderOrders(ordersData);
            } else {
                throw new Error('Failed to load orders - test');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showError('Failed to load orders. Please try again. - test');
        } finally {
            hideLoading();
        }
    }
    
    // Render orders to table
    function renderOrders(orders) {
        ordersBody.innerHTML = '';

         alert('orders - '+orders)
        
       // if (orders.length === 0) {
        //    ordersTable.classList.add('hidden');
        //    noOrders.classList.remove('hidden');
        //    return;
        //}
        
       // noOrders.classList.add('hidden');
        //ordersTable.classList.remove('hidden');
        
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.customerName || ''}</td>
                <td>${order.email || ''}</td>
                <td>${order.serviceType || ''}</td>
                <td>${formatDate(order.appointmentDate) || ''}</td>
                <td><span class="status-badge status-${getStatusClass(order.status)}">${order.status || 'Pending'}</span></td>
                <td>${order.urgency || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-index="${index}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" data-index="${index}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            
            ordersBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                openEditModal(index);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                //alert('index-'+index);
                deleteOrder(index);
            });
        });
    }
    
    // Filter orders based on search input
    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            renderOrders(ordersData);
            return;
        }
        
        const filteredOrders = ordersData.filter(order => {
            return (
                (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
                (order.email && order.email.toLowerCase().includes(searchTerm)) ||
                (order.serviceType && order.serviceType.toLowerCase().includes(searchTerm)) ||
                (order.status && order.status.toLowerCase().includes(searchTerm))
            );
        });
        
        renderOrders(filteredOrders);
    }
    
    // Open edit modal with order data
    function openEditModal(index) {
        currentEditRow = index;
        const order = ordersData[index];
        
        // Populate form fields
        document.getElementById('editName').value = order.customerName || '';
        document.getElementById('editEmail').value = order.email || '';
        document.getElementById('editService').value = order.serviceType || '';
        document.getElementById('editDate').value = order.appointmentDate || '';
        document.getElementById('editStatus').value = order.status || 'Pending';
        document.getElementById('editUrgency').value = order.urgency || 'Standard (2-3 weeks)';
        document.getElementById('editRow').value = index;
        
        // Show modal
        editModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // Close edit modal
    function closeEditModal() {
        editModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        editForm.reset();
        currentEditRow = null;
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

        //alert('index-'+index);
        
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
    
    // Helper functions
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function getStatusClass(status) {
        if (!status) return 'pending';
        
        const statusMap = {
            'Pending': 'pending',
            'Confirmed': 'confirmed',
            'In Progress': 'inprogress',
            'Ready for Fitting': 'ready',
            'Completed': 'completed',
            'Cancelled': 'cancelled'
        };
        
        return statusMap[status] || 'pending';
    }
    
    function showLoading() {
        //loading.classList.remove('hidden');
        //ordersTable.classList.add('hidden');
        //noOrders.classList.add('hidden');
    }
    
    function hideLoading() {
        loading.classList.add('hidden');
    }
    
    function showError(message) {
        // In a real implementation, you would show this to the user
        console.error(message);
        alert(message);
    }
});













