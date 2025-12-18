import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Tag, 
  Truck, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Shield, 
  Clock, 
  Zap,
  Award,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import ContactButtons from '../Shared/ContactButtons';
import Footer from '../Layouts/Footer';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [parcelRates, setParcelRates] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    offers: true,
    parcels: true
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOffers: 0,
    countriesServed: 0,
    happyCustomers: 0
  });

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // Stats animation
  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    offers: 0,
    countries: 0,
    customers: 0
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resolveImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (typeof img !== 'string') return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${apiUrl}${img}`;
    return `${apiUrl}/uploads/${img}`;
  };

  const heroSlides = [
    {
      title: "Premium Electronics",
      subtitle: "Best Quality Gadgets & Home Appliances",
      description: "Discover the latest electronics with unbeatable prices and warranty",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "from-blue-600 to-purple-600",
      link: "/products"
    },
    {
      title: "Global Parcel Service",
      subtitle: "Ship Worldwide from Sri Lanka",
      description: "Fast, reliable air & sea freight services to all destinations",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "from-green-600 to-cyan-600",
      link: "/parcel"
    },
    {
      title: "Exclusive Offers",
      subtitle: "Bundle Deals & Discounts",
      description: "Save big with our special product bundles and limited-time offers",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      color: "from-orange-500 to-red-500",
      link: "/offers"
    }
  ];

  useEffect(() => {
    // Fetch initial data
    fetchData();
    
    // Auto-rotate hero carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    // Animate stats counter
    const statsInterval = setInterval(animateStats, 50);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      const productsRes = await axios.get('http://localhost:5000/api/home');
      const products = productsRes.data || [];
      const featured = products.flatMap(cat => cat.products || []).slice(0, 6);
      setFeaturedProducts(featured);
      setLoading(prev => ({ ...prev, products: false }));

      // Fetch offers
      const offersRes = await axios.get('http://localhost:5000/api/offers');
      const offers = offersRes.data || [];
      setFeaturedOffers(offers.slice(0, 3));
      setLoading(prev => ({ ...prev, offers: false }));

      // Fetch parcel rates
      const parcelRes = await axios.get('http://localhost:5000/api/delivery');
      const rates = parcelRes.data || [];
      setParcelRates(rates.slice(0, 4));
      setLoading(prev => ({ ...prev, parcels: false }));

      // Set initial stats
      setStats({
        totalProducts: products.flatMap(cat => cat.products || []).length,
        totalOffers: offers.length,
        countriesServed: new Set(rates.map(r => r.country_name)).size,
        happyCustomers: 1500 // This could come from API
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set fallback data for demo
      setFeaturedProducts(getFallbackProducts());
      setFeaturedOffers(getFallbackOffers());
      setParcelRates(getFallbackRates());
      
      setStats({
        totalProducts: 150,
        totalOffers: 25,
        countriesServed: 45,
        happyCustomers: 1500
      });
      
      setLoading({ products: false, offers: false, parcels: false });
    }
  };

  const animateStats = () => {
    setAnimatedStats(prev => ({
      products: Math.min(prev.products + 10, stats.totalProducts),
      offers: Math.min(prev.offers + 2, stats.totalOffers),
      countries: Math.min(prev.countries + 1, stats.countriesServed),
      customers: Math.min(prev.customers + 20, stats.happyCustomers)
    }));
  };

  // Fallback data functions
  const getFallbackProducts = () => [
    { id: 1, name: "Smartphone X1", price: 29999, category: "Mobile", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop" },
    { id: 2, name: "Wireless Headphones", price: 5999, category: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-400&h=400&fit=crop" },
    { id: 3, name: "4K Smart TV", price: 45999, category: "TV", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop" },
    { id: 4, name: "Laptop Pro", price: 89999, category: "Computer", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
    { id: 5, name: "Smart Watch", price: 12999, category: "Wearable", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
    { id: 6, name: "Gaming Console", price: 34999, category: "Gaming", image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop" }
  ];

  const getFallbackOffers = () => [
    { id: 1, description: "Home Theater Bundle", discount_percentage: 25, products: Array(3).fill({}) },
    { id: 2, description: "Office Setup Package", discount_percentage: 30, products: Array(5).fill({}) },
    { id: 3, description: "Kitchen Appliances Set", discount_percentage: 20, products: Array(4).fill({}) }
  ];

  const getFallbackRates = () => [
    { id: 1, country_name: "USA", delivery_through: "plan", normal_price: 15000, delivery_min_days: 7 },
    { id: 2, country_name: "UK", delivery_through: "plan", normal_price: 12000, delivery_min_days: 8 },
    { id: 3, country_name: "Australia", delivery_through: "ship", normal_price: 20000, delivery_min_days: 30 },
    { id: 4, country_name: "India", delivery_through: "plan", normal_price: 5000, delivery_min_days: 3 }
  ];

  const getCountryFlag = (countryName) => {
    if (!countryName) return '🌍';
    const flagMap = {
      'usa': '🇺🇸',
      'uk': '🇬🇧',
      'australia': '🇦🇺',
      'canada': '🇨🇦',
      'india': '🇮🇳',
      'japan': '🇯🇵',
      'china': '🇨🇳',
      'germany': '🇩🇪',
      'france': '🇫🇷',
      'sri lanka': '🇱🇰',
    };
    
    const lowerName = countryName.toLowerCase();
    for (const [key, flag] of Object.entries(flagMap)) {
      if (lowerName.includes(key)) return flag;
    }
    
    return '🌍';
  };

  const getDeliveryIcon = (method) => {
    if (!method) return '🚚';
    const methodLower = method.toLowerCase();
    if (methodLower.includes('plan') || methodLower.includes('flight')) return '✈️';
    if (methodLower.includes('ship') || methodLower.includes('sea')) return '🚢';
    if (methodLower.includes('express')) return '⚡';
    return '🚚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        {/* Carousel */}
        <div 
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <div className="relative h-[70vh] min-h-[600px] md:h-[85vh]">
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-90`}></div>
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>
                
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-2xl">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-fadeIn">
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-white text-sm font-medium">Welcome to Arul Electronic</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-slideUp">
                          {slide.title}
                        </h1>
                        
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 mb-6 animate-slideUp animation-delay-200">
                          {slide.subtitle}
                        </h2>
                        
                        <p className="text-lg text-white/80 mb-8 max-w-xl animate-fadeIn animation-delay-400">
                          {slide.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 animate-slideUp animation-delay-600">
                          <Link
                            to={slide.link}
                            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
                          >
                            <span>Explore Now</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          
                          <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
                          >
                            <span>Contact Us</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce z-10 hidden md:block">
          <ChevronRight className="w-6 h-6 text-white transform rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                icon: ShoppingBag, 
                value: stats.totalProducts, 
                label: 'Real Products',
                suffix: '+',
                color: 'from-blue-400 to-cyan-400'
              },
              { 
                icon: Tag, 
                value: stats.totalOffers, 
                label: 'Active Offers',
                suffix: '+',
                color: 'from-green-400 to-emerald-400'
              },
              { 
                icon: Globe, 
                value: stats.countriesServed, 
                label: 'Countries Served',
                suffix: '+',
                color: 'from-orange-400 to-red-400'
              },
              { 
                icon: Users, 
                value: '1000+', 
                label: 'Happy Customers', 
                suffix: '',
                color: 'from-purple-400 to-pink-400'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/80 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">Arul Electronic</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide premium electronics, global shipping, and exclusive offers with unmatched service quality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "All products come with warranty and quality assurance",
                color: "text-blue-600 bg-blue-100"
              },
              {
                icon: Truck,
                title: "Global Shipping",
                description: "Fast parcel service to destinations worldwide",
                color: "text-green-600 bg-green-100"
              },
              {
                icon: Tag,
                title: "Best Prices",
                description: "Competitive pricing with regular offers and discounts",
                color: "text-orange-600 bg-orange-100"
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Round-the-clock customer support via WhatsApp & Phone",
                color: "text-purple-600 bg-purple-100"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured <span className="text-blue-600">Products</span>
              </h2>
              <p className="text-gray-600">Top quality electronics at best prices</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold mt-4 md:mt-0 group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading.products ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/products"
                  className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={resolveImageUrl(product.image || product.product_image)} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-2">
                    {product.name}
                  </h3>
                  <div className="font-bold text-gray-900">
                    Rs. {product.price?.toLocaleString() || '0'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Parcel Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Global <span className="text-green-600">Parcel Services</span>
              </h2>
              <p className="text-gray-600">Ship from Sri Lanka to worldwide destinations</p>
            </div>
            <Link
              to="/parcel"
              className="inline-flex items-center gap-2 text-green-600 font-semibold mt-4 md:mt-0 group"
            >
              <span>View All Rates</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading.parcels ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {parcelRates.map((rate) => (
                <div 
                  key={rate.id}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{getCountryFlag(rate.country_name)}</div>
                    <div className="text-2xl">{getDeliveryIcon(rate.delivery_through)}</div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {rate.country_name || 'International'}
                  </h3>
                  
                  <div className="text-gray-600 text-sm mb-4">
                    Via {rate.delivery_through === 'plan' ? 'Air Freight' : 
                         rate.delivery_through === 'ship' ? 'Sea Cargo' : 'Standard'}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        LKR {rate.normal_price?.toLocaleString() || '0'}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {rate.delivery_min_days || 5}-{rate.delivery_max_days || 10} days
                      </div>
                    </div>
                    
                    <Link
                      to="/parcel"
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Real-time tracking • Insurance available • Door-to-door delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-bold">LIMITED TIME</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Special <span className="text-red-600">Offers</span>
              </h2>
              <p className="text-gray-600">Bundle deals and exclusive discounts</p>
            </div>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 text-red-600 font-semibold mt-4 md:mt-0 group"
            >
              <span>View All Offers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading.offers ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredOffers.map((offer, index) => (
                <div 
                  key={offer.id || index}
                  className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    {offer.discount_percentage || 20}% OFF
                  </div>
                  
                  {/* Offer Image/Products Preview */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden relative">
                    {offer.products?.slice(0, 4).map((p, idx) => {
                      const imgSrc = resolveImageUrl(p.image || p.item_image || p.product_image || p.image_path || '');
                      return (
                        <div 
                          key={idx}
                          className="absolute w-16 h-16 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                          style={{
                            top: `${20 + idx * 20}%`,
                            left: `${20 + idx * 20}%`,
                            zIndex: 4 - idx
                          }}
                        >
                          <img src={imgSrc} alt={p.item_name || p.name || 'Product'} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {offer.description || 'Special Bundle Offer'}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Includes {offer.products?.length || 3} premium products
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        Bundle Deal
                      </div>
                      <div className="text-gray-500 text-sm">
                        Save up to {offer.discount_percentage || 20}%
                      </div>
                    </div>
                    
                    <Link
                      to="/offers"
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Deal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Shop premium electronics, ship worldwide, or explore exclusive offers - all in one place
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Shop Now</span>
                </Link>
                
                <Link
                  to="/parcel"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  <span>Ship Parcel</span>
                </Link>
              </div>
              
              <p className="text-blue-100 text-sm mt-8">
                Need help? Contact us on WhatsApp: +94 75 535 0101
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by <span className="text-blue-600">Customers</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our satisfied customers have to say about our products and services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "John D.",
                role: "Electronics Buyer",
                content: "Best prices for smartphones and gadgets. Fast delivery and excellent customer support!",
                rating: 5
              },
              {
                name: "Sarah M.",
                role: "International Shipper",
                content: "Reliable parcel service to Australia. Tracking was accurate and package arrived safely.",
                rating: 5
              },
              {
                name: "David L.",
                role: "Business Owner",
                content: "Bulk purchase of office electronics saved us 30%. Highly recommended for businesses.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactButtons />
      <Footer />

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  );
};

export default Home;