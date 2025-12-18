import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  Globe, 
  Clock, 
  Shield, 
  TrendingUp, 
  Heart, 
  Target,
  ChevronRight,
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Package,
  Truck,
  ShoppingBag,
  Tag,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import Header from '../Layouts/Header';
import Footer from '../Layouts/Footer';
import ContactButtons from '../Shared/ContactButtons';
import { Link } from 'react-router-dom';

const About = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [animatedStats, setAnimatedStats] = useState({
    years: 0,
    products: 0,
    countries: 0,
    customers: 0
  });

  const milestones = [
    { year: '2015', title: 'Founded', description: 'Started as a small electronics shop in Colombo' },
    { year: '2017', title: 'Online Expansion', description: 'Launched e-commerce website and online store' },
    { year: '2019', title: 'Global Shipping', description: 'Started international parcel services' },
    { year: '2021', title: 'Warehouse Expansion', description: 'Opened new 10,000 sq ft warehouse' },
    { year: '2023', title: 'Mobile App Launch', description: 'Released mobile app for better shopping experience' },
    { year: '2024', title: 'Regional Expansion', description: 'Expanded services to 50+ countries worldwide' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Quality First',
      description: 'We never compromise on product quality and customer satisfaction',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Users,
      title: 'Customer Centric',
      description: 'Our customers are at the heart of everything we do',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Constantly evolving to bring you the latest technology',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Making international shipping accessible and affordable',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: Heart,
      title: 'Integrity',
      description: 'Honest business practices and transparent pricing',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Striving for excellence in service and support',
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  const teamMembers = [
    {
      name: 'Arul Kumar',
      role: 'Founder & CEO',
      department: 'Leadership',
      image: '👨‍💼',
      bio: '20+ years in electronics industry. Passionate about technology and customer satisfaction.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Priya Fernando',
      role: 'Operations Director',
      department: 'Operations',
      image: '👩‍💼',
      bio: 'Expert in supply chain management and international logistics.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'David Silva',
      role: 'Sales Manager',
      department: 'Sales',
      image: '👨‍💼',
      bio: 'Leading our sales team with 15 years of experience in retail electronics.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Maya Perera',
      role: 'Shipping Coordinator',
      department: 'Logistics',
      image: '👩‍✈️',
      bio: 'Specializes in international shipping and customs clearance.',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const achievements = [
    { icon: Trophy, title: 'Best Electronics Retailer 2023', count: '1st' },
    { icon: Star, title: 'Customer Satisfaction', count: '98%' },
    { icon: Award, title: 'Quality Excellence Award', count: '2022' },
    { icon: TrendingUp, title: 'Growth Rate', count: '45%' }
  ];

  const services = [
    {
      icon: ShoppingBag,
      title: 'Electronics Retail',
      description: 'Wide range of premium electronics and home appliances',
      link: '/products'
    },
    {
      icon: Truck,
      title: 'Global Parcel Service',
      description: 'Fast and reliable shipping to 50+ countries',
      link: '/parcel'
    },
    {
      icon: Tag,
      title: 'Special Offers',
      description: 'Exclusive deals and bundle discounts',
      link: '/offers'
    },
    {
      icon: Package,
      title: 'Bulk Orders',
      description: 'Wholesale pricing for businesses and organizations',
      link: '/products'
    }
  ];

  useEffect(() => {
    // Animate stats counter
    const statsInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        years: Math.min(prev.years + 1, 10),
        products: Math.min(prev.products + 50, 1500),
        countries: Math.min(prev.countries + 1, 50),
        customers: Math.min(prev.customers + 100, 15000)
      }));
    }, 50);

    return () => clearInterval(statsInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6 animate-fadeIn">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-semibold">Since 2015</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-slideUp">
              Our <span className="text-blue-600">Story</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fadeIn animation-delay-200 max-w-2xl mx-auto">
              From a small electronics shop to a global e-commerce platform, we're passionate about bringing the best technology to your doorstep.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 animate-slideUp animation-delay-400">
              <button
                onClick={() => document.getElementById('mission').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Our Mission
              </button>
              <button
                onClick={() => document.getElementById('team').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-3 rounded-xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Meet Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Clock, 
                value: animatedStats.years, 
                label: 'Years of Excellence',
                suffix: '+',
                color: 'from-blue-400 to-cyan-400'
              },
              { 
                icon: ShoppingBag, 
                value: animatedStats.products, 
                label: 'Products Available',
                suffix: '+',
                color: 'from-green-400 to-emerald-400'
              },
              { 
                icon: Globe, 
                value: animatedStats.countries, 
                label: 'Countries Served',
                suffix: '+',
                color: 'from-orange-400 to-red-400'
              },
              { 
                icon: Users, 
                value: animatedStats.customers, 
                label: 'Happy Customers',
                suffix: '+',
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

      {/* Our Story & Mission */}
      <section className="py-16" id="mission">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['story', 'mission', 'vision'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'story' ? 'Our Story' : 
                 tab === 'mission' ? 'Our Mission' : 'Our Vision'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'story' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
                <p className="text-lg text-gray-600">
                  Founded in 2015 by Arul Kumar, Arul Electronic started as a small neighborhood electronics shop in Colombo. 
                  What began as a passion project quickly grew into a trusted name in electronics retail.
                </p>
                <p className="text-lg text-gray-600">
                  In 2017, we recognized the need for online accessibility and launched our e-commerce platform, 
                  allowing customers across Sri Lanka to access premium electronics conveniently.
                </p>
                <p className="text-lg text-gray-600">
                  Seeing the demand from Sri Lankans living abroad, we expanded into international shipping in 2019, 
                  developing our parcel service that now reaches over 50 countries worldwide.
                </p>
                <p className="text-lg text-gray-600">
                  Today, we're proud to be a comprehensive platform offering electronics retail, global shipping, 
                  and exclusive deals - all with the same commitment to quality and service that started our journey.
                </p>
              </div>
            )}

            {activeTab === 'mission' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600">
                  To make premium electronics accessible to everyone, everywhere - combining cutting-edge technology 
                  with exceptional service and global reach.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {[
                    'Provide authentic, high-quality electronics with warranty protection',
                    'Make international shipping simple, affordable, and reliable',
                    'Offer competitive pricing through direct manufacturer relationships',
                    'Deliver exceptional customer service and technical support',
                    'Innovate continuously to improve the shopping experience'
                  ].map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600">
                  To become the leading global platform for electronics shopping and shipping from Sri Lanka, 
                  recognized for innovation, reliability, and customer satisfaction.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">By 2030, We Aim To:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Serve customers in 100+ countries worldwide</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Expand our product range to 10,000+ items</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Launch innovative mobile-first shopping experiences</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Implement sustainable packaging and eco-friendly practices</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Develop AI-powered shopping assistance</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Milestones</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>
              
              <div className="space-y-8 md:space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col md:flex-row items-center gap-6 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:pl-8'}`}>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="text-sm font-semibold text-blue-600 mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Year Marker */}
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {milestone.year}
                      </div>
                    </div>
                    
                    {/* Empty space for opposite side */}
                    <div className="flex-1 hidden md:block"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Core Values</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from selecting products to serving customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`inline-flex p-3 rounded-xl ${value.bgColor} ${value.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We <span className="text-blue-600">Offer</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your electronics and shipping needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gray-50" id="team">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-blue-600">Team</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to delivering excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.image}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-blue-600 font-semibold mb-2">{member.role}</div>
                <div className="text-gray-500 text-sm mb-4">{member.department}</div>
                
                <p className="text-gray-600 text-sm mb-6">{member.bio}</p>
                
                <div className="flex justify-center gap-3">
                  <a 
                    href={member.social.linkedin}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href={member.social.twitter}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Achievements</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recognition for our commitment to excellence and customer satisfaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center border border-blue-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                  <achievement.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{achievement.count}</div>
                <div className="text-gray-700 font-medium">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Responsibility */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Community & <span className="text-green-600">Sustainability</span>
              </h2>
              <p className="text-gray-600">
                We believe in giving back and operating responsibly
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community Initiatives</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Digital literacy programs for schools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">E-waste recycling partnerships</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Supporting local electronics repair workshops</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Tech donations to educational institutions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Environmental Commitment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Eco-friendly packaging materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Carbon offset programs for shipping</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Energy-efficient warehouse operations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Paperless documentation and billing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Experience Excellence?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Join thousands of satisfied customers who trust us for their electronics and shipping needs
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                >
                  Shop Electronics
                </Link>
                
                <Link
                  to="/contact"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
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
        
        .animate-blob {
          animation: blob 7s infinite;
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
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default About;