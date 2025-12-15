// ProductCard.jsx - Updated with WhatsApp button in same line as price
import React from "react";
import "./Home.css";

const resolveImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
  if (typeof img !== 'string') return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `http://localhost:5000${img}`;
  return `http://localhost:5000/uploads/${img}`;
};

const ProductCard = ({ product, category }) => {
  const handleWhatsAppClick = () => {
    const phone = "+9475350101";
    const message = `Hello! I'm interested in this product: ${product.name} (Rs. ${product.price})`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="electro-product-card">
      <div className="electro-product-image-container">
        <img
          src={resolveImageUrl(product.image || product.product_image)}
          alt={product.name}
          className="electro-product-image"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'; 
          }}
        />
        <div className="electro-product-badges">
          <span className="electro-product-badge new">NEW</span>
          {product.discount && (
            <span className="electro-product-badge discount">-{product.discount}%</span>
          )}
        </div>
      </div>

      <div className="electro-product-content">
        <div className="electro-product-header">
          <span className="electro-product-category">{category}</span>
         
        </div>

        {/* PRODUCT NAME + STOCK IN ONE LINE */}
        <div className="electro-product-name-row">
          <h3 className="electro-product-name">{product.name}</h3>
          <div className={`electro-stock ${product.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
          
        </div>
        
        <div>
          <p className="electro-product-description">
          {product.description?.substring(0, 100)}...
        </p>
        </div>

        {/* PRICE + WHATSAPP IN ONE LINE */}
        <div className="electro-price-whatsapp-row">
          <div className="electro-price-container">
            <span className="electro-price">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="electro-original-price">Rs. {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button className="electro-whatsapp-btn" onClick={handleWhatsAppClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 13.71 2.46 15.31 3.24 16.71L2 22L7.29 20.76C8.69 21.54 10.29 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.07 14.65C16.85 15.32 15.69 16.08 15.03 16.18C14.51 16.26 13.98 16.3 13.46 16.3C11.78 16.3 10.22 15.5 9.16 14.52C7.8 13.24 6.9 11.4 6.9 9.5C6.9 8.4 7.2 7.4 7.8 6.6C8.24 6.06 8.92 5.82 9.6 5.92C9.9 5.96 10.18 6.06 10.44 6.22C10.76 6.42 10.98 6.78 11.02 7.18C11.06 7.58 10.92 7.96 10.62 8.22C10.34 8.46 10.12 8.76 9.98 9.1C9.8 9.56 9.88 10.08 10.18 10.46C10.86 11.3 11.9 11.9 13.04 11.9C13.66 11.9 14.24 11.72 14.74 11.4C15.18 11.12 15.72 11.08 16.18 11.28C16.54 11.44 16.92 11.52 17.3 11.52C17.68 11.52 18.04 11.38 18.32 11.12C18.72 10.74 18.86 10.18 18.68 9.68C18.46 9.06 17.92 8.6 17.28 8.46C16.2 8.24 15.06 8.66 14.3 9.56C13.54 10.46 13.16 11.62 13.24 12.8C13.32 13.62 13.66 14.38 14.2 14.98C14.72 15.56 15.4 15.94 16.14 16.06C16.88 16.18 17.64 16.04 18.28 15.66C18.84 15.32 19.24 14.78 19.38 14.16C19.54 13.54 19.42 12.9 19.04 12.4C18.66 11.9 18.08 11.6 17.46 11.6C16.84 11.6 16.26 11.9 15.88 12.4C15.5 12.9 15.36 13.52 15.5 14.12C15.64 14.72 16.06 15.22 16.62 15.52C17.18 15.82 17.84 15.9 18.44 15.74C19.04 15.58 19.54 15.2 19.86 14.68C20.18 14.16 20.28 13.54 20.14 12.96C20 12.38 19.62 11.88 19.1 11.58C18.58 11.28 17.98 11.2 17.42 11.36C16.86 11.52 16.38 11.9 16.08 12.42C15.78 12.94 15.68 13.56 15.8 14.16C15.92 14.76 16.26 15.28 16.74 15.62C17.22 15.96 17.8 16.1 18.38 16.04C18.96 15.98 19.5 15.72 19.9 15.3C20.3 14.88 20.54 14.32 20.56 13.74C20.58 13.16 20.38 12.58 20 12.12C19.62 11.66 19.08 11.36 18.5 11.28C17.92 11.2 17.34 11.34 16.86 11.68C16.38 12.02 16.04 12.54 15.92 13.12C15.8 13.7 15.92 14.3 16.26 14.78C16.6 15.26 17.14 15.58 17.72 15.64C18.3 15.7 18.86 15.5 19.28 15.08C19.7 14.66 19.94 14.08 19.94 13.48C19.94 12.88 19.7 12.3 19.28 11.88C18.86 11.46 18.28 11.22 17.68 11.22C17.08 11.22 16.5 11.46 16.08 11.88C15.66 12.3 15.42 12.88 15.42 13.48C15.42 14.08 15.66 14.66 16.08 15.08C16.5 15.5 17.08 15.74 17.68 15.74Z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;