import db from '../config/db.js';

// Returns product-level aggregated report: sold qty/amount, purchased qty/amount, estimated profit
export const productReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const params = [];
    let dateCond = '';
    if (startDate) { dateCond += ' AND p.created_at >= ?'; params.push(startDate + ' 00:00:00'); }
    if (endDate) { dateCond += ' AND p.created_at <= ?'; params.push(endDate + ' 23:59:59'); }

    // Aggregate purchase_items joined with purchases (covers supplier buys and legacy sales stored in purchases)
    const [purchaseAgg] = await db.query(
      `SELECT pi.item_id, pi.item_name,
              SUM(CASE WHEN p.purchase_type = 'supplier' THEN pi.quantity ELSE 0 END) AS purchased_qty,
              SUM(CASE WHEN p.purchase_type = 'supplier' THEN pi.total_price ELSE 0 END) AS purchased_amount,
              SUM(CASE WHEN p.purchase_type IS NULL OR p.purchase_type != 'supplier' THEN pi.quantity ELSE 0 END) AS sold_qty_legacy,
              SUM(CASE WHEN p.purchase_type IS NULL OR p.purchase_type != 'supplier' THEN pi.total_price ELSE 0 END) AS sold_amount_legacy
       FROM purchase_items pi
       JOIN purchases p ON p.id = pi.purchase_id
       WHERE 1=1 ${dateCond}
       GROUP BY pi.item_id, pi.item_name`, params
    );

    // Aggregate sale_items (new sales table)
    const saleParams = [];
    let saleDateCond = '';
    if (startDate) { saleDateCond += ' AND s.created_at >= ?'; saleParams.push(startDate + ' 00:00:00'); }
    if (endDate) { saleDateCond += ' AND s.created_at <= ?'; saleParams.push(endDate + ' 23:59:59'); }
    const [saleAgg] = await db.query(
      `SELECT si.item_id, si.item_name, SUM(si.quantity) as sold_qty_sales, SUM(si.total_price) as sold_amount_sales
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       WHERE 1=1 ${saleDateCond}
       GROUP BY si.item_id, si.item_name`, saleParams
    );

    // Build lookup maps
    const purchaseMap = {};
    purchaseAgg.forEach(r => {
      const key = (r.item_id === null) ? `_c_${r.item_name}` : `i_${r.item_id}`;
      purchaseMap[key] = {
        item_id: r.item_id,
        item_name: r.item_name,
        purchased_qty: parseFloat(r.purchased_qty || 0),
        purchased_amount: parseFloat(r.purchased_amount || 0),
        sold_qty_legacy: parseFloat(r.sold_qty_legacy || 0),
        sold_amount_legacy: parseFloat(r.sold_amount_legacy || 0)
      };
    });

    const saleMap = {};
    saleAgg.forEach(r => {
      const key = (r.item_id === null) ? `_c_${r.item_name}` : `i_${r.item_id}`;
      saleMap[key] = {
        sold_qty_sales: parseFloat(r.sold_qty_sales || 0),
        sold_amount_sales: parseFloat(r.sold_amount_sales || 0)
      };
    });

    // Merge keys
    const keys = new Set([...Object.keys(purchaseMap), ...Object.keys(saleMap)]);
    const result = [];
    let totals = { sold_qty: 0, sold_amount: 0, purchased_qty: 0, purchased_amount: 0, profit: 0 };

    for (const k of keys) {
      const p = purchaseMap[k] || { item_id: null, item_name: k.startsWith('_c_') ? k.slice(3) : null, purchased_qty: 0, purchased_amount: 0, sold_qty_legacy: 0, sold_amount_legacy: 0 };
      const s = saleMap[k] || { sold_qty_sales: 0, sold_amount_sales: 0 };

      const sold_qty = (p.sold_qty_legacy || 0) + (s.sold_qty_sales || 0);
      const sold_amount = (p.sold_amount_legacy || 0) + (s.sold_amount_sales || 0);
      const purchased_qty = p.purchased_qty || 0;
      const purchased_amount = p.purchased_amount || 0;

      // avg cost from supplier purchases for this item
      const avg_cost = purchased_qty > 0 ? parseFloat((purchased_amount / purchased_qty).toFixed(2)) : null;

      // estimated profit = sold_amount - (avg_cost * sold_qty)  (approximation)
      const est_cogs = avg_cost !== null ? parseFloat((avg_cost * sold_qty).toFixed(2)) : 0;
      const profit = parseFloat((sold_amount - est_cogs).toFixed(2));

      totals.sold_qty += sold_qty;
      totals.sold_amount += sold_amount;
      totals.purchased_qty += purchased_qty;
      totals.purchased_amount += purchased_amount;
      totals.profit += profit;

      result.push({
        item_id: p.item_id,
        item_name: p.item_name || (k.startsWith('_c_') ? k.slice(3) : null),
        sold_qty: parseFloat(sold_qty.toFixed(2)),
        sold_amount: parseFloat(sold_amount.toFixed(2)),
        purchased_qty: parseFloat(purchased_qty.toFixed(2)),
        purchased_amount: parseFloat(purchased_amount.toFixed(2)),
        avg_cost: avg_cost !== null ? parseFloat(avg_cost.toFixed(2)) : 0,
        profit: parseFloat(profit.toFixed(2))
      });
    }

    totals.sold_qty = parseFloat(totals.sold_qty.toFixed(2));
    totals.sold_amount = parseFloat(totals.sold_amount.toFixed(2));
    totals.purchased_qty = parseFloat(totals.purchased_qty.toFixed(2));
    totals.purchased_amount = parseFloat(totals.purchased_amount.toFixed(2));
    totals.profit = parseFloat(totals.profit.toFixed(2));

    res.json({ data: result, totals });
  } catch (err) {
    console.error('productReport error', err.message);
    res.status(500).json({ message: 'Failed to generate product report', error: err.message });
  }
};

