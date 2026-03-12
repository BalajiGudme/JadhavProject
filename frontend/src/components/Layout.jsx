
// import { Outlet, Link, useLocation } from "react-router-dom";
// import { useState, useEffect, useCallback, useRef } from "react";
// import Login from "./LoginClient/Login";
// import Register from "./LoginClient/Register";
// import { getCurrentUser, logout } from "./utils/auth";


// const Layout = () => {

//   const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const location = useLocation();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [showLogoutMessage, setShowLogoutMessage] = useState(false);
//   const [showLoginMessage, setShowLoginMessage] = useState(false);
//   const [prevAuthState, setPrevAuthState] = useState(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [managementDropdownOpen, setManagementDropdownOpen] = useState(false);
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);

//   // Refs for outside click detection
//   const mobileMenuRef = useRef(null);
//   const mobileMenuButtonRef = useRef(null);

//   // Responsive breakpoints
//   const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

//   // Check if we're on home page
//   const isHomePage = location.pathname === '/';

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const token = localStorage.getItem('access');
//       if (!token) {
//         setError('Please log in to view your profile');
//         setLoading(false);
//         return;
//       }

//       const response = await fetch('http://127.0.0.1:8000/api/profile/', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to load user profile');
//       }

//       const data = await response.json();
//       setUserProfile(data);
//     } catch (err) {
//       setError('Failed to load user profile. Please try again.');
//       console.error('Error fetching user profile:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open profile popup and fetch data
//   const handleOpenProfile = () => {
//     setIsProfilePopupOpen(true);
//     fetchUserProfile();
//     setMobileMenuOpen(false);
//     setUserDropdownOpen(false);
//   };
  

//   // Close profile popup
//   const handleCloseProfile = () => {
//     setIsProfilePopupOpen(false);
//     setUserProfile(null);
//     setError('');
//   };

//   // Helper function to get display name
//   const getDisplayName = useCallback(() => {
//     if (!user) return 'User';
//     return user.full_name || user.name || user.username || user.email || 'User';
//   }, [user]);

//   // Helper function to get avatar initial
//   const getAvatarInitial = useCallback(() => {
//     return (getDisplayName().charAt(0) || 'U').toUpperCase();
//   }, [getDisplayName]);

//   // Enhanced role detection function
//   const getUserRole = useCallback(() => {
//     if (!user) return null;
    
//     if (user.role) {
//       return user.role;
//     }
//     if (user.user_type) {
//       return user.user_type;
//     }
//     if (user.user_role) {
//       return user.user_role;
//     }
//     if (user.type) {
//       return user.type;
//     }
//     if (user.is_admin || user.is_staff || user.is_superuser) {
//       return 'admin';
//     }
    
//     return 'customer';
//   }, [user]);

//   // Role checking function
//   const hasRole = useCallback((role) => {
//     const userRole = getUserRole();
//     return userRole === role;
//   }, [getUserRole]);

//   // REMOVED: URL checking useEffect since we're not using URL params anymore

//   // Window resize handler
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//       if (window.innerWidth >= 1024) {
//         setMobileMenuOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Handle click outside to close mobile menu
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Check if click is outside mobile menu and outside the menu button
//       if (
//         mobileMenuOpen && 
//         mobileMenuRef.current && 
//         !mobileMenuRef.current.contains(event.target) &&
//         mobileMenuButtonRef.current && 
//         !mobileMenuButtonRef.current.contains(event.target)
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };

//     // Add event listener when menu is open
//     if (mobileMenuOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       // Optional: close on escape key
//       document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape') {
//           setMobileMenuOpen(false);
//         }
//       });
//     }

//     // Cleanup
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', (e) => {
//         if (e.key === 'Escape') {
//           setMobileMenuOpen(false);
//         }
//       });
//     };
//   }, [mobileMenuOpen]);

//   // Handle scroll for navbar
//   useEffect(() => {
//     const handleScroll = () => {
//       const isScrolled = window.scrollY > 10;
//       setScrolled(isScrolled);
//     };

//     window.addEventListener('scroll', handleScroll);
    
//     // Set initial scrolled state
//     handleScroll();
    
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Prevent body scroll when modal is open
//   useEffect(() => {
//     if (showLoginModal || showRegisterModal || mobileMenuOpen || isProfilePopupOpen) {
//       document.body.style.overflow = 'hidden';
//       if (windowWidth > 768) {
//         document.body.style.paddingRight = '15px';
//       }
//     } else {
//       document.body.style.overflow = 'unset';
//       document.body.style.paddingRight = '0';
//     }

//     return () => {
//       document.body.style.overflow = 'unset';
//       document.body.style.paddingRight = '0';
//     };
//   }, [showLoginModal, showRegisterModal, mobileMenuOpen, isProfilePopupOpen, windowWidth]);

//   // Check authentication status
//   useEffect(() => {
//     const token = localStorage.getItem('access');
//     const userData = localStorage.getItem('user');
//     const wasLoggedIn = prevAuthState;
    
