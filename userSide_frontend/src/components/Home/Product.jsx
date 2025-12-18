import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../Layouts/Header";
import Footer from "../Layouts/Footer";
import ProductCard from "./ProductCard";
import ContactButtons from "../Shared/ContactButtons";

const Product = () => {
  const [categories, setCategories] = useState([]);
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isShuffling, setIsShuffling] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Refs for animations
  const shuffleInterval = useRef(null);
  const searchRef = useRef(null);
  const categoryRefs = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchHomeData();
    
    // Start shuffle interval (every 2 minutes)
    shuffleInterval.current = setInterval(() => {
      if (isMounted.current) {
        handleShuffleAll();
      }
    }, 1200000); // 2 minutes

    return () => {
      isMounted.current = false;
      if (shuffleInterval.current) {
        clearInterval(shuffleInterval.current);
      }
    };
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/home");
      const fetchedCategories = res.data || [];
      setCategories(fetchedCategories);
      // Initial shuffle of categories and products within
      const shuffledCategories = shuffleArray([...fetchedCategories]);
      const categoriesWithShuffledProducts = shuffledCategories.map(cat => ({
        ...cat,
        products: shuffleArray([...cat.products || []])
      }));
      setDisplayedCategories(categoriesWithShuffledProducts);
    } catch (err) {
      console.error("Error loading home data", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Shuffle categories and products within
  const handleShuffleAll = () => {
    if (displayedCategories.length === 0) {
      // If no displayed categories, fetch data first
      fetchHomeData();
      return;
    }

    setIsShuffling(true);
    
    // Add shuffle animation to categories
    categoryRefs.current.forEach(ref => {
      if (ref) {
        ref.style.transform = 'translateY(10px)';
        ref.style.opacity = '0.7';
      }
    });

    setTimeout(() => {
      // Use current displayedCategories from state
      const currentDisplayedCategories = [...displayedCategories];
      
      // Shuffle categories
      const shuffledCategories = shuffleArray(currentDisplayedCategories);
      
      // Shuffle products within each category
      const categoriesWithShuffledProducts = shuffledCategories.map(cat => ({
        ...cat,
        products: shuffleArray([...cat.products || []])
      }));
      
      setDisplayedCategories(categoriesWithShuffledProducts);
      
      // Reset animation states
      setTimeout(() => {
        categoryRefs.current.forEach(ref => {
          if (ref) {
            ref.style.transform = 'translateY(0)';
            ref.style.opacity = '1';
          }
        });
        setIsShuffling(false);
      }, 300);
    }, 500);
  };

  // Shuffle only products within current category
  const handleShuffleProducts = (category) => {
    setDisplayedCategories(prev => 
      prev.map(cat => {
        if (cat.category === category) {
          return {
            ...cat,
            products: shuffleArray([...cat.products || []])
          };
        }
        return cat;
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-cyan-300 animate-spin animation-delay-150"></div>
        </div>
        <p className="mt-4 text-lg font-medium animate-pulse">Loading Electro Mart...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen text-center p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="text-5xl mb-4 animate-bounce">⚡</div>
        <h2 className="text-2xl font-bold mb-2 animate-fadeIn">No Categories Found</h2>
        <p className="animate-fadeIn animation-delay-200">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      

      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white p-4 md:p-6 rounded-2xl mb-6 md:mb-8 overflow-hidden transform-gpu hover:scale-[1.005] transition-all duration-500">
  {/* Animated gradient background */}
  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
  
  {/* Circuit pattern background */}
  <div className="absolute inset-0 opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuitPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30,0 L30,60 M0,30 L60,30 M20,20 L40,40 M40,20 L20,40" 
                stroke="white" strokeWidth="1" fill="none"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuitPattern)"/>
    </svg>
  </div>
  
  {/* Glowing orb effects */}
  <div className="absolute -top-10 -left-10 w-20 h-20 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
  
  {/* Floating electronics icons - Reduced for mobile */}
  <div className="absolute inset-0">
    {['📱', '💻', '🎧'].map((icon, i) => (
      <div 
        key={i}
        className="absolute text-lg md:text-2xl animate-float-3d"
        style={{
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          animationDelay: `${i * 0.5}s`,
          opacity: 0.1,
          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
        }}
      >
        {icon}
      </div>
    ))}
  </div>

  <div className="relative z-10">
    {/* Mobile: Stacked layout, Desktop: Side by side */}
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      {/* Left Side: Enhanced Title - Full width on mobile */}
      <div className="flex items-center gap-3 mb-4 md:mb-0 md:gap-4 w-full md:w-auto">
        {/* Animated icon - Always visible */}
        <div className="relative">
         
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 border-2 border-cyan-300/50 rounded-xl animate-ping-slow"></div>
        </div>
        
        <div className="relative flex-1 md:flex-none">
          {/* Glow effect behind text */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl rounded-lg -z-10"></div>
          
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent animate-gradient-x animate-fadeInUp">
            Welcome to Electro Mart
          </h1>
          <p className="text-xs md:text-sm opacity-90 mt-1 animate-fadeInUp animation-delay-300">
            Premium Electronics <span className="text-cyan-200 font-medium">&</span> Home Appliances
          </p>
          
          {/* Underline effect - Hidden on mobile */}
          <div className="hidden md:block h-0.5 w-16 md:w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-1 animate-widthGrow"></div>
        </div>
      </div>

      {/* Right Side: Enhanced Search Bar - Full width on mobile */}
      <div className="w-full md:flex-1 md:max-w-xl md:ml-6 animate-slideInRight">
        <div 
          className={`relative group backdrop-blur-xl rounded-full border-2 transition-all duration-500 ${
            searchFocused 
              ? 'bg-white/40 border-white/60 shadow-2xl shadow-cyan-500/30 md:transform md:scale-105' 
              : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 hover:shadow-xl hover:shadow-cyan-500/20'
          }`}
          onClick={() => searchRef.current?.focus()}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
          
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 group-hover:text-white transition-colors duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-softPulse">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search products, brands..."
            className="w-full pl-10 pr-10 py-3 bg-transparent border-none text-white placeholder-white/70 focus:outline-none rounded-full text-sm md:text-base tracking-wide"
          />
          
          {/* Search button - Mobile optimized */}
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-110 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 group/btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="group-hover/btn:scale-110 transition-transform duration-300">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </div>
        
        {/* Quick search tips - Mobile optimized */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 ml-2">
          <span className="text-xs text-white/60">Try:</span>
          {['Phones', 'Light', 'Audio', 'TVs'].map((term, i) => (
            <button
              key={i}
              onClick={() => setProductSearch(term)}
              className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white/80 hover:text-white transition-all duration-300 active:scale-95"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Mobile-only: Shuffle button and stats row */}
    <div className="flex items-center justify-between mt-4 md:hidden">
     

      
    </div>
  </div>

  {/* CSS Animations */}
  <style jsx>{`
    @keyframes float-3d {
      0%, 100% { 
        transform: translateY(0px) translateX(0px) rotate(0deg); 
        opacity: 0.1;
      }
      25% { 
        transform: translateY(-10px) translateX(5px) rotate(3deg); 
        opacity: 0.15;
      }
      50% { 
        transform: translateY(-15px) translateX(-3px) rotate(-3deg); 
        opacity: 0.2;
      }
      75% { 
        transform: translateY(-10px) translateX(3px) rotate(2deg); 
        opacity: 0.15;
      }
    }
    
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes widthGrow {
      from { width: 0; }
      to { width: 5rem; }
    }
    
    @keyframes ping-slow {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }
    
    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-3px);
      }
    }
    
    @keyframes softPulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
    
    .animate-float-3d {
      animation: float-3d 6s ease-in-out infinite;
    }
    
    .animate-gradient-x {
      animation: gradient-x 3s ease infinite;
      background-size: 200% auto;
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-slideInRight {
      animation: slideInRight 0.4s ease-out forwards;
    }
    
    .animate-widthGrow {
      animation: widthGrow 0.6s ease-out forwards;
      animation-delay: 0.3s;
    }
    
    .animate-ping-slow {
      animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    .animate-bounce-slow {
      animation: bounce-slow 2s ease-in-out infinite;
    }
    
    .animate-softPulse {
      animation: softPulse 2s ease-in-out infinite;
    }
    
    .animation-delay-100 {
      animation-delay: 100ms;
    }
    
    .animation-delay-300 {
      animation-delay: 300ms;
    }
    
    .animation-delay-1000 {
      animation-delay: 1000ms;
    }
    
    /* Mobile touch optimizations */
    @media (max-width: 768px) {
      input, button {
        -webkit-tap-highlight-color: transparent;
      }
      
      button:active {
        transform: scale(0.95);
      }
    }
  `}</style>
</div>

    

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-blue-600 text-xl md:text-2xl animate-pulse-slow">🏷️</span>
              Browse Categories
            </h2>
            <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {displayedCategories.length} categories
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {/* ALL Category */}
            <button
              className={`px-4 py-2 md:px-5 md:py-2 rounded-full border-2 font-semibold transition-all transform hover:-translate-y-0.5 text-sm md:text-base ${
                selectedCategory === "all"
                  ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-300 scale-105"
                  : "bg-white text-gray-600 border-blue-100 hover:border-blue-400 hover:text-blue-500 hover:shadow-md"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>

            {/* Dynamic Categories */}
            {displayedCategories.map((cat, index) => (
              <div 
                key={cat.category}
                ref={el => categoryRefs.current[index] = el}
                className="relative group"
              >
                <button
                  className={`px-4 py-2 md:px-5 md:py-2 rounded-full border-2 font-semibold transition-all transform hover:-translate-y-0.5 relative z-10 text-sm md:text-base ${
                    selectedCategory === cat.category
                      ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-300 scale-105"
                      : "bg-white text-gray-600 border-blue-100 hover:border-blue-400 hover:text-blue-500 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category}
                </button>
                
                {/* Shuffle products in this category button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShuffleProducts(cat.category);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full text-[10px] md:text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300 z-20 shadow-md hover:shadow-lg"
                  title="Shuffle products in this category"
                >
                  <span>🔄</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`space-y-8 md:space-y-10 mb-16 transition-all duration-500 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
          {(() => {
            const term = productSearch.toLowerCase().trim();

            // Get filtered categories based on selection
            const filteredCategories = displayedCategories.filter(cat => 
              selectedCategory === "all" || cat.category === selectedCategory
            );

            // Check if there are any categories to display
            if (filteredCategories.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 text-blue-400">🔍</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No categories found</h3>
                  <p className="text-gray-500 mb-4">Try a different search or check back later</p>
                  <button
                    onClick={fetchHomeData}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:scale-105 transition-transform"
                  >
                    Refresh Data
                  </button>
                </div>
              );
            }

            return filteredCategories
              .map((cat, catIndex) => {
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

                if (products.length === 0) {
                  return null; // Skip categories with no matching products
                }

                return (
                  <div 
                    key={cat.category} 
                    className="space-y-4 md:space-y-6 animate-cardIn"
                    style={{
                      animationDelay: `${catIndex * 100}ms`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 md:gap-3">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 group">
                          {cat.category}
                        </h2>
                        <button
                          onClick={() => handleShuffleProducts(cat.category)}
                          className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-sm hover:shadow-md"
                          title="Shuffle products"
                        >
                          <span className="text-xs">🔄</span>
                        </button>
                      </div>
                      <span className="bg-gradient-to-br from-blue-100 to-cyan-100 px-3 py-1 md:px-4 md:py-2 rounded-full text-gray-700 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-pulse"></span>
                        {products.length} products
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                      {products.map((product, productIndex) => (
                        <div 
                          key={product._id || product.id}
                          className="animate-cardIn"
                          style={{
                            animationDelay: `${(catIndex * 100) + (productIndex * 50)}ms`
                          }}
                        >
                          <ProductCard
                            product={product}
                            category={cat.category}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
              .filter(Boolean); // Remove null entries
          })()}
        </div>

        {/* Floating Action Button for Shuffle */}
        <button
          onClick={handleShuffleAll}
          className={`fixed bottom-24 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-2xl z-40 transition-all duration-300 ${
            isShuffling 
              ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white animate-pulse' 
              : 'bg-gradient-to-br from-white to-gray-100 text-blue-600 hover:scale-110 hover:shadow-2xl'
          }`}
        >
          <span className={`${isShuffling ? 'animate-spin' : ''}`}>🔄</span>
        </button>
      </div>

      <ContactButtons />
      <Footer />

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
        
        .animate-cardIn {
          animation: cardIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;