// Returns overall profit/sales/purchases summary (optionally date filtered)
export const profitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateCond = '';
    const params = [];
    if (startDate) {
      dateCond += ' AND p.created_at >= ?';
      params.push(startDate + ' 00:00:00');
    }
    if (endDate) {
      dateCond += ' AND p.created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    const [rows] = await db.query(
      `SELECT
         SUM(CASE WHEN p.purchase_type = 'supplier' THEN pi.total_price ELSE 0 END) AS total_purchases,
         SUM(CASE WHEN p.purchase_type != 'supplier' THEN pi.total_price ELSE 0 END) AS total_sales
       FROM purchase_items pi
       JOIN purchases p ON p.id = pi.purchase_id
       WHERE 1=1 ${dateCond}`,
      params
    );

    const totalPurchases = parseFloat(rows[0].total_purchases || 0);
    const totalSales = parseFloat(rows[0].total_sales || 0);
    const profit = parseFloat((totalSales - totalPurchases).toFixed(2));

    res.json({ total_purchases: totalPurchases, total_sales: totalSales, profit });
  } catch (err) {
    console.error('profitReport error', err.message);
    res.status(500).json({ message: 'Failed to generate profit report', error: err.message });
  }
};

// Return chronological history for a single product (by itemId or itemName)
export const productHistory = async (req, res) => {
  try {
    const { itemId, itemName, startDate, endDate } = req.query;
    if (!itemId && !itemName) return res.status(400).json({ message: 'Provide itemId or itemName' });
    // Build simplified product history focused on: invoice/bill, type, date, quantity, created_by, running_qty
    const params = [];
    let whereCond = '';
    if (itemId) { whereCond += ' AND (pi.item_id = ? OR si.item_id = ?)'; params.push(parseInt(itemId), parseInt(itemId)); }
    else if (itemName) { whereCond += ' AND (pi.item_name = ? OR pi.item_name LIKE ? OR si.item_name = ? OR si.item_name LIKE ?)'; params.push(itemName, `%${itemName}%`, itemName, `%${itemName}%`); }

    // Compute starting quantity at startDate 00:00:00
    let startingQty = 0;
    if (startDate) {
      const startParams = [];
      let startCond = '';
      if (itemId) { startCond += ' AND (pi.item_id = ? OR si.item_id = ?)'; startParams.push(parseInt(itemId), parseInt(itemId)); }
      else if (itemName) { startCond += ' AND (pi.item_name = ? OR pi.item_name LIKE ? OR si.item_name = ? OR si.item_name LIKE ?)'; startParams.push(itemName, `%${itemName}%`, itemName, `%${itemName}%`); }

      // Sum supplier purchases, sales, and inventory transactions before startDate
      const [beforeRows] = await db.query(
        `SELECT
           IFNULL(SUM(CASE WHEN p.purchase_type = 'supplier' THEN pi.quantity ELSE 0 END),0) AS purchased_before,
           IFNULL(SUM(CASE WHEN p.purchase_type IS NULL OR p.purchase_type != 'supplier' THEN pi.quantity ELSE 0 END),0) AS sold_before_legacy,
           IFNULL((SELECT SUM(si.quantity) FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.created_at < ? ${itemId ? 'AND si.item_id = ?' : itemName ? 'AND (si.item_name = ? OR si.item_name LIKE ?)' : ''}),0) as sold_before_sales,
           IFNULL((SELECT SUM(it.quantity) FROM inventory_transactions it WHERE it.created_at < ? ${itemId ? 'AND it.item_id = ?' : itemName ? 'AND (it.item_name = ? OR it.item_name LIKE ?)' : ''}),0) as trans_before
         FROM purchase_items pi
         JOIN purchases p ON p.id = pi.purchase_id
         WHERE p.created_at < ? ${itemId ? 'AND pi.item_id = ?' : itemName ? 'AND (pi.item_name = ? OR pi.item_name LIKE ?)' : ''}`,
        (itemId ? [startDate + ' 00:00:00', parseInt(itemId), startDate + ' 00:00:00', parseInt(itemId), startDate + ' 00:00:00', parseInt(itemId)] : itemName ? [startDate + ' 00:00:00', itemName, `%${itemName}%`, startDate + ' 00:00:00', itemName, `%${itemName}%`, startDate + ' 00:00:00', itemName, `%${itemName}%`] : [startDate + ' 00:00:00'])
      );

      const purchasedBefore = parseFloat((beforeRows[0] && beforeRows[0].purchased_before) || 0);
      const soldBefore = parseFloat(((beforeRows[0] && beforeRows[0].sold_before_legacy) || 0)) + parseFloat(((beforeRows[0] && beforeRows[0].sold_before_sales) || 0));
      const transBefore = parseFloat(((beforeRows[0] && beforeRows[0].trans_before) || 0));
      // startingQty = purchases - sales + manual transactions (openings/adjustments)
      startingQty = purchasedBefore - soldBefore + transBefore;
    }

    // Fetch purchases, sales and inventory transactions in range
    const rangeParams = [];
    let rangeCond = '';
    if (startDate) { rangeCond += ' AND dt >= ?'; rangeParams.push(startDate + ' 00:00:00'); }
    if (endDate) { rangeCond += ' AND dt <= ?'; rangeParams.push(endDate + ' 23:59:59'); }

    // unified query: union purchases and sales with normalized columns
    const qParams = [];
    let itemFilter = '';
    if (itemId) { itemFilter = ' AND item_id = ?'; qParams.push(parseInt(itemId)); }
    else if (itemName) { itemFilter = ' AND (item_name = ? OR item_name LIKE ?)'; qParams.push(itemName, `%${itemName}%`); }

    const [rows] = await db.query(
      `SELECT s.id as source_id, s.invoice_number as ref_no, 'sale' as type, s.created_at as dt, si.item_id as item_id, si.item_name as item_name, si.quantity as qty, s.created_by as created_by
       FROM sale_items si JOIN sales s ON s.id = si.sale_id
       WHERE 1=1 ${startDate ? ' AND s.created_at >= ?' : ''} ${endDate ? ' AND s.created_at <= ?' : ''} ${itemId ? ' AND si.item_id = ?' : ''} ${itemName ? ' AND (si.item_name = ? OR si.item_name LIKE ?)' : ''}
       UNION ALL
       SELECT p.id as source_id, p.bill_number as ref_no, (CASE WHEN p.purchase_type = 'supplier' THEN 'buy' ELSE 'other' END) as type, p.created_at as dt, pi.item_id as item_id, pi.item_name as item_name, pi.quantity as qty, p.created_by as created_by
       FROM purchase_items pi JOIN purchases p ON p.id = pi.purchase_id
       WHERE 1=1 ${startDate ? ' AND p.created_at >= ?' : ''} ${endDate ? ' AND p.created_at <= ?' : ''} ${itemId ? ' AND pi.item_id = ?' : ''} ${itemName ? ' AND (pi.item_name = ? OR pi.item_name LIKE ?)' : ''}
       UNION ALL
       SELECT it.id as source_id, it.reference as ref_no, it.type as type, it.created_at as dt, it.item_id as item_id, it.item_name as item_name, it.quantity as qty, it.created_by as created_by
       FROM inventory_transactions it
       WHERE 1=1 ${startDate ? ' AND it.created_at >= ?' : ''} ${endDate ? ' AND it.created_at <= ?' : ''} ${itemId ? ' AND it.item_id = ?' : ''} ${itemName ? ' AND (it.item_name = ? OR it.item_name LIKE ?)' : ''}
       ORDER BY dt ASC`,
      // build params for both parts in same order
      (function(){
        const paramsArr = [];
        if (startDate) paramsArr.push(startDate + ' 00:00:00');
        if (endDate) paramsArr.push(endDate + ' 23:59:59');
        if (itemId) paramsArr.push(parseInt(itemId));
        if (itemName) { paramsArr.push(itemName); paramsArr.push(`%${itemName}%`); }
        if (startDate) paramsArr.push(startDate + ' 00:00:00');
        if (endDate) paramsArr.push(endDate + ' 23:59:59');
        if (itemId) paramsArr.push(parseInt(itemId));
        if (itemName) { paramsArr.push(itemName); paramsArr.push(`%${itemName}%`); }
        if (startDate) paramsArr.push(startDate + ' 00:00:00');
        if (endDate) paramsArr.push(endDate + ' 23:59:59');
        if (itemId) paramsArr.push(parseInt(itemId));
        if (itemName) { paramsArr.push(itemName); paramsArr.push(`%${itemName}%`); }
        return paramsArr;
      })()
    );

    // Build history with running quantity
    let runningQty = parseFloat(startingQty || 0);
    const history = rows.map(r => {
      const qty = parseFloat(r.qty || 0);
      const type = (r.type === 'buy') ? 'buy' : (r.type === 'sale' ? 'sales' : r.type);
      const signed = type === 'buy' ? qty : -qty;
      runningQty += signed;
      return {
        ref: r.ref_no || null,
        type,
        date: r.dt,
        quantity: qty,
        created_by: r.created_by || null,
        running_qty: parseFloat(runningQty.toFixed(2))
      };
    });

    res.json({ starting_qty: parseFloat(startingQty || 0), data: history });
  } catch (err) {
    console.error('productHistory error', err.message);
    res.status(500).json({ message: 'Failed to generate product history', error: err.message });
  }
};

