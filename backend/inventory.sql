-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 15, 2025 at 04:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `alert_settings`
--

CREATE TABLE `alert_settings` (
  `id` int(11) NOT NULL,
  `alert_quantity` int(11) NOT NULL DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alert_settings`
--


-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--



-- --------------------------------------------------------

--
-- Table structure for table `country_price_conditions`
--

CREATE TABLE `country_price_conditions` (
  `id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `min_weight` decimal(6,2) NOT NULL,
  `max_weight` decimal(6,2) NOT NULL,
  `normal_price` decimal(10,2) NOT NULL,
  `offer_price` decimal(10,2) DEFAULT NULL,
  `delivery_min_days` int(11) DEFAULT NULL,
  `delivery_max_days` int(11) DEFAULT NULL,
  `delivery_through` enum('plan','ship') DEFAULT 'ship',
  `delivery_type` enum('fast','normal') DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `country_price_conditions`
--


-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--



-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `type` enum('opening','adjustment','correction') DEFAULT 'adjustment',
  `reference` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `min_stock` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subcategory_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `quantity`, `min_stock`, `price`, `cost_price`, `category`, `image`, `created_at`, `updated_at`, `subcategory_id`) VALUES
(1, 'LED Bulb 12W', 'Energy saving LED bulb', 120, 10, 650.00, 550.00, 'Lighting', '/uploads/image-1765679838928-284530787.webp', '2025-12-12 01:20:19', '2025-12-14 07:22:25', NULL),
(2, 'LED Bulb 18W', 'High brightness LED bulb', 90, 100, 850.00, 720.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-14 03:11:55', NULL),
(3, 'Tube Light 4ft', 'White tube light', 68, 0, 1200.00, 980.00, 'Lighting', 'https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D', '2025-12-12 01:20:19', '2025-12-14 07:23:04', NULL),
(4, 'Ceiling Light', 'Round ceiling panel', 60, 0, 1850.00, 1550.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(5, 'Emergency Light', 'Rechargeable emergency light', 40, 0, 4200.00, 3800.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(6, 'Street Light 50W', 'Outdoor street light', 30, 0, 12500.00, 11000.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(7, 'Spot Light', 'Decorative spot light', 45, 0, 2100.00, 1800.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(8, 'Night Lamp', 'Small night lamp', 85, 0, 950.00, 750.00, 'Lighting', 'https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(9, 'Flood Light 100W', 'Outdoor flood light', 35, 0, 14500.00, 13200.00, 'Lighting', 'https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D', '2025-12-12 01:20:19', '2025-12-13 06:50:51', NULL),
(10, 'Table Lamp', 'Study table lamp', 55, 0, 3200.00, 2800.00, 'Lighting', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(11, 'Switch Socket', 'Wall switch socket', 160, 0, 350.00, 280.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlReqftnEN1qlr_E5JohuVnOjcbbaq_VkoLQ&s', '2025-12-12 01:20:19', '2025-12-13 06:51:51', NULL),
(12, 'MCB Breaker', 'Mini circuit breaker', 60, 0, 1850.00, 1600.00, 'Electrical', 'https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(13, 'Power Strip', 'Extension power strip', 90, 0, 2200.00, 1950.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(14, 'Plug Top', '3 pin plug top', 200, 0, 120.00, 95.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(15, 'Fan Regulator', 'Ceiling fan regulator', 50, 0, 1450.00, 1200.00, 'Electrical', 'https://glocusent.com/cdn/shop/articles/default_name_b7d58ddc-58b2-476d-9942-742567c39ac4.webp?v=1762500645', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(16, 'Electric Wire 1mm', 'Copper wire 1mm', 100, 0, 4500.00, 4100.00, 'Electrical', 'https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(17, 'Electric Wire 2.5mm', 'Copper wire 2.5mm', 80, 0, 7200.00, 6700.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(18, 'Switch Board', '6 switch board', 70, 0, 850.00, 720.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(19, 'Indicator Light', 'Panel indicator light', 110, 0, 180.00, 130.00, 'Electrical', 'https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(20, 'Adapter Plug', 'Mobile charger adapter', 95, 0, 1700.00, 1500.00, 'Electrical', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(21, 'PVC Pipe 1 inch', 'Water pipe', 140, 0, 420.00, 350.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(22, 'PVC Pipe 2 inch', 'Large water pipe', 90, 0, 820.00, 720.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(23, 'Water Tap', 'Metal water tap', 110, 0, 950.00, 800.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(24, 'Shower Head', 'Bathroom shower head', 70, 0, 1850.00, 1600.00, 'Plumbing', 'https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(25, 'Ball Valve', 'PVC ball valve', 85, 0, 720.00, 600.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(26, 'Flexible Hose', 'Water hose pipe', 120, 0, 550.00, 450.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(27, 'Sink Pipe', 'Sink drainage pipe', 65, 0, 980.00, 850.00, 'Plumbing', 'https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(28, 'Water Filter', 'Home water filter', 40, 0, 8200.00, 7500.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(29, 'Flush Tank', 'Toilet flush tank', 30, 0, 16500.00, 15000.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(30, 'Pipe Elbow', 'PVC elbow joint', 200, 0, 120.00, 90.00, 'Plumbing', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(31, 'Flush Tank', 'Toilet flush tank', 30, 0, 16500.00, 15000.00, 'TOOL', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),
(32, 'Pipe Elbow', 'PVC elbow joint', 200, 120, 1200.00, 95.00, 'TOOL', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s', '2025-12-12 01:20:19', '2025-12-14 02:52:09', NULL),
(33, 'Indicator Light', 'Panel indicator light', 120, 118, 1000.00, 140.00, 'Hardware', 'https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg', '2025-12-12 01:20:19', '2025-12-14 02:52:29', NULL),
(34, 'Adapter Plug', 'Mobile charger adapter', 95, 0, 1700.00, 1600.00, 'Hardware', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s', '2025-12-12 01:20:19', '2025-12-12 01:20:19', NULL),

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `offer_type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `real_total` decimal(10,2) NOT NULL,
  `offer_total` decimal(10,2) NOT NULL,
  `cost_total` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `offer_type`, `description`, `real_total`, `offer_total`, `cost_total`, `created_at`, `updated_at`) VALUES
(16, 'percentage', NULL, 1200.00, 1080.36, 980.00, '2025-12-14 05:37:22', '2025-12-14 05:37:43'),
(17, 'percentage', NULL, 4550.00, 3640.00, 3800.00, '2025-12-14 05:54:49', '2025-12-14 05:54:49'),
(18, 'percentage', 'NEW ONE ', 1500.00, 1200.00, 1270.00, '2025-12-14 12:40:27', '2025-12-14 12:40:27');

-- --------------------------------------------------------

--
-- Table structure for table `offer_products`
--

CREATE TABLE `offer_products` (
  `id` int(11) NOT NULL,
  `offer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `cost_total` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offer_products`
--

INSERT INTO `offer_products` (`id`, `offer_id`, `product_id`, `product_name`, `product_price`, `cost_price`, `quantity`, `total_price`, `cost_total`) VALUES
(19, 16, 3, 'Tube Light 4ft', 1200.00, 980.00, 1, 1200.00, 980.00),
(20, 17, 2, 'LED Bulb 18W', 850.00, 720.00, 1, 850.00, 720.00),
(21, 17, 3, 'Tube Light 4ft', 1200.00, 980.00, 1, 1200.00, 980.00),
(22, 17, 4, 'Ceiling Light', 1850.00, 1550.00, 1, 1850.00, 1550.00),
(23, 17, 1, 'LED Bulb 12W', 650.00, 550.00, 1, 650.00, 550.00),
(24, 18, 2, 'LED Bulb 18W', 850.00, 720.00, 1, 850.00, 720.00),
(25, 18, 1, 'LED Bulb 12W', 650.00, 550.00, 1, 650.00, 550.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) DEFAULT 'Cash',
  `paid_by` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `paid_by_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--



-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `page` varchar(50) DEFAULT NULL,
  `can_access` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--



-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `bill_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) DEFAULT 'Walk-in Customer',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Cash',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supplier_id` int(11) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'pending',
  `purchase_type` varchar(20) DEFAULT 'sale',
  `created_by` varchar(255) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `offer_type` varchar(50) DEFAULT NULL,
  `offer_value` decimal(10,2) DEFAULT NULL,
  `offer_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--


-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_items`
--



-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) DEFAULT 'Walk-in Customer',
  `total_amount` decimal(10,2) NOT NULL,
  `cost_total` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT 'Cash',
  `offer_type` varchar(50) DEFAULT NULL,
  `offer_value` decimal(10,2) DEFAULT NULL,
  `offer_amount` decimal(10,2) DEFAULT 0.00,
  `created_by` varchar(255) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--


-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--


-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcategories`
--


-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--


--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`) VALUES
(1, 'Admin User', 'admin@gmail.com', '$2b$10$fv9FTGKevaCoSM.Sd1v2zuHRGyKVewZuOlnF.nio9qOBohc5v45Va', 'admin', 'active', '2025-12-09 13:39:28'),

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alert_settings`
--
ALTER TABLE `alert_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `country_price_conditions`
--
ALTER TABLE `country_price_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expenses_created_at` (`created_at`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_items_subcategory` (`subcategory_id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offer_products`
--
ALTER TABLE `offer_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offer_id` (`offer_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `fk_payments_paid_by` (`paid_by_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bill_number` (`bill_number`),
  ADD KEY `fk_purchases_supplier` (`supplier_id`),
  ADD KEY `idx_purchases_due_date` (`due_date`),
  ADD KEY `idx_purchases_payment_status` (`payment_status`),
  ADD KEY `fk_purchases_created_by` (`created_by_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `fk_sales_created_by` (`created_by_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alert_settings`
--
ALTER TABLE `alert_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `country_price_conditions`
--
ALTER TABLE `country_price_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `offer_products`
--
ALTER TABLE `offer_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `fk_items_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `offer_products`
--
ALTER TABLE `offer_products`
  ADD CONSTRAINT `offer_products_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offer_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_paid_by` FOREIGN KEY (`paid_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_purchases_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
