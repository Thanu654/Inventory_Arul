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

  if (loading) {
    return (
      <div className="electro-loading">
        <div className="electro-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="electro-no-data">
        <div className="electro-empty-icon">📱</div>
        <h2>No Categories Found</h2>
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="electro-container">

        {/* Offer Section */}
        <Offer />
        
        {/* Categories and Products */}
        {categories.map((cat) => (
          <div key={cat.category || cat._id} className="electro-category-section">
            <div className="electro-category-header">
              <h2 className="electro-category-title">{cat.category}</h2>
              <a href="#" className="electro-view-all">View All →</a>
            </div>
            
            <div className="electro-products-grid">
              {cat.products.length === 0 ? (
                <div className="electro-empty-category">
                  <p>No products in this category yet</p>
                </div>
              ) : (
                cat.products.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                    category={cat.category}
                  />
                ))
              )}
            </div>
          </div>
        ))}
        
      </div>
      
      <Footer />
    </>
  );
};

export default Home;