// Sales report: sales list (date range) with per-customer aggregation and profit
export const salesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const params = [];
    let dateCond = '';
    if (startDate) { dateCond += ' AND s.created_at >= ?'; params.push(startDate + ' 00:00:00'); }
    if (endDate) { dateCond += ' AND s.created_at <= ?'; params.push(endDate + ' 23:59:59'); }

    // Fetch invoices directly from sales table and compute profit using stored cost_total
    const [salesRows] = await db.query(
      `SELECT id as sale_id, invoice_number, customer_name, total_amount, cost_total, offer_amount, created_by, created_at
       FROM sales s
       WHERE 1=1 ${dateCond}
       ORDER BY s.created_at ASC`, params
    );

    const purchases = salesRows.map(s => {
      const total_amount = parseFloat(s.total_amount || 0);
      const cost_total = parseFloat(s.cost_total || 0);
      const offers = parseFloat(s.offer_amount || 0);
      const profit = parseFloat((total_amount - cost_total - offers).toFixed(2));
      return {
        purchase_id: s.sale_id,
        invoice_number: s.invoice_number,
        purchase_at: s.created_at,
        customer_name: s.customer_name,
        total_amount: parseFloat(total_amount.toFixed(2)),
        cost_total: parseFloat(cost_total.toFixed(2)),
        total_allocated_offer: parseFloat(offers.toFixed(2)),
        profit,
        created_by: s.created_by || null
      };
    });

    const byCustomer = {};
    purchases.forEach(p => {
      const cname = p.customer_name || 'Walk-in Customer';
      if (!byCustomer[cname]) byCustomer[cname] = { customer_name: cname, total_sales: 0, total_cogs: 0, total_allocated_offer: 0, profit: 0 };
      byCustomer[cname].total_sales += p.total_amount;
      byCustomer[cname].total_cogs += p.cost_total;
      byCustomer[cname].total_allocated_offer += p.total_allocated_offer;
      byCustomer[cname].profit += p.profit;
    });

    const byCustomerArr = Object.values(byCustomer).map(c => ({
      ...c,
      total_sales: parseFloat(c.total_sales.toFixed(2)),
      total_cogs: parseFloat(c.total_cogs.toFixed(2)),
      total_allocated_offer: parseFloat(c.total_allocated_offer.toFixed(2)),
      profit: parseFloat(c.profit.toFixed(2))
    }));

    const totals = purchases.reduce((acc, p) => {
      acc.total_sales += p.total_amount;
      acc.total_cogs += p.cost_total;
      acc.total_offers += p.total_allocated_offer;
      acc.profit += p.profit;
      return acc;
    }, { total_sales: 0, total_cogs: 0, total_offers: 0, profit: 0 });

    totals.total_sales = parseFloat(totals.total_sales.toFixed(2));
    totals.total_cogs = parseFloat(totals.total_cogs.toFixed(2));
    totals.total_offers = parseFloat(totals.total_offers.toFixed(2));
    totals.profit = parseFloat(totals.profit.toFixed(2));

    res.json({ purchases, byCustomer: byCustomerArr, totals });
  } catch (err) {
    console.error('salesReport error', err.message);
    res.status(500).json({ message: 'Failed to generate sales report', error: err.message });
  }
};

// List expenses (optional date range)
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const params = [];
    let cond = '';
    if (startDate) { cond += ' AND created_at >= ?'; params.push(startDate + ' 00:00:00'); }
    if (endDate) { cond += ' AND created_at <= ?'; params.push(endDate + ' 23:59:59'); }

    const [rows] = await db.query(`SELECT * FROM expenses WHERE 1=1 ${cond} ORDER BY created_at DESC`, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('getExpenses error', err.message);
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
};

// Add expense
export const addExpense = async (req, res) => {
  try {
    const { title, category, amount, note } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'title and amount are required' });
    const [result] = await db.query('INSERT INTO expenses (title, category, amount, note) VALUES (?, ?, ?, ?)', [title, category || null, amount, note || null]);
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error('addExpense error', err.message);
    res.status(500).json({ message: 'Failed to add expense', error: err.message });
  }
};

export default {
  productReport,
  profitReport,
  productHistory,
  salesReport,
  getExpenses,
  addExpense
};
