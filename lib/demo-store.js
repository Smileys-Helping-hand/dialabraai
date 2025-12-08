// In-memory storage for demo mode (when Firebase not configured)
// This is shared across all API routes and persists across hot reloads

class DemoStore {
  constructor() {
    // Use global to persist across Next.js hot module reloads in dev mode
    if (!global.demoOrders) {
      global.demoOrders = new Map();
    }
    if (!global.demoInventory) {
      global.demoInventory = new Map();
    }
    this.orders = global.demoOrders;
    this.inventory = global.demoInventory;
  }

  // Order methods
  createOrder(orderData) {
    const orderId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const order = { id: orderId, ...orderData };
    this.orders.set(orderId, order);
    
    // Deduct inventory for ordered items (only for completed orders in real scenario)
    // For demo, we'll track but not enforce
    console.log('📦 Demo order created:', orderId);
    return orderId;
  }

  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  getAllOrders() {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.get(orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      this.orders.set(orderId, order);
      
      // Deduct inventory when order is completed
      if (status === 'completed' && oldStatus !== 'completed') {
        this.deductInventory(order.items);
      }
      // Restore inventory if reverting from completed
      if (oldStatus === 'completed' && status !== 'completed') {
        this.restoreInventory(order.items);
      }
      
      return true;
    }
    return false;
  }

  markOrderPaid(orderId, paid) {
    const order = this.orders.get(orderId);
    if (order) {
      order.paid = paid;
      this.orders.set(orderId, order);
      return true;
    }
    return false;
  }

  deleteOrder(orderId) {
    return this.orders.delete(orderId);
  }

  // Inventory methods
  initializeInventory(menuItems) {
    menuItems.forEach(item => {
      if (!this.inventory.has(item.id)) {
        this.inventory.set(item.id, {
          id: item.id,
          name: item.name,
          stock: item.stock || 0,
          low_stock_threshold: item.low_stock_threshold || 5,
          total_sold: 0
        });
      }
    });
  }

  getInventory(itemId) {
    return this.inventory.get(itemId) || null;
  }

  getAllInventory() {
    return Array.from(this.inventory.values());
  }

  updateStock(itemId, quantity) {
    const item = this.inventory.get(itemId);
    if (item) {
      item.stock = Math.max(0, quantity);
      this.inventory.set(itemId, item);
      return true;
    }
    return false;
  }

  deductInventory(items) {
    items.forEach(item => {
      const inventory = this.inventory.get(item.id);
      if (inventory) {
        inventory.stock = Math.max(0, inventory.stock - item.quantity);
        inventory.total_sold += item.quantity;
        this.inventory.set(item.id, inventory);
        console.log(`📉 Inventory deducted: ${item.name} -${item.quantity} (now: ${inventory.stock})`);
      }
    });
  }

  restoreInventory(items) {
    items.forEach(item => {
      const inventory = this.inventory.get(item.id);
      if (inventory) {
        inventory.stock += item.quantity;
        inventory.total_sold = Math.max(0, inventory.total_sold - item.quantity);
        this.inventory.set(item.id, inventory);
        console.log(`📈 Inventory restored: ${item.name} +${item.quantity} (now: ${inventory.stock})`);
      }
    });
  }

  getLowStockItems() {
    return Array.from(this.inventory.values()).filter(
      item => item.stock <= item.low_stock_threshold
    );
  }
}

// Export a singleton instance
export const demoStore = new DemoStore();
