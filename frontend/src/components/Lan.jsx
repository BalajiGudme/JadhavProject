
// export default CreativeAgencyPortfolio;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import slide1 from "../assets/images/14.png";
import slide3 from "../assets/images/g20.jpg";
import slide4Image from "../assets/images/h2.jpg";

// DesktopMonitorSlideshow component
const DesktopMonitorSlideshow = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentMonitorIndex, setCurrentMonitorIndex] = useState(0);
  const [lampOn, setLampOn] = useState(true);
  const [apiSlides, setApiSlides] = useState([]);
  const [monitorSlides, setMonitorSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitorLoading, setIsMonitorLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [monitorApiError, setMonitorApiError] = useState(null);
  
  // Remove CRUD states - only keep data display states
  const frameRef = useRef(null);
  const scaleRef = useRef(null);

  // Original slides as fallback
  const fallbackSlides = [slide1, slide1, slide1];
  const monitorFallbackSlides = [slide3, slide4Image, slide1];

  // Fetch slides for small panel from API (slide1)
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        const response = await fetch('http://127.0.0.1:8000/api/slide1/1/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract image1, image2, image3 from the API response
        let slidesArray = [];
        
        if (data && typeof data === 'object') {
          if (data.image1) slidesArray.push(data.image1);
          if (data.image2) slidesArray.push(data.image2);
          if (data.image3) slidesArray.push(data.image3);
          
          if (slidesArray.length > 0) {
            setApiSlides(slidesArray);
          } else {
            setApiError('No images found in API response');
            setApiSlides(fallbackSlides);
          }
        } else {
          setApiError('Invalid API response format');
          setApiSlides(fallbackSlides);
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
        setApiError(`Failed to fetch slides: ${error.message}`);
        setApiSlides(fallbackSlides);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Fetch slides for monitor screen from API (slide2)
  useEffect(() => {
    const fetchMonitorSlides = async () => {
      try {
        setIsMonitorLoading(true);
        setMonitorApiError(null);
        
        const response = await fetch('http://127.0.0.1:8000/api/slide2/1/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract image1, image2, image3 from the API response
        let slidesArray = [];
        
        if (data && typeof data === 'object') {
          if (data.image1) slidesArray.push(data.image1);
          if (data.image2) slidesArray.push(data.image2);
          if (data.image3) slidesArray.push(data.image3);
          
          if (slidesArray.length > 0) {
            setMonitorSlides(slidesArray);
          } else {
            setMonitorApiError('No images found in API response');
            setMonitorSlides(monitorFallbackSlides);
          }
        } else {
          setMonitorApiError('Invalid API response format');
          setMonitorSlides(monitorFallbackSlides);
        }
      } catch (error) {
        console.error('Error fetching monitor slides:', error);
        setMonitorApiError(`Failed to fetch slides: ${error.message}`);
        setMonitorSlides(monitorFallbackSlides);
      } finally {
        setIsMonitorLoading(false);
      }
    };

    fetchMonitorSlides();
  }, []);

  // Small panel slideshow auto-change
  useEffect(() => {
    const slidesToUse = apiSlides.length > 0 ? apiSlides : fallbackSlides;
    
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) =>
        prev === slidesToUse.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [apiSlides]);

  // Monitor screen slideshow auto-change
  useEffect(() => {
    const slidesToUse = monitorSlides.length > 0 ? monitorSlides : monitorFallbackSlides;
    
    const interval = setInterval(() => {
      setCurrentMonitorIndex((prev) =>
        prev === slidesToUse.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [monitorSlides]);

  // Responsive scaling
  useEffect(() => {
    function handleResize() {
      if (!frameRef.current || !scaleRef.current) return;
      const containerWidth = frameRef.current.offsetWidth;
      const scale = containerWidth / 1200;
      scaleRef.current.style.transform = `scale(${scale})`;
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Blinking lamp effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setLampOn((prev) => !prev);
    }, 800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Determine which slides to display
  const displaySlides = apiSlides.length > 0 ? apiSlides : fallbackSlides;
  const displayMonitorSlides = monitorSlides.length > 0 ? monitorSlides : monitorFallbackSlides;

  return (
    <div className="relative w-full bg-gray-50">
    {/* Main Desktop Frame */}
    <div
      ref={frameRef}
      className="relative w-full"
      style={{ 
        aspectRatio: "1200 / 528",
        maxHeight: "100vh" // Optional: limits maximum height
      }}
    >

         <div
        ref={scaleRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: "1200px", height: "528px" }}
      >
           
    <img
      src={slide4Image}
      alt="Background"
      className="w-full h-full object-cover"
    />


          {/* Monitor Screen */}
          <div
            className="absolute overflow-hidden"
            style={{
              top: "36.5%",
              left: "54.3%",
              width: "26.4%",
              height: "38.5%",
              borderRadius: "2px",
              transform: "perspective(700px) rotateY(-17deg) rotateX(8deg)",
              boxShadow: "inset 0 0 100px rgba(10,10,10,10)",
              clipPath: "polygon(0.1% 3%, 97% 1%, 98% 98%, 3.7% 94%)",
            }}
          >
            {displayMonitorSlides.map((slide, i) => (
              <img
                key={i}
                src={slide}
                alt={`Slide ${i}`}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
                  currentMonitorIndex === i ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            ))}
          </div>

          {/* Blinking Lamp */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "49.5%",
              left: "42.8%",
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle, rgba(255,180,50,0.8) 0%, transparent 70%)",
              opacity: lampOn ? 0.9 : 0.7,
              filter: "blur(15px)",
              animation: "flicker 3s infinite alternate",
              zIndex: 5,
            }}
          />

          <style>{`
            @keyframes flicker {
              0%   { transform: scale(1); opacity: 0.9; filter: blur(12px); }
              20%  { transform: scale(1.05); opacity: 1; filter: blur(14px); }
              40%  { transform: scale(0.95); opacity: 0.8; filter: blur(10px); }
              60%  { transform: scale(1.1); opacity: 1; filter: blur(15px); }
              80%  { transform: scale(0.98); opacity: 0.85; filter: blur(11px); }
              100% { transform: scale(1); opacity: 0.9; filter: blur(12px); }
            }
          `}</style>

          {/* Small Panel */}
          <div>
            <div
              className="absolute overflow-hidden bg-black"
              style={{
                top: "69.9%",
                left: "39.0%",
                width: "10.9%",
                height: "14.5%",
                transform: "perspective(700px) rotateY(-17deg) rotateX(8deg)",
                borderRadius: "2px",
                boxShadow: "inset 0 0 100px rgba(10,10,10,10)",
                clipPath: "polygon(3% 2%, 97% 1%, 98% 98%, 1% 94%)",
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-white text-sm">Loading...</div>
                </div>
              )}
              
              {!isLoading && displaySlides.map((slide, i) => (
                <img
                  key={i}
                  src={slide}
                  alt={`Slide ${i}`}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
                    currentSlideIndex === i ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreativeAgencyPortfolio = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  
  // Remove all CRUD modal states
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [clients, setClients] = useState([]);

  // Default stats in case API fails
  const defaultStats = [
    { id: 1, number: '150+', label: 'Projects Completed' },
    { id: 2, number: '50+', label: 'Happy Clients' },
    { id: 3, number: '5+', label: 'Years Experience' },
    { id: 4, number: '99%', label: 'Client Satisfaction' }
  ];

  // Default portfolio items in case API fails
  const defaultPortfolioItems = [
    { id: 1, category: 'web', title: 'E-commerce Platform', client: 'Fashion Brand', year: '2023', image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=60' },
    { id: 2, category: 'mobile', title: 'Fitness App', client: 'Health Co', year: '2023', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60' },
    { id: 3, category: 'branding', title: 'Brand Identity', client: 'Tech Startup', year: '2023', image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&auto=format&fit=crop&q=60' },
    { id: 4, category: 'web', title: 'Corporate Website', client: 'Finance Corp', year: '2022', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60' },
    { id: 5, category: 'mobile', title: 'Food Delivery App', client: 'Restaurant Chain', year: '2022', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop&q=60' },
    { id: 6, category: 'branding', title: 'Logo & Packaging', client: 'Beverage Co', year: '2022', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=60' }
  ];

  // Default services in case API fails
  const defaultServices = [
    { id: 1, icon: '🎨', title: 'UI/UX Design', description: 'User-centered design that enhances engagement and drives conversions.' },
    { id: 2, icon: '💻', title: 'Web Development', description: 'Responsive, high-performance websites built with modern technologies.' },
    { id: 3, icon: '📱', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications for iOS and Android.' },
    { id: 4, icon: '🚀', title: 'Digital Strategy', description: 'Comprehensive digital strategies to grow your online presence.' },
    { id: 5, icon: '🛍️', title: 'E-commerce', description: 'Custom online stores with seamless shopping experiences.' },
    { id: 6, icon: '🎯', title: 'Brand Identity', description: 'Complete brand development from logo to visual language.' }
  ];

  // Default testimonials in case API fails
  const defaultTestimonials = [
    { id: 1, text: "Working with XPOVIO transformed our digital presence. Their attention to detail and creative approach exceeded our expectations.", author: "Sarah Johnson", position: "CEO, TechVision", avatar: "SJ" },
    { id: 2, text: "The team delivered our project ahead of schedule with exceptional quality. Their expertise in modern web technologies is impressive.", author: "Michael Chen", position: "Product Manager, InnovateCo", avatar: "MC" },
    { id: 3, text: "Outstanding design work that perfectly captured our brand essence. The collaboration was seamless from start to finish.", author: "Emma Davis", position: "Marketing Director, StyleHub", avatar: "ED" }
  ];

  // Default clients in case API fails
  const defaultClients = [
    { id: 1, name: "TechCorp" },
    { id: 2, name: "GlobalBank" },
    { id: 3, name: "NovaRetail" },
    { id: 4, name: "EduPlus" },
    { id: 5, name: "HealthFirst" },
    { id: 6, name: "FoodChain" }
  ];

  // Fetch statistics from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/statistics/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setStats(data);
        } else {
          setStats(defaultStats);
        }
      } else {
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch portfolio items from API
  const fetchPortfolioItems = async () => {
    try {
      setPortfolioLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/portfolio/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPortfolioItems(data);
        } else {
          setPortfolioItems(defaultPortfolioItems);
        }
      } else {
        setPortfolioItems(defaultPortfolioItems);
      }
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      setPortfolioItems(defaultPortfolioItems);
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/services/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          setServices(defaultServices);
        }
      } else {
        setServices(defaultServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices(defaultServices);
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/testimonials/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } else {
        setTestimonials(defaultTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials(defaultTestimonials);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/clients/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setClients(data);
        } else {
          setClients(defaultClients);
        }
      } else {
        setClients(defaultClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients(defaultClients);
    } finally {
      setClientsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
    fetchPortfolioItems();
    fetchServices();
    fetchTestimonials();
    fetchClients();
  }, []);

  // Dynamically extract categories from portfolioItems
  const categories = useMemo(() => {
    // Default categories as fallback
    const defaultCategories = ['all', 'branding', 'web', 'mobile'];
    
    // If portfolio is still loading, return empty array or default
    if (portfolioLoading) {
      return defaultCategories;
    }
    
    // Check if we have portfolio items from API (not default ones)
    const hasValidItems = portfolioItems && portfolioItems.length > 0;
    
    if (!hasValidItems) {
      return defaultCategories;
    }
    
    // Extract unique categories from portfolio items
    const uniqueCategories = new Set(['all']);
    
    // Check if items have categories
    let hasCategoriesInItems = false;
    
    portfolioItems.forEach(item => {
      if (item.category && item.category.trim() !== '') {
        hasCategoriesInItems = true;
        uniqueCategories.add(item.category.toLowerCase());
      }
    });
    
    // If items have categories, return them
    if (hasCategoriesInItems && uniqueCategories.size > 1) {
      return Array.from(uniqueCategories);
    }
    
    // If no categories found in items, check if we're using default items
    const isUsingDefaultItems = portfolioItems === defaultPortfolioItems || 
                                (portfolioItems.length === defaultPortfolioItems.length && 
                                 JSON.stringify(portfolioItems) === JSON.stringify(defaultPortfolioItems));
    
    if (isUsingDefaultItems) {
      // Extract categories from default items
      const defaultItemCategories = new Set(['all']);
      defaultPortfolioItems.forEach(item => {
        if (item.category) {
          defaultItemCategories.add(item.category.toLowerCase());
        }
      });
      return Array.from(defaultItemCategories);
    }
    
    // Fallback to default categories
    return defaultCategories;
  }, [portfolioItems, portfolioLoading]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') {
      return portfolioItems;
    }
    return portfolioItems.filter(item => 
      item.category && item.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [portfolioItems, activeTab]);

  // Generate avatar initials from name
  const generateAvatarInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Monitor Slideshow Section */}
      <DesktopMonitorSlideshow />

      {/* Statistics Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-white relative z-30 
                         rounded-t-2xl sm:rounded-t-3xl shadow-lg 
                         mt-[-2px] sm:mt-[-5px] md:mt-[-6px] lg:mt-[-4px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Achievements
          </h2>

          <div className="pt-4 sm:pt-6 md:pt-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div 
                    key={stat.id || index} 
                    className="text-center bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Portfolio</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mt-3">
              Explore our latest projects and see how we've helped businesses transform their digital presence.
            </p>
          </div>

          {/* Filter Tabs - DYNAMIC BASED ON DATABASE CATEGORIES */}
          {portfolioLoading ? (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
              {['all', 'branding', 'web', 'mobile'].map((tab) => (
                <button
                  key={tab}
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base bg-gray-100 text-gray-700"
                >
                  {tab === 'all' ? 'All Work' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
              {categories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {tab === 'all' ? 'All Work' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Portfolio Grid - WITH HOVER EFFECTS */}
        {/* Portfolio Grid - WITH HOVER OVERLAY (Simplified) */}
{portfolioLoading ? (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {filteredItems.length > 0 ? (
      filteredItems.map((item) => (
        <div
          key={item.id} 
          className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          {/* Image Container */}
          <div className="relative w-full pt-[75%] overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.title}
              className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Overlay - Hidden by default, shows on hover (works on mobile as tap) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                            opacity-0 group-hover:opacity-100 group-active:opacity-100
                            transition-opacity duration-300 
                            flex items-end">
              
              {/* Content - Hidden by default, shows on hover */}
              <div className="p-4 sm:p-5 md:p-6 text-white transform 
                              translate-y-4 group-hover:translate-y-0 group-active:translate-y-0
                              transition-transform duration-300 w-full">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 line-clamp-1">
                  {item.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-medium text-purple-300">
                    {item.client}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-300">
                    {item.year}
                  </span>
                </div>
                
                <div className="inline-block px-2 sm:px-3 py-1 bg-purple-600 rounded-full text-xs font-medium">
                  {item.category}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500 text-lg">No items found for "{activeTab}" category.</p>
      </div>
    )}
  </div>
)}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Services</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mt-3">
              Comprehensive digital solutions tailored to meet your business needs.
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id || index}
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-purple-200 hover:scale-[1.02]"
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 md:mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{service.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{service.description}</p>
                  <div className="mt-4 sm:mt-5 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-medium text-sm sm:text-base">
                      Learn more →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">What Our Clients Say</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about working with us.
            </p>
          </div>

          {testimonialsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id || index} 
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/10 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 md:mb-6 text-purple-400">"</div>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 md:mb-8 italic">{testimonial.text}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white mr-3 sm:mr-4">
                      {testimonial.avatar || generateAvatarInitials(testimonial.author)}
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base">{testimonial.author}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">{testimonial.position}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">Trusted By</h2>
            <p className="text-sm sm:text-base text-gray-600">Leading brands we've had the pleasure to work with</p>
          </div>
          
          {clientsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {clients.map((client, index) => (
                <div
                  key={client.id || index}
                  className="h-12 sm:h-14 md:h-16 lg:h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl text-gray-700 font-bold text-base sm:text-lg md:text-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100"
                >
                  {client.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CreativeAgencyPortfolio;