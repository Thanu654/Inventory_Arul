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
    // cost_price may be sent as 'cost_price' (from FormData) or 'costPrice'
    const cost_price = req.body.cost_price ?? req.body.costPrice ?? null;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // quantity is optional from frontend; default to 0 if missing or invalid
    let qtyNum = parseInt(quantity);
    if (isNaN(qtyNum)) qtyNum = 0;

    const [result] = await db.query(
      "INSERT INTO items (name, description, quantity, price, cost_price, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, description || null, qtyNum, parseFloat(price), cost_price !== null ? parseFloat(cost_price) : null, category || null, imagePath]
    );

    const insertedItem = { id: result.insertId, name, description, quantity: parseInt(quantity), price: parseFloat(price), cost_price: cost_price !== null ? parseFloat(cost_price) : null, category, image: imagePath };

    // If initial quantity provided (positive), record an opening inventory transaction for audit/history
    try {
      if (qtyNum > 0) {
        const q = "INSERT INTO inventory_transactions (item_id, item_name, quantity, type, reference, note, created_by) VALUES (?, ?, ?, 'opening', ?, ?, ?)";
        await db.query(q, [insertedItem.id, insertedItem.name, qtyNum, 'Initial stock on item creation', 'Initial stock on item creation', req.body.created_by || null]);
      }
    } catch (txErr) {
      console.error('Failed to insert opening inventory transaction:', txErr.message);
      // continue — item creation succeeded; we prefer not to fail the whole request for audit insert failure
    }

    res.status(201).json({ 
      message: "Item added successfully", 
      id: result.insertId,
      item: insertedItem
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
    const cost_price = req.body.cost_price ?? req.body.costPrice ?? null;
    const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "Name, quantity, and price are required" });
    }

    // Get current item to check for existing image and current quantity
    const [currentItem] = await db.query("SELECT image, quantity FROM items WHERE id = ?", [parseInt(id)]);
    
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
      updateQuery = "UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, cost_price = ?, category = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      updateParams = [name, description || null, parseInt(quantity), parseFloat(price), cost_price !== null ? parseFloat(cost_price) : null, category || null, newImagePath, parseInt(id)];
    } else {
      updateQuery = "UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, cost_price = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      updateParams = [name, description || null, parseInt(quantity), parseFloat(price), cost_price !== null ? parseFloat(cost_price) : null, category || null, parseInt(id)];
    }

    const [result] = await db.query(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // If quantity changed, insert an inventory_transactions adjustment record
    try {
      const oldQty = currentItem[0].quantity != null ? parseInt(currentItem[0].quantity) : 0;
      const newQty = parseInt(quantity);
      const delta = newQty - oldQty;
      if (delta !== 0) {
        const adjNote = `Adjusted via item update (old:${oldQty}, new:${newQty})`;
        const q = "INSERT INTO inventory_transactions (item_id, item_name, quantity, type, reference, note, created_by) VALUES (?, ?, ?, 'adjustment', ?, ?, ?)";
        await db.query(q, [parseInt(id), name, delta, 'updateItem', adjNote, req.body.created_by || null]);
      }
    } catch (txErr) {
      console.error('Failed to insert adjustment inventory transaction:', txErr.message);
    }

    res.json({ 
      message: "Item updated successfully", 
      item: { 
        id: parseInt(id), 
        name, 
        description, 
        quantity: parseInt(quantity), 
        price: parseFloat(price), 
        cost_price: cost_price !== null ? parseFloat(cost_price) : null,
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

// Suppliers CRUD
export const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const addSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Supplier name is required' });

    const [result] = await db.query('INSERT INTO suppliers (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), contact_person || null, phone || null, email || null, address || null, notes || null]
    );
    res.status(201).json({ message: 'Supplier added', id: result.insertId, supplier: { id: result.insertId, name: name.trim(), contact_person, phone, email, address, notes } });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, phone, email, address, notes } = req.body;
    const [result] = await db.query('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, contact_person || null, phone || null, email || null, address || null, notes || null, parseInt(id)]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [parseInt(id)]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

// Subcategory management
export const getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = "SELECT * FROM subcategories";
    const params = [];
    if (categoryId) {
      query += " WHERE category_id = ?";
      params.push(parseInt(categoryId));
    }
    query += " ORDER BY name";

    const [result] = await db.query(query, params);
    res.json(result);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const addSubcategory = async (req, res) => {
  try {
    const { categoryId, name } = req.body;
    if (!categoryId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Category ID and subcategory name are required' });
    }

    // Check parent category exists
    const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [parseInt(categoryId)]);
    if (cat.length === 0) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    // Prevent duplicate subcategory names under same category
    const [existing] = await db.query('SELECT id FROM subcategories WHERE category_id = ? AND name = ?', [parseInt(categoryId), name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Subcategory already exists for this category' });
    }

    const [result] = await db.query('INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [parseInt(categoryId), name.trim()]);
    res.status(201).json({ message: 'Subcategory added', id: result.insertId, subcategory: { id: result.insertId, category_id: parseInt(categoryId), name: name.trim() } });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM subcategories WHERE id = ?', [parseInt(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    // Optionally, items.subcategory_id referencing this will be set to NULL due to FK ON DELETE SET NULL
    res.json({ message: 'Subcategory deleted' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
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

    // Create purchase record (accept optional offer fields and creator)
    const offerType = req.body.offerType || req.body.offer_type || null;
    const offerValue = req.body.offerValue !== undefined ? parseFloat(req.body.offerValue) : (req.body.offer_value !== undefined ? parseFloat(req.body.offer_value) : null);
    const offerAmount = req.body.offerAmount !== undefined ? parseFloat(req.body.offerAmount) : (req.body.offer_amount !== undefined ? parseFloat(req.body.offer_amount) : 0);
    const createdBy = req.body.createdBy || req.body.created_by || null;
    const createdById = req.body.createdById || req.body.created_by_id || null;

    let purchaseResult;
    try {
      [purchaseResult] = await connection.query(
        "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method, offer_type, offer_value, offer_amount, created_by, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [billNumber, customerName || 'Walk-in Customer', totalAmount, paymentMethod || 'Cash', offerType, offerValue, offerAmount, createdBy, createdById]
      );
    } catch (err) {
      // If DB doesn't have created_by columns (migration not applied), retry without them
      if (err && (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('created_by')))) {
        console.warn('created_by column missing, retrying purchase insert without creator fields');
        try {
          [purchaseResult] = await connection.query(
            "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method, offer_type, offer_value, offer_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [billNumber, customerName || 'Walk-in Customer', totalAmount, paymentMethod || 'Cash', offerType, offerValue, offerAmount]
          );
        } catch (err2) {
          // If DB also doesn't have offer_* columns, fall back to minimal insert
          if (err2 && err2.code === 'ER_BAD_FIELD_ERROR') {
            console.warn('offer_* columns missing, retrying purchase insert with minimal columns');
            [purchaseResult] = await connection.query(
              "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method) VALUES (?, ?, ?, ?)",
              [billNumber, customerName || 'Walk-in Customer', totalAmount, paymentMethod || 'Cash']
            );
          } else {
            throw err2;
          }
        }
      } else {
        throw err;
      }
    }
    
    const purchaseId = purchaseResult.insertId;

    // Process each item
    for (const item of items) {
      // Support custom items (no itemId) by allowing item_id = NULL in purchase_items.
      const itemId = item.itemId !== undefined && item.itemId !== null && item.itemId !== '' ? item.itemId : null;

      if (itemId !== null) {
        // Check if item has sufficient stock
        const [stockCheck] = await connection.query("SELECT quantity FROM items WHERE id = ?", [itemId]);
        if (stockCheck.length === 0) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        if (stockCheck[0].quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ID ${itemId}. Available: ${stockCheck[0].quantity}, Requested: ${item.quantity}`);
        }

        // Insert purchase item and update quantity
        await connection.query(
          "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
          [purchaseId, itemId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
        );

        await connection.query(
          "UPDATE items SET quantity = quantity - ? WHERE id = ?",
          [item.quantity, itemId]
        );
      } else {
        // Custom/service item - insert with NULL item_id and do not touch stock
        await connection.query(
          "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, NULL, ?, ?, ?, ?)",
          [purchaseId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
        );
      }
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

// Create a purchase/stock-receipt that INCREASES item quantities (when buying stock)
export const createStockPurchase = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { billNumber, customerName, totalAmount, paymentMethod, items, supplierId, invoiceDate, dueDate, paymentStatus } = req.body;

    if (!billNumber || !items || items.length === 0) {
      return res.status(400).json({ message: "Bill number and items are required" });
    }

    await connection.beginTransaction();

    // Create purchase record (mark as supplier purchase). Accept offer fields and creator if present
    const offerType = req.body.offerType || req.body.offer_type || null;
    const offerValue = req.body.offerValue !== undefined ? parseFloat(req.body.offerValue) : (req.body.offer_value !== undefined ? parseFloat(req.body.offer_value) : null);
    const offerAmount = req.body.offerAmount !== undefined ? parseFloat(req.body.offerAmount) : (req.body.offer_amount !== undefined ? parseFloat(req.body.offer_amount) : 0);
    const createdBy = req.body.createdBy || req.body.created_by || null;
    const createdById = req.body.createdById || req.body.created_by_id || null;

    console.log('[createStockPurchase] Request body:', { billNumber, createdBy, createdById });
    console.log('[createStockPurchase] Full req.body:', req.body);

    let purchaseResult;
    try {
      [purchaseResult] = await connection.query(
        "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method, supplier_id, invoice_date, due_date, payment_status, purchase_type, offer_type, offer_value, offer_amount, created_by, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supplier', ?, ?, ?, ?, ?)",
        [billNumber, customerName || 'Supplier', totalAmount, paymentMethod || 'Cash', supplierId || null, invoiceDate || null, dueDate || null, paymentStatus || 'pending', offerType, offerValue, offerAmount, createdBy, createdById]
      );
      console.log('[createStockPurchase] Purchase inserted with ID:', purchaseResult.insertId, 'created_by:', createdBy);
    } catch (err) {
      console.error('[createStockPurchase] Error inserting purchase:', err.message);
      if (err && (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('created_by')))) {
        console.warn('created_by column missing, retrying supplier purchase insert without creator fields');
        try {
          [purchaseResult] = await connection.query(
            "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method, supplier_id, invoice_date, due_date, payment_status, purchase_type, offer_type, offer_value, offer_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supplier', ?, ?, ?)",
            [billNumber, customerName || 'Supplier', totalAmount, paymentMethod || 'Cash', supplierId || null, invoiceDate || null, dueDate || null, paymentStatus || 'pending', offerType, offerValue, offerAmount]
          );
        } catch (err2) {
          if (err2 && err2.code === 'ER_BAD_FIELD_ERROR') {
            console.warn('offer_* columns missing, retrying supplier purchase insert with minimal columns');
            [purchaseResult] = await connection.query(
              "INSERT INTO purchases (bill_number, customer_name, total_amount, payment_method, supplier_id, invoice_date, due_date, payment_status, purchase_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supplier')",
              [billNumber, customerName || 'Supplier', totalAmount, paymentMethod || 'Cash', supplierId || null, invoiceDate || null, dueDate || null, paymentStatus || 'pending']
            );
          } else {
            throw err2;
          }
        }
      } else {
        throw err;
      }
    }

    const purchaseId = purchaseResult.insertId;
    const updatedItems = [];

    for (const item of items) {
      // Support custom items: if item.itemId is null/undefined/empty, insert purchase item without changing stock
      const itemId = item.itemId !== undefined && item.itemId !== null && item.itemId !== '' ? item.itemId : null;

      if (itemId !== null) {
        // Ensure item exists
        const [stockCheck] = await connection.query("SELECT quantity FROM items WHERE id = ?", [itemId]);
        if (stockCheck.length === 0) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        // Insert purchase item
        await connection.query(
          "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
          [purchaseId, itemId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
        );

        // Increase item quantity (because this is stock coming in)
        await connection.query(
          "UPDATE items SET quantity = quantity + ? WHERE id = ?",
          [item.quantity, itemId]
        );

        // Return updated quantity for client
        const [afterUpdate] = await connection.query("SELECT quantity FROM items WHERE id = ?", [itemId]);
        updatedItems.push({ itemId: itemId, newQuantity: afterUpdate[0].quantity });
      } else {
        // Custom item - insert without item_id and without stock change
        await connection.query(
          "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, NULL, ?, ?, ?, ?)",
          [purchaseId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
        );
        updatedItems.push({ itemId: null, newQuantity: null });
      }
    }

    await connection.commit();

    res.status(201).json({ message: "Stock purchase recorded", purchaseId, updatedItems });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating stock purchase:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  } finally {
    connection.release();
  }
};

// Create a sale (customer invoice) - decreases item quantities
export const createSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { billNumber, customerName, totalAmount, paymentMethod, items } = req.body;
    if (!billNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Bill number and items are required' });
    }

    await connection.beginTransaction();

    const offerType = req.body.offerType || req.body.offer_type || null;
    const offerValue = req.body.offerValue !== undefined ? parseFloat(req.body.offerValue) : (req.body.offer_value !== undefined ? parseFloat(req.body.offer_value) : null);
    const offerAmount = req.body.offerAmount !== undefined ? parseFloat(req.body.offerAmount) : (req.body.offer_amount !== undefined ? parseFloat(req.body.offer_amount) : 0);
    const createdBy = req.body.createdBy || req.body.created_by || null;
    const createdById = req.body.createdById || req.body.created_by_id || null;

    // Compute cost_total for this sale (sum of cost_price * qty). For custom items use provided costPrice or 0.
    let costTotal = 0;
    for (const it of items) {
      const itemId = it.itemId !== undefined && it.itemId !== null && it.itemId !== '' ? it.itemId : null;
      const qty = parseInt(it.quantity) || 0;
      if (itemId !== null) {
        const [r] = await connection.query('SELECT cost_price FROM items WHERE id = ?', [itemId]);
        const costPrice = (r.length > 0 && r[0].cost_price !== null) ? parseFloat(r[0].cost_price) : 0;
        costTotal += costPrice * qty;
      } else {
        // allow client to send a costPrice for custom items
        const costPrice = parseFloat(it.costPrice ?? it.cost_price ?? 0) || 0;
        costTotal += costPrice * qty;
      }
    }

    // Compute sale total from item selling prices (prefer explicit totalPrice, otherwise itemPrice * qty)
    let saleTotal = 0;
    for (const it of items) {
      const qty = parseFloat(it.quantity || 0) || 0;
      const price = parseFloat(it.itemPrice ?? it.price ?? 0) || 0;
      const lineTotal = (it.totalPrice !== undefined && it.totalPrice !== null) ? parseFloat(it.totalPrice) : parseFloat((price * qty).toFixed(2));
      saleTotal += lineTotal;
    }

    // Insert into sales table (store computed saleTotal and computed cost_total)
    const [saleResult] = await connection.query(
      'INSERT INTO sales (invoice_number, customer_name, total_amount, cost_total, payment_method, offer_type, offer_value, offer_amount, created_by, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [billNumber, customerName || 'Walk-in Customer', parseFloat(saleTotal.toFixed(2)), parseFloat(costTotal.toFixed(2)), paymentMethod || 'Cash', offerType, offerValue, offerAmount, createdBy, createdById]
    );

    const saleId = saleResult.insertId;

    // Process sale items: insert and decrement stock
    for (const item of items) {
      const itemId = item.itemId !== undefined && item.itemId !== null && item.itemId !== '' ? item.itemId : null;
      if (itemId !== null) {
        const [stockCheck] = await connection.query('SELECT quantity FROM items WHERE id = ?', [itemId]);
        if (stockCheck.length === 0) throw new Error(`Item with ID ${itemId} not found`);
        if (stockCheck[0].quantity < item.quantity) throw new Error(`Insufficient stock for item ID ${itemId}. Available: ${stockCheck[0].quantity}, Requested: ${item.quantity}`);

        await connection.query(
          'INSERT INTO sale_items (sale_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)',
          [saleId, itemId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]
        );

        await connection.query('UPDATE items SET quantity = quantity - ? WHERE id = ?', [item.quantity, itemId]);
      } else {
        await connection.query('INSERT INTO sale_items (sale_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, NULL, ?, ?, ?, ?)', [saleId, item.itemName, item.itemPrice, item.quantity, item.totalPrice]);
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Sale recorded', saleId, invoiceNumber: billNumber });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  } finally {
    connection.release();
  }
};

export const getSales = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

export const getSaleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [sale] = await db.query('SELECT * FROM sales WHERE id = ?', [parseInt(id)]);
    if (sale.length === 0) return res.status(404).json({ message: 'Sale not found' });
    const [items] = await db.query('SELECT item_id, item_name as name, item_price as price, quantity, total_price FROM sale_items WHERE sale_id = ?', [parseInt(id)]);
    res.json({ sale: sale[0], items });
  } catch (error) {
    console.error('Error fetching sale details:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
};

// Update a sale (invoice) - allows editing metadata and line items, adjusts stock accordingly
export const updateSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { billNumber, customerName, totalAmount, paymentMethod, items, offerType, offerValue, offerAmount, createdBy, createdById } = req.body;

    await connection.beginTransaction();

    // Ensure sale exists
    const [saleRows] = await connection.query('SELECT * FROM sales WHERE id = ?', [parseInt(id)]);
    if (saleRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Revert stock changes from existing sale items
    const [oldItems] = await connection.query('SELECT item_id, quantity FROM sale_items WHERE sale_id = ?', [parseInt(id)]);
    for (const oi of oldItems) {
      if (oi.item_id !== null) {
        await connection.query('UPDATE items SET quantity = quantity + ? WHERE id = ?', [oi.quantity, oi.item_id]);
      }
    }

    // Delete old sale_items
    await connection.query('DELETE FROM sale_items WHERE sale_id = ?', [parseInt(id)]);

    // Insert new sale items and apply stock reductions
    if (Array.isArray(items)) {
      // Validate stock availability for new items
      for (const it of items) {
        const itemId = it.itemId !== undefined && it.itemId !== null && it.itemId !== '' ? it.itemId : null;
        const qty = parseInt(it.quantity) || 0;
        if (itemId !== null) {
          const [stockCheck] = await connection.query('SELECT quantity FROM items WHERE id = ?', [itemId]);
          if (stockCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: `Item with ID ${itemId} not found` });
          }
          if (stockCheck[0].quantity < qty) {
            await connection.rollback();
            return res.status(400).json({ message: `Insufficient stock for item ID ${itemId}. Available: ${stockCheck[0].quantity}, Requested: ${qty}` });
          }
        }
      }

      // All good, insert and decrement
      for (const it of items) {
        const itemId = it.itemId !== undefined && it.itemId !== null && it.itemId !== '' ? it.itemId : null;
        const qty = parseInt(it.quantity) || 0;
        const totalPrice = parseFloat(it.totalPrice ?? it.total_price ?? it.total ?? 0);
        if (itemId !== null) {
          await connection.query('INSERT INTO sale_items (sale_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)', [parseInt(id), itemId, it.itemName || it.name || null, parseFloat(it.itemPrice ?? it.price ?? 0), qty, totalPrice]);
          await connection.query('UPDATE items SET quantity = quantity - ? WHERE id = ?', [qty, itemId]);
        } else {
          await connection.query('INSERT INTO sale_items (sale_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, NULL, ?, ?, ?, ?)', [parseInt(id), it.itemName || it.name || null, parseFloat(it.itemPrice ?? it.price ?? 0), qty, totalPrice]);
        }
      }
    }

    // Recompute sale total and cost_total for the updated sale
    // Recompute sale total from provided items
    let newTotalAmount = 0;
    if (Array.isArray(items)) {
      for (const it of items) {
        const qty = parseFloat(it.quantity || 0) || 0;
        const price = parseFloat(it.itemPrice ?? it.price ?? 0) || 0;
        const lineTotal = (it.totalPrice !== undefined && it.totalPrice !== null) ? parseFloat(it.totalPrice) : parseFloat((price * qty).toFixed(2));
        newTotalAmount += lineTotal;
      }
    }

    // Recompute cost_total for the updated sale
    let newCostTotal = 0;
    if (Array.isArray(items)) {
      for (const it of items) {
        const itemId = it.itemId !== undefined && it.itemId !== null && it.itemId !== '' ? it.itemId : null;
        const qty = parseInt(it.quantity) || 0;
        if (itemId !== null) {
          const [r] = await connection.query('SELECT cost_price FROM items WHERE id = ?', [itemId]);
          const costPrice = (r.length > 0 && r[0].cost_price !== null) ? parseFloat(r[0].cost_price) : 0;
          newCostTotal += costPrice * qty;
        } else {
          const costPrice = parseFloat(it.costPrice ?? it.cost_price ?? 0) || 0;
          newCostTotal += costPrice * qty;
        }
      }
    }

    await connection.query(
      'UPDATE sales SET invoice_number = ?, customer_name = ?, total_amount = ?, payment_method = ?, offer_type = ?, offer_value = ?, offer_amount = ?, created_by = ?, created_by_id = ?, cost_total = ? WHERE id = ?',
      [billNumber, customerName || 'Walk-in Customer', parseFloat(newTotalAmount.toFixed(2)), paymentMethod || 'Cash', offerType || null, offerValue !== undefined ? offerValue : null, offerAmount !== undefined ? offerAmount : 0, createdBy || null, createdById || null, parseFloat(newCostTotal.toFixed(2)), parseInt(id)]
    );

    await connection.commit();
    res.json({ message: 'Sale updated successfully', saleId: parseInt(id) });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  } finally {
    connection.release();
  }
};

// Delete a sale (invoice) - restores stock and removes sale and its items
export const deleteSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [saleRows] = await connection.query('SELECT id FROM sales WHERE id = ?', [parseInt(id)]);
    if (saleRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    const [items] = await connection.query('SELECT item_id, quantity FROM sale_items WHERE sale_id = ?', [parseInt(id)]);
    for (const it of items) {
      if (it.item_id !== null) {
        await connection.query('UPDATE items SET quantity = quantity + ? WHERE id = ?', [it.quantity, it.item_id]);
      }
    }

    await connection.query('DELETE FROM sale_items WHERE sale_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM sales WHERE id = ?', [parseInt(id)]);

    await connection.commit();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  } finally {
    connection.release();
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { type } = req.query; // e.g., type=supplier
    // Include paid amount (sum of payments) so frontend can determine status and due date visibility
    let query = `
      SELECT p.*, COUNT(pi.id) as item_count, IFNULL(SUM(pay.amount),0) as paid_amount
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      LEFT JOIN payments pay ON pay.purchase_id = p.id
    `;
    const params = [];
    if (type === 'supplier') {
      query += ' WHERE p.purchase_type = ?';
      params.push('supplier');
    }
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const [purchases] = await db.query(query, params);
    console.log('[getPurchases] Returning purchases with created_by values:', purchases.map(p => ({ id: p.id, bill_number: p.bill_number, created_by: p.created_by })));
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

    // Get payments for this purchase and include payer info (if linked to users)
    const [payments] = await db.query(`
      SELECT pay.id, pay.amount, pay.method, pay.note, pay.paid_at, pay.paid_by, pay.paid_by_id, u.name as paid_by_name, u.role as paid_by_role
      FROM payments pay
      LEFT JOIN users u ON pay.paid_by_id = u.id
      WHERE pay.purchase_id = ?
      ORDER BY pay.paid_at ASC
    `, [parseInt(id)]);
    const paidAmount = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const totalAmount = parseFloat(purchase[0].total_amount || 0);
    const balance = parseFloat((totalAmount - paidAmount).toFixed(2));

    res.json({
      purchase: purchase[0],
      items: items,
      payments: payments,
      paidAmount: paidAmount,
      balance: balance
    });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

// Record a payment against a purchase (invoice)
export const addPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params; // purchase id
    const { amount, method, note } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }

    await connection.beginTransaction();

    // Ensure purchase exists
    const [pRows] = await connection.query('SELECT id, total_amount FROM purchases WHERE id = ?', [parseInt(id)]);
    if (pRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Insert payment (accept optional paid_by_id referencing users.id)
    const paidBy = req.body.paid_by || req.body.paidBy || null;
    const paidById = req.body.paid_by_id || req.body.paidById || null;

    // If frontend only sent a payer name, try to resolve to a user id (best-effort)
    let finalPaidById = paidById;
    if (!finalPaidById && paidBy) {
      const [userMatch] = await connection.query('SELECT id FROM users WHERE name = ? LIMIT 1', [paidBy]);
      if (userMatch.length > 0) finalPaidById = userMatch[0].id;
    }

    const [payResult] = await connection.query('INSERT INTO payments (purchase_id, amount, method, paid_by, paid_by_id, note, paid_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)', [parseInt(id), parseFloat(amount), method || 'Cash', paidBy, finalPaidById, note || null]);

    // Compute total paid
    const [paidSumRows] = await connection.query('SELECT IFNULL(SUM(amount),0) as paid FROM payments WHERE purchase_id = ?', [parseInt(id)]);
    const paid = parseFloat(paidSumRows[0].paid || 0);
    const total = parseFloat(pRows[0].total_amount || 0);

    // Determine status
    let status = 'pending';
    if (paid >= total) status = 'paid';
    else if (paid > 0) status = 'partial';

    // Update purchase payment_status
    await connection.query('UPDATE purchases SET payment_status = ? WHERE id = ?', [status, parseInt(id)]);

    await connection.commit();

    res.status(201).json({ message: 'Payment recorded', paymentId: payResult.insertId, paidAmount: paid, totalAmount: total, paymentStatus: status });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  } finally {
    connection.release();
  }
};

// Get purchases that are due (due_date <= today and not fully paid)
export const getDuePurchases = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, IFNULL(SUM(pay.amount),0) as paid_amount
      FROM purchases p
      LEFT JOIN payments pay ON pay.purchase_id = p.id
      WHERE p.due_date IS NOT NULL AND p.due_date <= CURDATE() AND (p.payment_status IS NULL OR p.payment_status != 'paid')
      GROUP BY p.id
      ORDER BY p.due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching due purchases:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
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
    
    // Get top selling products (from sale_items)
    const [topProducts] = await db.query(`
      SELECT 
        si.item_name as name, 
        SUM(si.quantity) as totalSold 
      FROM sale_items si
      GROUP BY si.item_id, si.item_name
      ORDER BY totalSold DESC
      LIMIT 3
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

      // Revert inventory changes from the existing purchase: since purchases (supplier stock receipts)
      // previously INCREASED item quantities, we must subtract those old quantities to revert them.
      for (const item of currentItems) {
        if (item.item_id !== null) {
          await connection.query(
            "UPDATE items SET quantity = quantity - ? WHERE id = ?",
            [item.quantity, item.item_id]
          );
        }
      }

      // Remove old purchase items; we'll re-insert the new set below
      await connection.query("DELETE FROM purchase_items WHERE purchase_id = ?", [parseInt(id)]);

      // Insert new purchase items and apply inventory increases for supplier stock
      for (const it of items) {
        const itemId = it.item_id ?? it.itemId ?? null;
        const qty = parseInt(it.quantity) || 0;
        const price = parseFloat(it.price ?? it.itemPrice ?? 0) || 0;
        const totalPrice = parseFloat((qty * price).toFixed(2));

        if (itemId !== null) {
          // Ensure item exists
          const [exists] = await connection.query("SELECT id FROM items WHERE id = ?", [itemId]);
          if (exists.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: `Item with ID ${itemId} not found` });
          }

          await connection.query(
            "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)",
            [parseInt(id), itemId, it.name || it.itemName || null, price, qty, totalPrice]
          );

          // Increase stock for supplier purchase
          await connection.query(
            "UPDATE items SET quantity = quantity + ? WHERE id = ?",
            [qty, itemId]
          );
        } else {
          // Custom/service item: insert without affecting stock
          await connection.query(
            "INSERT INTO purchase_items (purchase_id, item_id, item_name, item_price, quantity, total_price) VALUES (?, NULL, ?, ?, ?, ?)",
            [parseInt(id), it.name || it.itemName || null, price, qty, totalPrice]
          );
        }
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