//     if (token && userData) {
//       try {
//         const userObj = JSON.parse(userData);
//         setIsLoggedIn(true);
//         setUser(userObj);
        
//         if (!wasLoggedIn && token && userData) {
//           setShowLoginMessage(true);
//         }
        
//         setPrevAuthState(true);
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//         localStorage.removeItem('access');
//         localStorage.removeItem('user');
//         localStorage.removeItem('refresh');
//         setIsLoggedIn(false);
//         setUser(null);
//       }
//     } else {
//       setIsLoggedIn(false);
//       setUser(null);
//       setPrevAuthState(false);
//     }
//   }, [location, prevAuthState]);

//   // Auto-hide messages
//   useEffect(() => {
//     if (showLogoutMessage) {
//       const timer = setTimeout(() => {
//         setShowLogoutMessage(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showLogoutMessage]);

//   useEffect(() => {
//     if (showLoginMessage) {
//       const timer = setTimeout(() => {
//         setShowLoginMessage(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showLoginMessage]);

//   const isActive = (path) => location.pathname === path;

//   // SIMPLE: Handle login button click - Desktop
//   const handleLogin = () => {
//     console.log('Desktop Login button clicked');
//     setShowLoginModal(true);
//   };

//   // SIMPLE: Handle signup button click - Desktop
//   const handleSignUp = () => {
//     console.log('Desktop Sign Up button clicked');
//     setShowRegisterModal(true);
//   };

//   // SIMPLE: Handle login button click - Mobile
//   const handleMobileLogin = (e) => {
//     console.log('Mobile Login button clicked - SIMPLE');
//     e.preventDefault();
//     e.stopPropagation();
    
//     // Close menu first
//     setMobileMenuOpen(false);
    
//     // Open modal after a short delay
//     setTimeout(() => {
//       setShowLoginModal(true);
//     }, 50);
//   };

//   // SIMPLE: Handle signup button click - Mobile
//   const handleMobileSignUp = (e) => {
//     console.log('Mobile Sign Up button clicked - SIMPLE');
//     e.preventDefault();
//     e.stopPropagation();
    
//     // Close menu first
//     setMobileMenuOpen(false);
    
//     // Open modal after a short delay
//     setTimeout(() => {
//       setShowRegisterModal(true);
//     }, 50);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('access');
//     localStorage.removeItem('user');
//     localStorage.removeItem('refresh');
//     setIsLoggedIn(false);
//     setUser(null);
//     setMobileMenuOpen(false);
//     setIsProfilePopupOpen(false);
//     setUserDropdownOpen(false);
//     setShowLogoutMessage(true);
//   };

//   // Close login modal
//   const handleCloseLoginModal = () => {
//     console.log('Closing login modal');
//     setShowLoginModal(false);
//   };

//   // Close register modal
//   const handleCloseRegisterModal = () => {
//     console.log('Closing register modal');
//     setShowRegisterModal(false);
//   };

//   // Switch to register modal
//   const handleSwitchToRegister = () => {
//     setShowLoginModal(false);
//     setShowRegisterModal(true);
//   };

//   // Switch to login modal
//   const handleSwitchToLogin = () => {
//     setShowRegisterModal(false);
//     setShowLoginModal(true);
//   };

//   const handleSuccessfulLogin = () => {
//     setShowLoginModal(false);
//     const userData = getCurrentUser();
//     setUser(userData);
//     setIsLoggedIn(true);
//   };

//   const handleSuccessfulRegister = () => {
//     setShowRegisterModal(false);
//   };

//   // Toggle dropdowns
//   const toggleUserDropdown = () => {
//     setUserDropdownOpen(!userDropdownOpen);
//     setManagementDropdownOpen(false);
//   };

//   const toggleManagementDropdown = () => {
//     setManagementDropdownOpen(!managementDropdownOpen);
//     setUserDropdownOpen(false);
//   };

//   // Close all dropdowns
//   const closeAllDropdowns = () => {
//     setUserDropdownOpen(false);
//     setManagementDropdownOpen(false);
//     setMobileMenuOpen(false);
//   };

//   // SVG Icons for Management Dropdown
//   const Icons = {
//     FormBuilder: () => (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//       </svg>
//     ),
//     Architecture: () => (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//       </svg>
//     ),
//     Forms: () => (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//       </svg>
//     ),
//     Students: () => (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//       </svg>
//     ),
//     Management: () => (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
//       </svg>
//     )
//   };

//   // Define navigation items based on login status and role
//   const getNavItems = () => {
//     const baseItems = [
//       { path: "/", label: "Home" },
//     ];
    
//     if (!isLoggedIn) {
//       baseItems.push({ path: "/student", label: "Fill Form" });
//     }

//     if (isLoggedIn && getUserRole() === 'customer') {
//       baseItems.push(
//         { path: "/arch", label: "My Forms" },
//         // { path: "/customer-dashboard", label: "Dashboard" }
//       );
//     }



    

