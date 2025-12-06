import db from "../config/db.js";
import { deleteImageFile } from "../config/upload.js";

export const getItems = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM items");
    res.json(result);
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      message: "Database Error", 
      error: error.message,
      code: error.code 
    });
  }
};

export const addItem = async (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "Name, quantity, and price are required" });
    }

    const [result] = await db.query(
      "INSERT INTO items (name, description, quantity, price, category, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description || null, parseInt(quantity), parseFloat(price), category || null, imagePath]
    );
    
    res.status(201).json({ 
      message: "Item added successfully", 
      id: result.insertId,
      item: { id: result.insertId, name, description, quantity: parseInt(quantity), price: parseFloat(price), category, image: imagePath }
    });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price, category } = req.body;
    const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "Name, quantity, and price are required" });
    }

    // Get current item to check for existing image
    const [currentItem] = await db.query("SELECT image FROM items WHERE id = ?", [parseInt(id)]);
    
    if (currentItem.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete old image if new image is uploaded
    if (newImagePath && currentItem[0].image) {
      deleteImageFile(currentItem[0].image);
    }

    // Update query with or without image
    let updateQuery, updateParams;
    if (newImagePath) {
      updateQuery = "UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, category = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      updateParams = [name, description || null, parseInt(quantity), parseFloat(price), category || null, newImagePath, parseInt(id)];
    } else {
      updateQuery = "UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      updateParams = [name, description || null, parseInt(quantity), parseFloat(price), category || null, parseInt(id)];
    }

    const [result] = await db.query(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.json({ 
      message: "Item updated successfully", 
      item: { 
        id: parseInt(id), 
        name, 
        description, 
        quantity: parseInt(quantity), 
        price: parseFloat(price), 
        category,
        image: newImagePath || currentItem[0].image
      }
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get item to check for existing image
    const [item] = await db.query("SELECT image FROM items WHERE id = ?", [parseInt(id)]);
    
    if (item.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete the item from database
    const [result] = await db.query("DELETE FROM items WHERE id = ?", [parseInt(id)]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete associated image file
    if (item[0].image) {
      deleteImageFile(item[0].image);
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};// Category management functions
export const getCategories = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM categories ORDER BY name");
    res.json(result);
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      message: "Database Error", 
      error: error.message,
      code: error.code 
    });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const [existing] = await db.query("SELECT id FROM categories WHERE name = ?", [name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name.trim()]
    );
    
    res.status(201).json({ 
      message: "Category added successfully", 
      id: result.insertId,
      category: { id: result.insertId, name: name.trim() }
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is being used by any items
    const [items] = await db.query("SELECT COUNT(*) as count FROM items WHERE category = (SELECT name FROM categories WHERE id = ?)", [parseInt(id)]);
    if (items[0].count > 0) {
      return res.status(409).json({ message: "Cannot delete category that is being used by items" });
    }
    
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [parseInt(id)]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

// Purchase Management
export const createPurchase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { billNumber, customerName, totalAmount, paymentMethod, items } = req.body;
    
    if (!billNumber || !items || items.length === 0) {
      return res.status(400).json({ message: "Bill number and items are required" });
    }

    await connection.beginTransaction();

    // Create purchase record
    const [purchaseResult] = await connection.query(
      "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method) VALUES (?, ?, ?, ?)",
      [billNumber, customerName || 'Walk-in Customer', totalAmount, paymentMethod || 'Cash']
    );
    
    const purchaseId = purchaseResult.insertId;

    // Process each item
    for (const item of items) {
      // Check if item has sufficient stock
      const [stockCheck] = await connection.query("SELECT quantity FROM items WHERE id = ?", [item.itemId]);
      
      if (stockCheck.length === 0) {
        throw new Error(`Item with ID ${item.itemId} not found`);
      }
      
      if (stockCheck[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ID ${item.itemId}. Available: ${stockCheck[0].quantity}, Requested: ${item.quantity}`);
      }

      // Insert purchase item
      await connection.query(
        "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
        [purchaseId, item.itemId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
      );

      // Update item quantity
      await connection.query(
        "UPDATE items SET quantity = quantity - ? WHERE id = ?",
        [item.quantity, item.itemId]
      );
    }

    await connection.commit();
    
    res.status(201).json({ 
      message: "Purchase created successfully", 
      purchaseId: purchaseId,
      billNumber: billNumber
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating purchase:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

export const getPurchases = async (req, res) => {
  try {
    const [purchases] = await db.query(`
      SELECT p.*, 
             COUNT(pi.id) as item_count 
      FROM purchases p 
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `);
    
    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const getPurchaseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [purchase] = await db.query("SELECT * FROM purchases WHERE id = ?", [parseInt(id)]);
    
    if (purchase.length === 0) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    
    // Get purchase items with stored data (item_name, item_price are stored in purchase_items)
    const [items] = await db.query(`
      SELECT 
        item_id,
        item_name as name,
        item_price as price,
        quantity,
        total_price
      FROM purchase_items
      WHERE purchase_id = ?
    `, [parseInt(id)]);
    
    res.json({
      purchase: purchase[0],
      items: items
    });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

// Notification/Alert related functions
export const getAlertSettings = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM alert_settings LIMIT 1");
    
    if (result.length === 0) {
      // Return default alert quantity if no settings found
      res.json({ alertQuantity: 10 });
    } else {
      res.json({ alertQuantity: result[0].alert_quantity });
    }
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const updateAlertSettings = async (req, res) => {
  try {
    const { alertQuantity } = req.body;
    
    if (!alertQuantity || alertQuantity < 1) {
      return res.status(400).json({ message: "Alert quantity must be at least 1" });
    }

    // Check if settings exist
    const [existing] = await db.query("SELECT id FROM alert_settings LIMIT 1");
    
    if (existing.length === 0) {
      // Insert new settings
      await db.query(
        "INSERT INTO alert_settings (alert_quantity, updated_at) VALUES (?, CURRENT_TIMESTAMP)",
        [parseInt(alertQuantity)]
      );
    } else {
      // Update existing settings
      await db.query(
        "UPDATE alert_settings SET alert_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [parseInt(alertQuantity), existing[0].id]
      );
    }
    
    res.json({ 
      message: "Alert settings updated successfully", 
      alertQuantity: parseInt(alertQuantity) 
    });
  } catch (error) {
    console.error("Error updating alert settings:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    // First get the alert threshold
    const [alertSettings] = await db.query("SELECT alert_quantity FROM alert_settings LIMIT 1");
    const alertQuantity = alertSettings.length > 0 ? alertSettings[0].alert_quantity : 10;
    
    // Get items below the alert threshold
    const [items] = await db.query(
      "SELECT * FROM items WHERE quantity <= ? ORDER BY quantity ASC, name ASC",
      [alertQuantity]
    );
    
    res.json({ 
      items: items,
      alertQuantity: alertQuantity 
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

// Offers management functions
export const getOffers = async (req, res) => {
  try {
    const [offers] = await db.query("SELECT * FROM offers ORDER BY created_at DESC");
    res.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [offer] = await db.query("SELECT * FROM offers WHERE id = ?", [parseInt(id)]);
    
    if (offer.length === 0) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    // Get offer products
    const [products] = await db.query("SELECT * FROM offer_products WHERE offer_id = ?", [parseInt(id)]);
    
    const offerData = {
      ...offer[0],
      products: products
    };
    
    res.json(offerData);
  } catch (error) {
    console.error("Error fetching offer details:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const createOffer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { offerType, description, products, realTotal, offerTotal } = req.body;
    
    if (!offerType || !products || products.length === 0 || !realTotal || !offerTotal) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Insert offer
    const [offerResult] = await connection.query(
      "INSERT INTO offers (offer_type, description, real_total, offer_total, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [offerType, description || null, parseFloat(realTotal), parseFloat(offerTotal)]
    );
    
    const offerId = offerResult.insertId;
    
    // Insert offer products
    for (const product of products) {
      await connection.query(
        "INSERT INTO offer_products (offer_id, product_id, product_name, product_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
        [offerId, product.id, product.name, parseFloat(product.price), parseInt(product.quantity), parseFloat(product.price * product.quantity)]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: "Offer created successfully", 
      offerId: offerId
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating offer:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

export const updateOffer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { offerType, description, products, realTotal, offerTotal } = req.body;
    
    if (!offerType || !products || products.length === 0 || !realTotal || !offerTotal) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Update offer
    const [result] = await connection.query(
      "UPDATE offers SET offer_type = ?, description = ?, real_total = ?, offer_total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [offerType, description || null, parseFloat(realTotal), parseFloat(offerTotal), parseInt(id)]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Offer not found" });
    }
    
    // Delete existing offer products
    await connection.query("DELETE FROM offer_products WHERE offer_id = ?", [parseInt(id)]);
    
    // Insert updated offer products
    for (const product of products) {
      await connection.query(
        "INSERT INTO offer_products (offer_id, product_id, product_name, product_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
        [parseInt(id), product.id, product.name, parseFloat(product.price), parseInt(product.quantity), parseFloat(product.price * product.quantity)]
      );
    }
    
    await connection.commit();
    
    res.json({ message: "Offer updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

export const deleteOffer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Delete offer products first (due to foreign key constraint)
    await connection.query("DELETE FROM offer_products WHERE offer_id = ?", [parseInt(id)]);
    
    // Delete offer
    const [result] = await connection.query("DELETE FROM offers WHERE id = ?", [parseInt(id)]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Offer not found" });
    }
    
    await connection.commit();
    
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting offer:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    // Get total items count
    const [itemsCount] = await db.query("SELECT COUNT(*) as totalItems FROM items");
    
    // Get total inventory value
    const [inventoryValue] = await db.query("SELECT SUM(quantity * price) as totalValue FROM items");
    
    // Get low stock count (items with quantity <= 10)
    const [lowStockCount] = await db.query("SELECT COUNT(*) as lowStock FROM items WHERE quantity <= 10");
    
    // Get total categories
    const [categoriesCount] = await db.query("SELECT COUNT(*) as totalCategories FROM categories");
    
    // Get total sales from purchases
    const [salesData] = await db.query(`
      SELECT 
        COUNT(DISTINCT id) as totalSales,
        SUM(total_amount) as totalRevenue 
      FROM purchases
    `);
    
    // Get recent low stock items
    const [lowStockItems] = await db.query(`
      SELECT name, quantity 
      FROM items 
      WHERE quantity <= 10 
      ORDER BY quantity ASC 
      LIMIT 5
    `);
    
    // Get top selling products (from purchase_items)
    const [topProducts] = await db.query(`
      SELECT 
        i.name, 
        SUM(pi.quantity) as totalSold 
      FROM purchase_items pi
      JOIN items i ON pi.item_id = i.id
      GROUP BY pi.item_id, i.name
      ORDER BY totalSold DESC
      LIMIT 5
    `);

    // Get monthly sales trend (last 6 months)
    const [monthlySales] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as salesCount,
        SUM(total_amount) as revenue
      FROM purchases 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);

    res.json({
      stats: {
        totalItems: itemsCount[0].totalItems || 0,
        totalValue: parseFloat(inventoryValue[0].totalValue || 0).toFixed(2),
        lowStock: lowStockCount[0].lowStock || 0,
        totalCategories: categoriesCount[0].totalCategories || 0,
        totalSales: salesData[0].totalSales || 0,
        totalRevenue: parseFloat(salesData[0].totalRevenue || 0).toFixed(2)
      },
      lowStockItems: lowStockItems || [],
      topProducts: topProducts || [],
      monthlySales: monthlySales || []
    });
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { customer_name, customer_phone, total_amount, items } = req.body;
    
    if (!customer_name || total_amount === undefined) {
      return res.status(400).json({ message: "Customer name and total amount are required" });
    }

    // Update purchase record (only update customer_name and total_amount, keep existing customer_phone)
    const [result] = await connection.query(
      "UPDATE purchases SET customer_name = ?, total_amount = ? WHERE id = ?",
      [customer_name, parseFloat(total_amount), parseInt(id)]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update purchase items if provided
    if (items && Array.isArray(items)) {
      // Get current items to calculate inventory changes
      const [currentItems] = await connection.query(
        "SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?",
        [parseInt(id)]
      );
      
      // Restore original inventory quantities
      for (const item of currentItems) {
        await connection.query(
          "UPDATE items SET quantity = quantity + ? WHERE id = ?",
          [item.quantity, item.item_id]
        );
      }
      
      // Update purchase items with new quantities
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        const newTotalPrice = itemPrice * itemQuantity;
        
        await connection.query(
          "UPDATE purchase_items SET quantity = ?, total_price = ? WHERE purchase_id = ? AND item_id = ?",
          [itemQuantity, newTotalPrice, parseInt(id), item.item_id]
        );
        
        // Deduct new quantities from inventory
        await connection.query(
          "UPDATE items SET quantity = quantity - ? WHERE id = ?",
          [itemQuantity, item.item_id]
        );
      }
    }

    await connection.commit();

    res.json({ 
      message: "Transaction updated successfully",
      transaction: { id: parseInt(id), customer_name, total_amount: parseFloat(total_amount) }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating purchase:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

export const deletePurchase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // First, get purchase items to restore inventory
    const [purchaseItems] = await connection.query(
      "SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?",
      [parseInt(id)]
    );
    
    // Restore inventory quantities
    for (const item of purchaseItems) {
      await connection.query(
        "UPDATE items SET quantity = quantity + ? WHERE id = ?",
        [item.quantity, item.item_id]
      );
    }
    
    // Delete purchase items first (due to foreign key constraint)
    await connection.query("DELETE FROM purchase_items WHERE purchase_id = ?", [parseInt(id)]);
    
    // Delete purchase
    const [result] = await connection.query("DELETE FROM purchases WHERE id = ?", [parseInt(id)]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    await connection.commit();
    
    res.json({ message: "Transaction deleted successfully and inventory restored" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting purchase:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};
