import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-t from-gray-900 to-black text-white pt-16 pb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #fff 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                Arul Electronic
              </h2>
              <p className="text-gray-300 mt-2 leading-relaxed">
                Your trusted partner for premium electronics and cutting-edge technology solutions.
              </p>
            </div>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-gray-200 font-medium">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-r-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {[
            {
              title: "Quick Links",
              links: ["Home", "Products", "Categories", "Parcel Service", "About Us"]
            },
            {
              title: "Support",
              links: ["Help Center", "Shipping Info", "Returns & Exchanges", "Size Guide", "Contact Support"]
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Press", "Blog", "Affiliates"]
            }
          ].map((section, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-xl font-semibold text-white pb-3 border-b border-gray-800">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="group flex items-center text-gray-400 hover:text-white transition-all duration-300 hover:pl-2"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Arul Electronic. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Designed with ❤️ for electronics enthusiasts
              </p>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                {[
                  { icon: "📘", label: "Facebook" },
                  { icon: "🐦", label: "Twitter" },
                  { icon: "📷", label: "Instagram" },
                  { icon: "💼", label: "LinkedIn" },
                  { icon: "🎬", label: "YouTube" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg hover:shadow-blue-500/30"
                    title={social.label}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Secure Payments:</span>
              <div className="flex gap-2">
                {['💳', '💵', '🏦', '🔒', '💰'].map((icon, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-sm"
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;