//     if (isLoggedIn && getUserRole() === 'admin') {
//       baseItems.push(
//         { path: "/admin/dashboard", label: "Admin Panel" }
//       );
//     }

//     return baseItems;
//   };

//   // Management dropdown items - only shown to logged-in users
//   const managementNavItems = [
//     { path: "/formbuilder", label: "Form Builder", icon: Icons.FormBuilder },
//     { path: "/architecture", label: "Architecture", icon: Icons.Architecture },
//     { path: "/forms", label: "Form Management", icon: Icons.Forms },
//     { path: "/students", label: "Token Form", icon: Icons.Students },
//   ];
  

//   const navItems = getNavItems();

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
//       {/* Login Modal */}
//       {showLoginModal && (
//         <div className="fixed inset-0 z-[100] overflow-y-auto">
//           <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={handleCloseLoginModal}></div>
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//               <Login 
//                 onClose={handleCloseLoginModal}
//                 onSwitchToRegister={handleSwitchToRegister}
//                 onLoginSuccess={handleSuccessfulLogin}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Register Modal */}
//       {showRegisterModal && (
//         <div className="fixed inset-0 z-[100] overflow-y-auto">
//           <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={handleCloseRegisterModal}></div>
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//               <Register 
//                 onClose={handleCloseRegisterModal}
//                 onSwitchToLogin={handleSwitchToLogin}
//                 onRegisterSuccess={handleSuccessfulRegister}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* User Profile Popup */}
//       {isProfilePopupOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-white">User Profile</h2>
//                 <button
//                   onClick={handleCloseProfile}
//                   className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="p-6 max-h-[60vh] overflow-y-auto">
//               {loading && (
//                 <div className="flex flex-col items-center justify-center py-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
//                   <p className="text-gray-600">Loading profile...</p>
//                 </div>
//               )}

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-center">
//                     <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                     <p className="text-red-800 font-medium">Error</p>
//                   </div>
//                   <p className="text-red-600 mt-1 text-sm">{error}</p>
//                   <button
//                     onClick={fetchUserProfile}
//                     className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               )}

//               {userProfile && !loading && (
//                 <div className="space-y-4">
//                   {/* Profile fields */}
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Full Name</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.full_name || 'Not provided'}
//                     </span>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Username</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.username}
//                     </span>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Email</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.email}
//                     </span>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Phone Number</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.phone_number || 'Not provided'}
//                     </span>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">College/Company</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.college_company || 'Not provided'}
//                     </span>
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Address</span>
//                     <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
//                       {userProfile.address || 'Not provided'}
//                     </span>
//                   </div>

//                   {/* Role and Status */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
//                     <div>
//                       <span className="text-sm font-medium text-gray-500 block mb-1">Role</span>
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                         userProfile.role === 'admin' 
//                           ? 'bg-purple-100 text-purple-800' 
//                           : userProfile.role === 'customer'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-blue-100 text-blue-800'
//                       }`}>
//                         {userProfile.role || 'customer'}
//                       </span>
//                     </div>
                    
//                     <div>
//                       <span className="text-sm font-medium text-gray-500 block mb-1">Status</span>
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                         userProfile.is_approved 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {userProfile.is_approved ? 'Approved' : 'Pending'}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Member since */}
//                   <div className="bg-gray-50 rounded-lg p-4 mt-4">
//                     <div className="flex items-center text-sm text-gray-600">
//                       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                       </svg>
//                       Member since {new Date(userProfile.date_joined).toLocaleDateString()}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//               <div className="flex justify-end">
//                 <button
//                   onClick={handleCloseProfile}
//                   className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Login Success Message */}
//       {showLoginMessage && (
//         <div className={`fixed z-[100] ${
//           windowWidth < 640 ? 'top-16 left-4 right-4' : 'top-20 left-1/2 transform -translate-x-1/2'
//         }`}>
//           <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 animate-fade-in">
//             <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//             <span className="font-semibold text-sm sm:text-base">You have successfully logged in!</span>
//           </div>
//         </div>
//       )}

//       {/* Logout Success Message */}
//       {showLogoutMessage && (
//         <div className={`fixed z-[100] ${
//           windowWidth < 640 ? 'top-16 left-4 right-4' : 'top-20 left-1/2 transform -translate-x-1/2'
//         }`}>
//           <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 animate-fade-in">
//             <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//             <span className="font-semibold text-sm sm:text-base">You have successfully logged out!</span>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       {/* <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#0d1321] text-gray-300 ' : 'bg-transparent'}`}> */}
//       <header 
//       className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
//         isHomePage && !scrolled ? 'bg-transparent' : 'bg-[#0d1321] text-gray-300'
//       }`}
//     >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 sm:h-20">
//             {/* Logo */}
//             <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
//                 <span className="font-bold text-white text-lg sm:text-xl">
//                   GL
//                 </span>
//               </div>
//               <div>
//                 <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
//                   Golden Lamtouch
//                 </h1>
//                 <p className="text-xs sm:text-sm text-white">
//                   Professional ID Management
//                 </p>
//               </div>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-1">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     isActive(item.path)
//                       ? 'text-yellow-600 bg-yellow-50'
//                       : 'text-white hover:text-yellow-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span>{item.label}</span>
//                 </Link>
//               ))}
              
