// Home.jsx - Updated with ALL category support
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import Offer from "../Offers/Offer";
import ProductCard from "./ProductCard";
import "./Home.css";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/home");
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading home data", err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Floating Action Buttons
     ======================= */

  const handleWhatsAppClick = () => {
    const phone = "+9475350101";
    const message = "Hello! I'm interested in your products. Can you help me?";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCallClick = () => {
    window.location.href = "tel:+9475350101";
  };

  const handleLocationClick = () => {
    window.open(
      "https://maps.google.com/?q=Arul+Electrical+Earlalai",
      "_blank"
    );
  };

  /* =======================
     Loading & Empty States
     ======================= */

  if (loading) {
    return (
      <div className="electro-loading">
        <div className="electro-spinner"></div>
        <p>Loading Electro Mart...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="electro-no-data">
        <div className="electro-empty-icon">⚡</div>
        <h2>No Categories Found</h2>
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="electro-container">
        {/* Hero Section */}
        <div className="electro-hero">
          <div className="electro-hero-content">
            <h1 className="electro-hero-title">Welcome to Electro Mart</h1>
            <p className="electro-hero-subtitle">
              Premium Electronics & Home Appliances
            </p>

            <div className="electro-hero-search">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search for products, brands, and more..."
                className="electro-hero-search-input"
              />
              <button className="electro-hero-search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="electro-categories-grid">
          {/* ALL */}
          <button
            className={`electro-category-chip ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => (
            <button
              key={cat.category}
              className={`electro-category-chip ${
                selectedCategory === cat.category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="electro-products-section">
          {(() => {
            const term = productSearch.toLowerCase().trim();

            return categories
              .map((cat) => {
                if (
                  selectedCategory !== "all" &&
                  cat.category !== selectedCategory
                ) {
                  return null;
                }

                const products = (cat.products || []).filter((p) => {
                  const name = (
                    p.name ||
                    p.product_name ||
                    p.title ||
                    ""
                  )
                    .toString()
                    .toLowerCase();
                  return !term || name.includes(term);
                });

                return products.length > 0 ? (
                  <div key={cat.category} className="electro-category-section">
                    <div className="electro-category-header">
                      <h2 className="electro-category-title">
                        {cat.category}
                      </h2>
                      <span className="electro-category-count">
                        {products.length} products
                      </span>
                    </div>

                    <div className="electro-products-grid">
                      {products.map((product) => (
                        <ProductCard
                          key={product._id || product.id}
                          product={product}
                          category={cat.category}
                        />
                      ))}
                    </div>
                  </div>
                ) : null;
              })
              .filter(Boolean);
          })()}
        </div>
      </div>

      {/* Floating Contact Buttons */}
      <div className="electro-floating-contact">
        <button
          className="electro-contact-fab whatsapp"
          onClick={handleWhatsAppClick}
          title="WhatsApp"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.71.46 3.31 1.24 4.71L2 22l5.29-1.24C8.69 21.54 10.29 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        </button>

        <button
          className="electro-contact-fab call"
          onClick={handleCallClick}
          title="Call Now"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.6 0-.8.2l-2.2 2.2c-2.8-1.5-5.2-3.9-6.7-6.7l2.2-2.2c.2-.2.3-.5.2-.8-.4-1.1-.6-2.4-.6-3.6C8.5 3.5 8 3 7.5 3H4c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1z" />
          </svg>
        </button>

        <button
          className="electro-contact-fab location"
          onClick={handleLocationClick}
          title="Location"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
        </button>
      </div>

      <Footer />
    </>
  );
};

export default Home;
