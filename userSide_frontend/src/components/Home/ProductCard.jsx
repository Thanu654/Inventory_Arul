import React from "react";
import "./Home.css";

const ProductCard = ({ product, category }) => {
  return (
    <div className="electro-product-card">
      <div className="electro-product-image-container">
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : product.image?.startsWith("/")
                ? `http://localhost:5000${product.image}`
                : `http://localhost:5000/uploads/${product.image}`
          }
          alt={product.name}
          className="electro-product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
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