//               {/* Management Dropdown */}
//               {isLoggedIn && (
//                 <div 
//                   className="relative"
//                   onMouseEnter={toggleManagementDropdown}
//                   onMouseLeave={toggleManagementDropdown}
//                 >
//                   <button
//                     className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       managementNavItems.some(item => isActive(item.path))
//                         ? 'text-yellow-600 bg-yellow-50'
//                         : 'text-white hover:text-yellow-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Icons.Management className="w-4 h-4" />
//                     <span className="text-white">Management</span>
//                     <svg 
//                       className={`w-4 h-4 transition-transform duration-200 ${
//                         managementDropdownOpen ? 'rotate-180' : ''
//                       } text-white`}  
//                       fill="none" 
//                       stroke="currentColor" 
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
                  
//                   {/* Dropdown Menu */}
//                   {managementDropdownOpen && (
//                     <div className="absolute left-0 top-full mt-0.5 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//                       <div className="p-2">
//                         {managementNavItems.map((item) => (
//                           <Link
//                             key={item.path}
//                             to={item.path}
//                             className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
//                               isActive(item.path)
//                                 ? 'bg-yellow-50 text-yellow-700'
//                                 : 'text-gray-700 hover:bg-gray-50 hover:text-yellow-600'
//                             }`}
//                             onClick={() => {
//                               closeAllDropdowns();
//                               setMobileMenuOpen(false);
//                             }}
//                           >
//                             <item.icon className="w-4 h-4" />
//                             <span className="font-medium text-sm">{item.label}</span>
//                           </Link>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </nav>

//             {/* User Section */}
//            <div className="flex items-center space-x-3 sm:space-x-4">
//   {isLoggedIn ? (
//     <div className="flex items-center space-x-3 sm:space-x-4">
//       {/* Notification Bell */}
//       {/* ... (commented notification bell) ... */}

//       {/* User Profile */}
//       <div className="hidden sm:block text-right">
//         <p className="text-sm font-medium text-white">
//           {getDisplayName()}
//         </p>
//       </div>
      
//       {/* User Dropdown with Hover */}
//       <div 
//         className="relative"
//         onMouseEnter={() => setUserDropdownOpen(true)}
//         onMouseLeave={() => setUserDropdownOpen(false)}
//       >
//         <div 
//           className="flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//           onClick={toggleUserDropdown}
//         >
//           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow">
//             <span className="text-white font-semibold text-xs sm:text-sm">
//               {getAvatarInitial()}
//             </span>
//           </div>
//           <svg className={`w-4 h-4 text-white transition-transform duration-200 ${
//             userDropdownOpen ? 'rotate-180' : ''
//           }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>

//         {/* Dropdown Menu */}
//         {userDropdownOpen && (
//           <div 
//             className="absolute right-0 top-full mt-0.5 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
//             onMouseEnter={() => setUserDropdownOpen(true)}
//             onMouseLeave={() => setUserDropdownOpen(false)}
//           >
//             <div className="p-4 border-b border-gray-100">
//               <p className="font-semibold text-gray-900 text-sm">
//                 {getDisplayName()}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
//             </div>
//             <div className="p-2">
//               {hasRole('admin') && (
//                 <Link
//                   to="/admin/dashboard"
//                   className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors duration-200 text-sm"
//                   onClick={closeAllDropdowns}
//                 >
//                   <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                   </svg>
//                   <span>Admin Panel</span>
//                 </Link>
//               )}
             
//               {/* Profile Settings Button */}
//               <button 
//                 onClick={handleOpenProfile}
//                 className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 text-sm"
//               >
//                 <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 <span>Profile Settings</span>
//               </button>
//             </div>
//             <div className="p-2 border-t border-gray-100">
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 font-medium text-sm"
//               >
//                 <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   ) : (
//     <div className="hidden lg:flex items-center space-x-3">
//       <button
//         onClick={handleLogin}
//         className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
//       >
//         Sign In
//       </button>
//       <button
//         onClick={handleSignUp}
//         className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
//       >
//         Sign Up Free
//       </button>
//     </div>
//   )}

