import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  User,
  Building,
  Navigation
} from 'lucide-react';
import Header from '../Layouts/Header';
import Footer from '../Layouts/Footer';
import ContactButtons from '../Shared/ContactButtons';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    serviceType: 'general'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const serviceTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'products', label: 'Product Inquiry' },
    { value: 'parcel', label: 'Parcel Service' },
    { value: 'offers', label: 'Special Offers' },
    { value: 'support', label: 'Technical Support' },
    { value: 'business', label: 'Business Partnership' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Using EmailJS for form submission
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        from_phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
        service_type: formData.serviceType,
        to_name: 'Arul Electronic Team'
      };

      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        serviceType: 'general'
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = `Hello! I'm interested in your services.`;
    const url = `https://wa.me/94755350101?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Our Location',
      details: ['123 Galle Road', 'Colombo 03', 'Sri Lanka'],
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      link: 'https://maps.google.com/?q=Colombo+Sri+Lanka',
      action: 'Open Map'
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: ['+94 75 535 0101', '+94 11 234 5678'],
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      link: 'tel:+94755350101',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Address',
      details: ['info@arulelectronic.com', 'support@arulelectronic.com'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      link: 'mailto:info@arulelectronic.com',
      action: 'Send Email'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 9:00 AM - 4:00 PM', 'Sun: 10:00 AM - 2:00 PM'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/arulelectronic', color: 'text-blue-600 hover:bg-blue-50' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/arulelectronic', color: 'text-pink-600 hover:bg-pink-50' },
    { icon: MessageSquare, label: 'WhatsApp', url: 'https://wa.me/94755350101', color: 'text-green-600 hover:bg-green-50' },
    { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/arulelectronic', color: 'text-sky-500 hover:bg-sky-50' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/arulelectronic', color: 'text-blue-700 hover:bg-blue-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-5"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 animate-fadeIn">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fadeIn animation-delay-200">
              We're here to help with all your electronics, shipping, and business needs
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full animate-fadeIn animation-delay-400">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-semibold">24/7 Support Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-cardIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex p-3 rounded-xl ${info.bgColor} ${info.color} mb-4`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-600">{detail}</p>
                  ))}
                </div>
                {info.link && (
                  <a
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold mt-4 group"
                  >
                    <span>{info.action}</span>
                    <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                    <p className="text-gray-600">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-800">Message Sent Successfully!</h4>
                        <p className="text-green-700 text-sm">Thank you for contacting us. We'll respond shortly.</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800">Error Sending Message</h4>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>Full Name *</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>Email Address *</span>
                        </div>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>Phone Number</span>
                        </div>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="+94 77 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>Company / Organization</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Your company (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {serviceTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                            formData.serviceType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="serviceType"
                            value={type.value}
                            checked={formData.serviceType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`font-medium ${
                              formData.serviceType === type.value ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {type.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar - Social & Info */}
            <div className="space-y-6">
              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h3>
                <p className="text-gray-600 mb-6">Follow us for updates, offers, and announcements</p>
                
                <div className="space-y-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-current transition-all duration-300 group ${social.color}`}
                    >
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-current/10 transition-colors duration-300">
                        <social.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{social.label}</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Contact Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Need Immediate Assistance?</h3>
                <p className="mb-6 opacity-90">Click below to chat with us on WhatsApp</p>
                
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Chat on WhatsApp</span>
                </button>
                
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-sm opacity-80">Response time: Usually within minutes</div>
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Answers</h3>
                <div className="space-y-4">
                  {[
                    {
                      q: "What's your shipping time?",
                      a: "Local: 1-3 days • International: 5-15 days"
                    },
                    {
                      q: "Do you offer warranty?",
                      a: "Yes, all electronics come with warranty"
                    },
                    {
                      q: "Can I track my parcel?",
                      a: "Yes, real-time tracking is provided"
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{faq.q}</h4>
                      <p className="text-gray-600 text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Visit Our Store</h2>
            <p className="text-gray-600">Come see our products in person</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="h-64 md:h-96 bg-gradient-to-br from-gray-200 to-gray-300 relative">
              {/* Mock Map - Replace with actual Google Maps embed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Colombo, Sri Lanka</h3>
                  <p className="text-gray-600">123 Galle Road, Colombo 03</p>
                  <a
                    href="https://maps.google.com/?q=Colombo+Sri+Lanka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold mt-4 group"
                  >
                    <span>Open in Google Maps</span>
                    <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
              
              {/* Map markers */}
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full border-4 border-blue-500 shadow-lg animate-pulse-slow"></div>
              <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-white rounded-full border-4 border-green-500 shadow-lg animate-pulse-slow animation-delay-1000"></div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Store Hours</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex justify-between">
                      <span>Weekdays</span>
                      <span>9 AM - 6 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Saturdays</span>
                      <span>9 AM - 4 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sundays</span>
                      <span>10 AM - 2 PM</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Parking Available</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Free parking for customers</li>
                    <li>• 10+ parking spots</li>
                    <li>• Wheelchair accessible</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Store Facilities</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Demo units available</li>
                    <li>• Free WiFi</li>
                    <li>• Coffee lounge</li>
                    <li>• Kids play area</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Contact */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Our Team</h2>
            <p className="text-gray-600">Get specialized assistance from our experts</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "John Silva",
                role: "Sales Manager",
                department: "Electronics Sales",
                email: "sales@arulelectronic.com",
                phone: "+94 75 123 4567",
                image: "👨‍💼"
              },
              {
                name: "Sarah Perera",
                role: "Shipping Coordinator",
                department: "Parcel Services",
                email: "shipping@arulelectronic.com",
                phone: "+94 75 234 5678",
                image: "👩‍✈️"
              },
              {
                name: "David Fernando",
                role: "Technical Support",
                department: "Customer Service",
                email: "support@arulelectronic.com",
                phone: "+94 75 345 6789",
                image: "👨‍🔧"
              }
            ].map((person, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl mx-auto mb-4">
                  {person.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
                <div className="text-blue-600 font-semibold mb-2">{person.role}</div>
                <div className="text-gray-600 text-sm mb-4">{person.department}</div>
                
                <div className="space-y-3">
                  <a 
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors justify-center"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{person.email}</span>
                  </a>
                  <a 
                    href={`tel:${person.phone}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors justify-center"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{person.phone}</span>
                  </a>
                </div>
                
                <button
                  onClick={() => window.open(`mailto:${person.email}`, '_blank')}
                  className="mt-6 w-full py-2 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Contact {person.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactButtons />
      <Footer />

      {/* Animation Styles */}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-cardIn {
          animation: cardIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default Contact;