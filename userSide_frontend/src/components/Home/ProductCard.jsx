import React from "react";
import "./Home.css";

const resolveImageUrl = (img) => {
  if (!img) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (typeof img !== 'string') return 'https://via.placeholder.com/300x200?text=No+Image';
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `http://localhost:5000${img}`;
  return `http://localhost:5000/uploads/${img}`;
};

const pickImages = (product) => {
  // Try multiple possible fields and return [primary, secondary]
  const imgs = [];
  if (Array.isArray(product.images) && product.images.length) imgs.push(...product.images);
  if (Array.isArray(product.product_images) && product.product_images.length) imgs.push(...product.product_images);
  if (product.image) imgs.push(product.image);
  if (product.product_image) imgs.push(product.product_image);
  if (product.image2) imgs.push(product.image2);
  if (product.secondary_image) imgs.push(product.secondary_image);

  // dedupe and keep first two
  const uniq = [...new Set(imgs)].slice(0, 2);
  return [uniq[0] || null, uniq[1] || null];
};

const ProductCard = ({ product, category }) => {
  const [primaryImg, secondaryImg] = pickImages(product);
  const primaryUrl = resolveImageUrl(primaryImg);
  const secondaryUrl = resolveImageUrl(secondaryImg || primaryImg);

  return (
    <div className="electro-product-card">
      <div className="electro-product-image-container two-images">
        <div className="electro-product-image-main">
          <img
            src={primaryUrl}
            alt={product.name}
            className="electro-product-image"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
          />
        </div>
        <div className="electro-product-image-side">
          <img
            src={secondaryUrl}
            alt={product.name + ' secondary'}
            className="electro-product-image-secondary"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x100?text=No+Image'; }}
          />
        </div>
        <span className="electro-product-badge">New</span>
      </div>

      <div className="electro-product-info">
        <div className="electro-product-category">{category}</div>
        <h3 className="electro-product-name">{product.name}</h3>
        <p className="electro-product-description">
          {product.description?.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description}
        </p>
        
        <div className="electro-price-section">
          <span className="electro-price">Rs. {product.price}</span>
          {product.originalPrice && (
            <span className="electro-original-price">Rs. {product.originalPrice}</span>
          )}
        </div>
        
        <div className="electro-product-meta">
          <div className="electro-stock-info">
            <span className={`electro-stock ${product.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            <span className="electro-quantity">Available: {product.quantity}</span>
          </div>
          
          <div className="electro-rating">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`electro-star ${i < 4 ? 'filled' : ''}`}>★</span>
            ))}
          </div>
        </div>
        
        <div className="electro-product-actions">
          <button className="electro-add-to-cart">
            <span className="electro-cart-icon">🛒</span> Add to Cart
          </button>
          <button className="electro-wishlist" title="Add to Wishlist">
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;