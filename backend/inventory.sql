-- Create database
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT NULL,
    category VARCHAR(100),
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Extend purchases table for supplier invoices (add columns if missing)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND COLUMN_NAME = 'supplier_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE purchases ADD COLUMN supplier_id INT DEFAULT NULL, ADD COLUMN invoice_date DATE DEFAULT NULL, ADD COLUMN due_date DATE DEFAULT NULL, ADD COLUMN payment_status VARCHAR(20) DEFAULT "pending", ADD COLUMN purchase_type VARCHAR(20) DEFAULT "sale"',
    'SELECT "cols_exist"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add FK from purchases.supplier_id to suppliers.id if not exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND CONSTRAINT_NAME = 'fk_purchases_supplier'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE purchases ADD CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL',
    'SELECT "fk_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create purchase_items table (allow nullable item_id for custom/services)
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT DEFAULT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- Create alert_settings table
CREATE TABLE IF NOT EXISTS alert_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_quantity INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_type VARCHAR(255) NOT NULL,
    description TEXT,
    real_total DECIMAL(10, 2) NOT NULL,
    offer_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create offer_products table
CREATE TABLE IF NOT EXISTS offer_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Create country_price_conditions table for delivery pricing per country/weight
CREATE TABLE IF NOT EXISTS country_price_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    min_weight DECIMAL(6,2) NOT NULL,
    max_weight DECIMAL(6,2) NOT NULL,
    normal_price DECIMAL(10,2) NOT NULL,
    offer_price DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Add subcategory_id to items (if not exists)
-- Add subcategory_id column if it does not exist (works across MySQL/MariaDB versions)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'items'
        AND COLUMN_NAME = 'subcategory_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE items ADD COLUMN subcategory_id INT DEFAULT NULL',
    'SELECT "column_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for subcategory_id if it does not exist
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'items'
        AND CONSTRAINT_NAME = 'fk_items_subcategory'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE items ADD CONSTRAINT fk_items_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL',
    'SELECT "fk_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- create user table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--  staff permission
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  page VARCHAR(50),
  can_access BOOLEAN DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payments table to track payments for purchases (invoices)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) DEFAULT 'Cash',
    paid_by VARCHAR(255) DEFAULT NULL,
    note TEXT,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
);

-- Add paid_by column to payments if it doesn't exist (for older DBs)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'payments'
        AND COLUMN_NAME = 'paid_by'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE payments ADD COLUMN paid_by VARCHAR(255) DEFAULT NULL',
    'SELECT "paid_by_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add paid_by_id column to payments if it doesn't exist (to reference users table)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'payments'
        AND COLUMN_NAME = 'paid_by_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE payments ADD COLUMN paid_by_id INT DEFAULT NULL',
    'SELECT "paid_by_id_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add foreign key constraint from payments.paid_by_id to users.id if not exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'payments'
        AND CONSTRAINT_NAME = 'fk_payments_paid_by'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE payments ADD CONSTRAINT fk_payments_paid_by FOREIGN KEY (paid_by_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "fk_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index to quickly query due purchases (conditional checks for compatibility)
SET @idx_due_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND INDEX_NAME = 'idx_purchases_due_date'
);
SET @sql = IF(@idx_due_exists = 0,
    'ALTER TABLE purchases ADD INDEX idx_purchases_due_date (due_date)',
    'SELECT "idx_due_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_pay_status_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND INDEX_NAME = 'idx_purchases_payment_status'
);
SET @sql = IF(@idx_pay_status_exists = 0,
    'ALTER TABLE purchases ADD INDEX idx_purchases_payment_status (payment_status)',
    'SELECT "idx_pay_status_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create expenses table to track business expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    amount DECIMAL(12,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for quick expense range queries
SET @idx_expenses_date_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'expenses'
        AND INDEX_NAME = 'idx_expenses_created_at'
);
SET @sql = IF(@idx_expenses_date_exists = 0,
    'ALTER TABLE expenses ADD INDEX idx_expenses_created_at (created_at)',
    'SELECT "idx_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add created_by and created_by_id to purchases to record who created the invoice/purchase
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND COLUMN_NAME = 'created_by'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE purchases ADD COLUMN created_by VARCHAR(255) DEFAULT NULL, ADD COLUMN created_by_id INT DEFAULT NULL',
    'SELECT "created_by_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add foreign key for created_by_id to users.id if not exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchases'
        AND CONSTRAINT_NAME = 'fk_purchases_created_by'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE purchases ADD CONSTRAINT fk_purchases_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "fk_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create sales table for customer invoices (separate from supplier purchases)
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    total_amount DECIMAL(10,2) NOT NULL,
    cost_total DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    offer_type VARCHAR(50) DEFAULT NULL,
    offer_value DECIMAL(10,2) DEFAULT NULL,
    offer_amount DECIMAL(10,2) DEFAULT 0,
    created_by VARCHAR(255) DEFAULT NULL,
    created_by_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    item_id INT DEFAULT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- Create inventory_transactions table to record opening stock and manual adjustments
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT DEFAULT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    type ENUM('opening','adjustment','correction') DEFAULT 'adjustment',
    reference VARCHAR(255) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    created_by VARCHAR(255) DEFAULT NULL,
    created_by_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- Add FK from sales.created_by_id to users.id if users table exists
SET @fk_sales_created_by = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'sales'
        AND CONSTRAINT_NAME = 'fk_sales_created_by'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(@fk_sales_created_by = 0,
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "fk_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;