import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import ProductCard from "./ProductCard";
import ContactButtons from "../Shared/ContactButtons";

const Product = () => {
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

  

  const svgWave = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,50 C150,150 350,0 500,50 S850,150 1000,50 V100 H0 Z" fill="white"/></svg>';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium">Loading Electro Mart...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen text-center p-8 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white">
        <div className="text-5xl mb-4 opacity-70">⚡</div>
        <h2 className="text-2xl font-bold mb-2">No Categories Found</h2>
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white p-8 rounded-b-3xl mb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 bg-bottom bg-contain bg-no-repeat"
            style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgWave)}")` }}
          ></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              Welcome to Electro Mart
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Premium Electronics & Home Appliances
            </p>

            <div className="flex max-w-2xl mx-auto bg-white/15 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search for products, brands, and more..."
                className="flex-1 px-6 py-3 bg-transparent border-none text-white placeholder-white/70 focus:outline-none"
              />
              <button className="bg-white text-purple-600 w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
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
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {/* ALL */}
          <button
            className={`px-5 py-2 rounded-full border-2 font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-gradient-to-br from-purple-600 to-blue-500 text-white border-transparent shadow-lg shadow-purple-300"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-500"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => (
            <button
              key={cat.category}
              className={`px-5 py-2 rounded-full border-2 font-semibold transition-all ${
                selectedCategory === cat.category
                  ? "bg-gradient-to-br from-purple-600 to-blue-500 text-white border-transparent shadow-lg shadow-purple-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-500"
              }`}
              onClick={() => setSelectedCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="space-y-10 mb-16">
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
                  <div key={cat.category} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {cat.category}
                      </h2>
                      <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 text-sm font-medium">
                        {products.length} products
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

      <ContactButtons />
      <Footer />
    </div>
  );
};

export default Product;