//   {/* Mobile Menu Button - Changed to white */}
//   <button
//     ref={mobileMenuButtonRef}
//     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//     className="lg:hidden p-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-colors duration-200"
//     aria-label="Toggle mobile menu"
//   >
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       {mobileMenuOpen ? (
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//       ) : (
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//       )}
//     </svg>
//   </button>
// </div>
//           </div>

//           {/* Mobile Navigation - SIMPLEST WORKING VERSION with click outside detection */}
//           {mobileMenuOpen && (
//             <div 
//               ref={mobileMenuRef}
//               className="lg:hidden border-t border-gray-200 bg-white shadow-lg z-40"
//             >
//               <div className="py-3">
//                 <nav className="flex flex-col space-y-1 px-2">
//                   {navItems.map((item) => (
//                     <Link
//                       key={item.path}
//                       to={item.path}
//                       onClick={() => setMobileMenuOpen(false)}
//                       className={`flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
//                         isActive(item.path)
//                           ? 'text-yellow-600 bg-yellow-50'
//                           : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       <span>{item.label}</span>
//                     </Link>
//                   ))}
                  
//                   {/* Management Section in Mobile Menu */}
//                   {isLoggedIn && (
//                     <>
//                       <div className="pt-4 pb-2 border-t border-gray-200">
//                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
//                           Management
//                         </p>
//                       </div>
//                       {managementNavItems.map((item) => (
//                         <Link
//                           key={item.path}
//                           to={item.path}
//                           onClick={() => setMobileMenuOpen(false)}
//                           className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
//                         >
//                           <item.icon className="w-5 h-5" />
//                           <span>{item.label}</span>
//                         </Link>
//                       ))}
                      
//                       {/* User Menu in Mobile */}
//                       <div className="pt-4 pb-2 border-t border-gray-200 mt-2">
//                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
//                           Account
//                         </p>
//                       </div>
                      
//                       {hasRole('admin') && (
//                         <Link
//                           to="/admin/dashboard"
//                           className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
//                           onClick={() => setMobileMenuOpen(false)}
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                           </svg>
//                           <span>Admin Panel</span>
//                         </Link>
//                       )}
                      
//                       <button 
//                         onClick={() => {
//                           setMobileMenuOpen(false);
//                           handleOpenProfile();
//                         }}
//                         className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200 text-left w-full"
//                       >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                         </svg>
//                         <span>Profile Settings</span>
//                       </button>
                      
//                       <button
//                         onClick={() => {
//                           setMobileMenuOpen(false);
//                           handleLogout();
//                         }}
//                         className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-left w-full font-medium mt-2"
//                       >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                         </svg>
//                         <span>Logout</span>
//                       </button>
//                     </>
//                   )}
                  
//                   {/* Login/Signup for non-logged in users on mobile - ULTRA SIMPLE */}
//                   {!isLoggedIn && (
//                     <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
//                       <button
//                         onClick={handleMobileLogin}
//                         className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
//                       >
//                         Sign In
//                       </button>
//                       <button
//                         onClick={handleMobileSignUp}
//                         className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
//                       >
//                         Sign Up Free
//                       </button>
//                     </div>
//                   )}
//                 </nav>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className={`flex-1 w-full max-w-none mx-0 px-4 py-6 pt-24 min-h-screen !m-0 !p-0 !mx-0`}>
//         <Outlet />
//       </main>

//       {/* Footer */}
//       <footer className="bg-[#0d1321] text-gray-300 py-6">
//         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
//           {/* Left Text */}
//           <p className="text-sm text-center md:text-left">
//             © 2024 Golden Lamtouch. All rights reserved.
//           </p>
          

//           {/* Right Social Icons */}
//           <div className="flex space-x-3 sm:space-x-4">
            
//             {/* Facebook */}
//             <a 
//               href="https://facebook.com" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-blue-600/80 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
//               aria-label="Facebook"
//             >
//               <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//               </svg>
//             </a>

//             {/* Instagram */}
//             <a 
//               href="https://instagram.com" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
//               aria-label="Instagram"
//             >
//               <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM9 11.374c.955 0 1.729.774 1.729 1.729 0 .955-.774 1.729-1.729 1.729s-1.729-.774-1.729-1.729c0-.955.774-1.729 1.729-1.729zm5.315 0c.955 0 1.729.774 1.729 1.729 0 .955-.774 1.729-1.729 1.729s-1.729-.774-1.729-1.729c0-.955.774-1.729 1.729-1.729zm2.689 7.037h-11.999c-.621 0-1.125-.504-1.125-1.125v-6.142c0-.621.504-1.125 1.125-1.125h12c.621 0 1.125.504 1.125 1.125v6.142c0 .621-.504 1.125-1.125 1.125z"/>
//               </svg>
//             </a>

//             {/* X/Twitter */}
//             <a 
//               href="https://twitter.com" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-black transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
//               aria-label="Twitter/X"
//             >
//               <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
//               </svg>
//             </a>

//             {/* GitHub */}
//             <a 
//               href="https://github.com" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
//               aria-label="GitHub"
//             >
//               <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
//               </svg>
//             </a>

//             {/* YouTube */}
//             <a 
//               href="https://youtube.com" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
//               aria-label="YouTube"
//             >
//               <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
//               </svg>
//             </a>
           
//           </div>
//           <p className="text-sm text-center md:text-left">
//             GangaTech Solutions Pvt.Ltd. Developer
//           </p>
//         </div>
//       </footer>

//       {/* Mobile Overlay - REMOVED COMPLETELY */}
//       {/* No overlay to interfere with modals */}
//     </div>
//   );
// };

// export default Layout;





import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import Login from "./LoginClient/Login";
import Register from "./LoginClient/Register";
import { getCurrentUser, logout } from "./utils/auth";

const Layout = () => {

  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate(); // Added useNavigate
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [prevAuthState, setPrevAuthState] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [managementDropdownOpen, setManagementDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Refs for outside click detection
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Responsive breakpoints
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Check if we're on home page
  const isHomePage = location.pathname === '/';

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access');
      if (!token) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      setError('Failed to load user profile. Please try again.');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open profile popup and fetch data
  const handleOpenProfile = () => {
    setIsProfilePopupOpen(true);
    fetchUserProfile();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };
  

  // Close profile popup
  const handleCloseProfile = () => {
    setIsProfilePopupOpen(false);
    setUserProfile(null);
    setError('');
  };

  // Helper function to get display name
  const getDisplayName = useCallback(() => {
    if (!user) return 'User';
    return user.full_name || user.name || user.username || user.email || 'User';
  }, [user]);

  // Helper function to get avatar initial
  const getAvatarInitial = useCallback(() => {
    return (getDisplayName().charAt(0) || 'U').toUpperCase();
  }, [getDisplayName]);

  // Enhanced role detection function
  const getUserRole = useCallback(() => {
    if (!user) return null;
    
    if (user.role) {
      return user.role;
    }
    if (user.user_type) {
      return user.user_type;
    }
    if (user.user_role) {
      return user.user_role;
    }
    if (user.type) {
      return user.type;
    }
    if (user.is_admin || user.is_staff || user.is_superuser) {
      return 'admin';
    }
    
    return 'customer';
  }, [user]);

  // Role checking function
  const hasRole = useCallback((role) => {
    const userRole = getUserRole();
    return userRole === role;
  }, [getUserRole]);

  // REMOVED: URL checking useEffect since we're not using URL params anymore

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside mobile menu and outside the menu button
      if (
        mobileMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current && 
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Optional: close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      });
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      });
    };
  }, [mobileMenuOpen]);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set initial scrolled state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLoginModal || showRegisterModal || mobileMenuOpen || isProfilePopupOpen) {
      document.body.style.overflow = 'hidden';
      if (windowWidth > 768) {
        document.body.style.paddingRight = '15px';
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    };
  }, [showLoginModal, showRegisterModal, mobileMenuOpen, isProfilePopupOpen, windowWidth]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access');
    const userData = localStorage.getItem('user');
    const wasLoggedIn = prevAuthState;
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(userObj);
        
        if (!wasLoggedIn && token && userData) {
          setShowLoginMessage(true);
        }
        
        setPrevAuthState(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('access');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh');
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setPrevAuthState(false);
    }
  }, [location, prevAuthState]);

  // Auto-hide messages
  useEffect(() => {
    if (showLogoutMessage) {
      const timer = setTimeout(() => {
        setShowLogoutMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLogoutMessage]);

  useEffect(() => {
    if (showLoginMessage) {
      const timer = setTimeout(() => {
        setShowLoginMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLoginMessage]);

  const isActive = (path) => location.pathname === path;

  // SIMPLE: Handle login button click - Desktop
  const handleLogin = () => {
    console.log('Desktop Login button clicked');
    setShowLoginModal(true);
  };

  // SIMPLE: Handle signup button click - Desktop
  const handleSignUp = () => {
    console.log('Desktop Sign Up button clicked');
    setShowRegisterModal(true);
  };

  // SIMPLE: Handle login button click - Mobile
  const handleMobileLogin = (e) => {
    console.log('Mobile Login button clicked - SIMPLE');
    e.preventDefault();
    e.stopPropagation();
    
    // Close menu first
    setMobileMenuOpen(false);
    
    // Open modal after a short delay
    setTimeout(() => {
      setShowLoginModal(true);
    }, 50);
  };

  // SIMPLE: Handle signup button click - Mobile
  const handleMobileSignUp = (e) => {
    console.log('Mobile Sign Up button clicked - SIMPLE');
    e.preventDefault();
    e.stopPropagation();
    
    // Close menu first
    setMobileMenuOpen(false);
    
    // Open modal after a short delay
    setTimeout(() => {
      setShowRegisterModal(true);
    }, 50);
  };

  // UPDATED: Handle logout with redirect to home page
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
    setUser(null);
    setMobileMenuOpen(false);
    setIsProfilePopupOpen(false);
    setUserDropdownOpen(false);
    setShowLogoutMessage(true);
    
    // Redirect to home page
    navigate('/');
  };

  // Close login modal
  const handleCloseLoginModal = () => {
    console.log('Closing login modal');
    setShowLoginModal(false);
  };

  // Close register modal
  const handleCloseRegisterModal = () => {
    console.log('Closing register modal');
    setShowRegisterModal(false);
  };

  // Switch to register modal
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Switch to login modal
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleSuccessfulLogin = () => {
    setShowLoginModal(false);
    const userData = getCurrentUser();
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleSuccessfulRegister = () => {
    setShowRegisterModal(false);
  };

  // Toggle dropdowns
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setManagementDropdownOpen(false);
  };

  const toggleManagementDropdown = () => {
    setManagementDropdownOpen(!managementDropdownOpen);
    setUserDropdownOpen(false);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setUserDropdownOpen(false);
    setManagementDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // SVG Icons for Management Dropdown
  const Icons = {
    FormBuilder: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    Architecture: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    Forms: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    Students: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    Management: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    )
  };

  // Define navigation items based on login status and role
  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home" },
    ];
    
    if (!isLoggedIn) {
      baseItems.push({ path: "/student", label: "Fill Form" });
    }

    if (isLoggedIn && getUserRole() === 'customer') {
      baseItems.push(
        { path: "/arch", label: "My Forms" },
        // { path: "/customer-dashboard", label: "Dashboard" }
      );
    }



    

    if (isLoggedIn && getUserRole() === 'admin') {
      baseItems.push(
        { path: "/admin/dashboard", label: "Admin Panel" }
      );
    }

    return baseItems;
  };

  // Management dropdown items - only shown to logged-in users
  const managementNavItems = [
    { path: "/formbuilder", label: "Form Builder", icon: Icons.FormBuilder },
    { path: "/architecture", label: "Architecture", icon: Icons.Architecture },
    { path: "/forms", label: "Form Management", icon: Icons.Forms },
    { path: "/students", label: "Token Form", icon: Icons.Students },
  ];
  

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={handleCloseLoginModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Login 
                onClose={handleCloseLoginModal}
                onSwitchToRegister={handleSwitchToRegister}
                onLoginSuccess={handleSuccessfulLogin}
              />
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={handleCloseRegisterModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Register 
                onClose={handleCloseRegisterModal}
                onSwitchToLogin={handleSwitchToLogin}
                onRegisterSuccess={handleSuccessfulRegister}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Profile Popup */}
      {isProfilePopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">User Profile</h2>
                <button
                  onClick={handleCloseProfile}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 font-medium">Error</p>
                  </div>
                  <p className="text-red-600 mt-1 text-sm">{error}</p>
                  <button
                    onClick={fetchUserProfile}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {userProfile && !loading && (
                <div className="space-y-4">
                  {/* Profile fields */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Full Name</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.full_name || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Username</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.username}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Email</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.email}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Phone Number</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.phone_number || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">College/Company</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.college_company || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Address</span>
                    <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                      {userProfile.address || 'Not provided'}
                    </span>
                  </div>

                  {/* Role and Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block mb-1">Role</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        userProfile.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : userProfile.role === 'customer'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {userProfile.role || 'customer'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500 block mb-1">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        userProfile.is_approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userProfile.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Member since */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Member since {new Date(userProfile.date_joined).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseProfile}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Success Message */}
      {showLoginMessage && (
        <div className={`fixed z-[100] ${
          windowWidth < 640 ? 'top-16 left-4 right-4' : 'top-20 left-1/2 transform -translate-x-1/2'
        }`}>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm sm:text-base">You have successfully logged in!</span>
          </div>
        </div>
      )}

      {/* Logout Success Message */}
      {showLogoutMessage && (
        <div className={`fixed z-[100] ${
          windowWidth < 640 ? 'top-16 left-4 right-4' : 'top-20 left-1/2 transform -translate-x-1/2'
        }`}>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm sm:text-base">You have successfully logged out!</span>
          </div>
        </div>
      )}

      {/* Header */}
      {/* <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#0d1321] text-gray-300 ' : 'bg-transparent'}`}> */}
      <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isHomePage && !scrolled ? 'bg-transparent' : 'bg-[#0d1321] text-gray-300'
      }`}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
                <span className="font-bold text-white text-lg sm:text-xl">
                  MCP
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                  MauliCard
                </h1>
                {/* <p className="text-xs sm:text-sm text-white">
                  Professional ID Management
                </p> */}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-yellow-600 bg-yellow-50'
                      : 'text-white hover:text-yellow-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Management Dropdown */}
              {isLoggedIn && (
                <div 
                  className="relative"
                  onMouseEnter={toggleManagementDropdown}
                  onMouseLeave={toggleManagementDropdown}
                >
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      managementNavItems.some(item => isActive(item.path))
                        ? 'text-yellow-600 bg-yellow-50'
                        : 'text-white hover:text-yellow-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icons.Management className="w-4 h-4" />
                    <span className="text-white">Management</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        managementDropdownOpen ? 'rotate-180' : ''
                      } text-white`}  
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {managementDropdownOpen && (
                    <div className="absolute left-0 top-full mt-0.5 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-2">
                        {managementNavItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-yellow-600'
                            }`}
                            onClick={() => {
                              closeAllDropdowns();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* User Section */}
           <div className="flex items-center space-x-3 sm:space-x-4">
  {isLoggedIn ? (
    <div className="flex items-center space-x-3 sm:space-x-4">
      {/* Notification Bell */}
      {/* ... (commented notification bell) ... */}

      {/* User Profile */}
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-white">
          {getDisplayName()}
        </p>
      </div>
      
      {/* User Dropdown with Hover */}
      <div 
        className="relative"
        onMouseEnter={() => setUserDropdownOpen(true)}
        onMouseLeave={() => setUserDropdownOpen(false)}
      >
        <div 
          className="flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          onClick={toggleUserDropdown}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow">
            <span className="text-white font-semibold text-xs sm:text-sm">
              {getAvatarInitial()}
            </span>
          </div>
          <svg className={`w-4 h-4 text-white transition-transform duration-200 ${
            userDropdownOpen ? 'rotate-180' : ''
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown Menu */}
        {userDropdownOpen && (
          <div 
            className="absolute right-0 top-full mt-0.5 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            onMouseEnter={() => setUserDropdownOpen(true)}
            onMouseLeave={() => setUserDropdownOpen(false)}
          >
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="p-2">
              {hasRole('admin') && (
                <Link
                  to="/admin/dashboard"
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors duration-200 text-sm"
                  onClick={closeAllDropdowns}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <span>Admin Panel</span>
                </Link>
              )}
             
              {/* Profile Settings Button */}
              <button 
                onClick={handleOpenProfile}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile Settings</span>
              </button>
            </div>
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 font-medium text-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="hidden lg:flex items-center space-x-3">
      <button
        onClick={handleLogin}
        className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
      >
        Sign In
      </button>
      <button
        onClick={handleSignUp}
        className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
      >
        Sign Up Free
      </button>
    </div>
  )}

  {/* Mobile Menu Button - Changed to white */}
  <button
    ref={mobileMenuButtonRef}
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="lg:hidden p-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-colors duration-200"
    aria-label="Toggle mobile menu"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {mobileMenuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
</div>
          </div>

          {/* Mobile Navigation - SIMPLEST WORKING VERSION with click outside detection */}
          {mobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className="lg:hidden border-t border-gray-200 bg-white shadow-lg z-40"
            >
              <div className="py-3">
                <nav className="flex flex-col space-y-1 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'text-yellow-600 bg-yellow-50'
                          : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  {/* Management Section in Mobile Menu */}
                  {isLoggedIn && (
                    <>
                      <div className="pt-4 pb-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
                          Management
                        </p>
                      </div>
                      {managementNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      
                      {/* User Menu in Mobile */}
                      <div className="pt-4 pb-2 border-t border-gray-200 mt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
                          Account
                        </p>
                      </div>
                      
                      {hasRole('admin') && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          </svg>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleOpenProfile();
                        }}
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg transition-all duration-200 text-left w-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-left w-full font-medium mt-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                  
                  {/* Login/Signup for non-logged in users on mobile - ULTRA SIMPLE */}
                  {!isLoggedIn && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleMobileLogin}
                        className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={handleMobileSignUp}
                        className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Sign Up Free
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-none mx-0 px-4 py-6 pt-24 min-h-screen !m-0 !p-0 !mx-0`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0d1321] text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Left Text */}
          <p className="text-sm text-center md:text-left">
  ✉️ jadhavnamdev29@gmail.com | 📞 +91 7498551060 | Maulicard. All rights reserved.
</p>
          

          {/* Right Social Icons */}
          <div className="flex space-x-3 sm:space-x-4">
            
            {/* Facebook */}
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-blue-600/80 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM9 11.374c.955 0 1.729.774 1.729 1.729 0 .955-.774 1.729-1.729 1.729s-1.729-.774-1.729-1.729c0-.955.774-1.729 1.729-1.729zm5.315 0c.955 0 1.729.774 1.729 1.729 0 .955-.774 1.729-1.729 1.729s-1.729-.774-1.729-1.729c0-.955.774-1.729 1.729-1.729zm2.689 7.037h-11.999c-.621 0-1.125-.504-1.125-1.125v-6.142c0-.621.504-1.125 1.125-1.125h12c.621 0 1.125.504 1.125 1.125v6.142c0 .621-.504 1.125-1.125 1.125z"/>
              </svg>
            </a>

            {/* X/Twitter */}
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-black transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="Twitter/X"
            >
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>

            {/* GitHub */}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/30 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
           
          </div>
          <p className="text-sm text-center md:text-left">
            GangaTech Solutions Pvt.Ltd. Developer
          </p>
        </div>
      </footer>

      {/* Mobile Overlay - REMOVED COMPLETELY */}
      {/* No overlay to interfere with modals */}
    </div>
  );
};

export default Layout;