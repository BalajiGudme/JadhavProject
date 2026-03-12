import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:8000/api';

// Token management utilities
const getaccess = () => localStorage.getItem('access');

// Enhanced fetch with token handling
const createAuthFetch = () => {
  const authFetch = async (url, options = {}) => {
    let access = getaccess();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (access) {
      headers['Authorization'] = `Bearer ${access}`;
    }

    const config = {
      ...options,
      headers,
    };

    let response = await fetch(url, config);
    return response;
  };

  return authFetch;
};

// ============================================
// IMAGE COMPONENTS
// ============================================

const ImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img 
          src={src} 
          alt={alt || "Full size image"} 
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ImageThumbnail = ({ src, alt }) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) {
    return (
      <div className="flex items-center text-gray-400">
        <span>❌</span>
        <span className="ml-1 text-xs">No image</span>
      </div>
    );
  }
  
  return (
    <>
      <div 
        className="relative group cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <img 
          src={src} 
          alt={alt || "Thumbnail"} 
          className="h-12 w-12 object-cover rounded-md border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-all duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            Click to enlarge
          </span>
        </div>
      </div>
      
      {showModal && (
        <ImageModal 
          src={src} 
          alt={alt} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

// User Profile Popup Component - UPDATED to accept userProfile directly
const UserProfilePopup = ({ userProfile, isOpen, onClose, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 mt-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Creator Profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
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
            </div>
          )}

          {userProfile && !loading && !error && (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {(userProfile.full_name?.charAt(0) || userProfile.username?.charAt(0) || 'U').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {userProfile.full_name || userProfile.username || 'Unknown User'}
                  </h3>
                  <p className="text-gray-600 text-sm">{userProfile.email}</p>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Full Name</span>
                  <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                    {userProfile.full_name || 'Not provided'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Username</span>
                  <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                    {userProfile.username || 'Not provided'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 sm:w-1/3">Email</span>
                  <span className="text-gray-900 font-medium text-sm sm:w-2/3 sm:text-right break-words">
                    {userProfile.email || 'Not provided'}
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

                {/* Role and Status in grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Role</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userProfile.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : userProfile.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userProfile.role || 'user'}
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
                    Member since {userProfile.date_joined ? new Date(userProfile.date_joined).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Management Component
const StatusManager = ({ architecture, onStatusUpdate, onMarkAsSeen }) => {
  const [currentStatus, setCurrentStatus] = useState(architecture.status || 0);
  const [updating, setUpdating] = useState(false);
  const authFetch = createAuthFetch();

  useEffect(() => {
    setCurrentStatus(architecture.status || 0);
  }, [architecture.status]);

  const statusOptions = [
    { value: 0, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 1, label: 'Accepted', color: 'bg-green-100 text-green-800' },
    { value: 2, label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 3, label: 'Completed', color: 'bg-blue-100 text-blue-800' }
  ];

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const token = getaccess();
      
      let endpoint = '';
      switch (newStatus) {
        case 0: endpoint = 'mark_pending'; break;
        case 1: endpoint = 'mark_accepted'; break;
        case 2: endpoint = 'mark_rejected'; break;
        case 3: endpoint = 'mark_completed'; break;
        default: return;
      }

      const response = await authFetch(
        `${API_BASE_URL}/statusArchitecture/${architecture.id}/${endpoint}/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Update local state with the new status
      setCurrentStatus(newStatus);
      
      // Notify parent component about the status update
      if (onStatusUpdate) {
        onStatusUpdate(architecture.id, newStatus);
      }

      // Mark as seen if it's a new entry
      if (onMarkAsSeen && architecture.custm_sent_to_admin && !architecture._seen) {
        onMarkAsSeen(architecture.id);
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCurrentStatus().color}`}>
        {getCurrentStatus().label}
      </span>
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(parseInt(e.target.value))}
        disabled={updating}
        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {updating && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center mb-4 sm:mb-0">
        <span className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="ml-4 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              currentPage === number
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

// Main Architecture Manager Component
const ArchitectureManager = () => {
  const [architectures, setArchitectures] = useState([]);
  const [studentArchitectures, setStudentArchitectures] = useState([]);
  const [staffArchitectures, setStaffArchitectures] = useState([]);
  const [tokenCounts, setTokenCounts] = useState({});
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);
  const [view, setView] = useState('students');
  const [formData, setFormData] = useState({
    name: '',
    institution_type: '',
    department_name: '',
    class_name: '',
    division: '',
    student_count: 0,
    staff_count: 0,
    is_active: true,
    parent: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previousView, setPreviousView] = useState('students');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [newEntriesCount, setNewEntriesCount] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // New state for table search and pagination
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();
  const authFetch = createAuthFetch();

  // Track which entries admin has seen
  const [seenEntries, setSeenEntries] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('admin_seen_entries');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const INSTITUTION_TYPES = [
    { value: 'College', label: 'College' },
    { value: 'University', label: 'University' },
    { value: 'School', label: 'School' },
    { value: 'Company', label: 'Company' },
    { value: 'Department', label: 'Department' },
    { value: 'Faculty', label: 'Faculty' },
    { value: 'Institute', label: 'Institute' },
    { value: 'Division', label: 'Division' },
    { value: 'Section', label: 'Section' },
    { value: 'Unit', label: 'Unit' }
  ];

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = getaccess();
      if (!token) {
        navigate('/login');
        return false;
      }
      return true;
    };

    if (!checkAuth()) {
      return;
    }
  }, [navigate]);

  // Save seen entries to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin_seen_entries', JSON.stringify(Array.from(seenEntries)));
  }, [seenEntries]);

  // Calculate new entries count
  const calculateNewEntriesCount = (archs) => {
    const newCount = archs.filter(arch => 
      arch.custm_sent_to_admin && !seenEntries.has(arch.id)
    ).length;
    setNewEntriesCount(newCount);
    return newCount;
  };

  // Fetch all architectures
  const fetchArchitectures = async () => {
    try {
      setLoading(true);
      
      const response = await authFetch(`${API_BASE_URL}/custom-sent-record-for-id-viewSet/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const architecturesData = await response.json();
      
      // Add _seen property based on seenEntries
      const processedArchitectures = architecturesData.map(arch => ({
        ...arch,
        status: arch.status !== undefined && arch.status !== null ? arch.status : 0,
        _seen: seenEntries.has(arch.id)
      }));
      
      setArchitectures(processedArchitectures);
      
      // Calculate new entries count
      calculateNewEntriesCount(processedArchitectures);
      
      // Fetch token counts for each architecture
      fetchTokenCounts(processedArchitectures);
      
    } catch (error) {
      console.error('Error fetching architectures:', error);
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch token counts for each architecture
  const fetchTokenCounts = async (archs) => {
    const counts = {};
    
    for (const arch of archs) {
      try {
        const response = await authFetch(`${API_BASE_URL}/architecture/${arch.id}/responses/`);
        if (response.ok) {
          const data = await response.json();
          const tokens = data.responses ? [...new Set(data.responses.map(response => response.token).filter(Boolean))] : [];
          counts[arch.id] = tokens.length;
        } else {
          counts[arch.id] = 0;
        }
      } catch (error) {
        counts[arch.id] = 0;
      }
    }
    
    setTokenCounts(counts);
  };

  // Search architectures by exact name - ONLY in student records
  const searchArchitecturesByName = (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTermExact = searchTerm.trim();
    const searchTermLower = searchTermExact.toLowerCase();
    
    // Search ONLY in student architectures (architectures with student_count > 0)
    const results = studentArchitectures.filter(arch => {
      const archName = arch.name || '';
      const archNameLower = archName.toLowerCase();
      
      return archNameLower === searchTermLower;
    });
    
    setSearchResults(results);
    setShowSearchResults(true);
    return results;
  };

  // Filter function for student records table search
  const filterStudentArchitectures = (archs, searchTerm) => {
    if (!searchTerm.trim()) return archs;
    
    const term = searchTerm.toLowerCase().trim();
    return archs.filter(arch => {
      return (
        String(arch.id).toLowerCase().includes(term) ||
        (arch.name || '').toLowerCase().includes(term) ||
        (arch.institution_type || '').toLowerCase().includes(term) ||
        (arch.department_name || '').toLowerCase().includes(term) ||
        (arch.class_name || '').toLowerCase().includes(term) ||
        (arch.division || '').toLowerCase().includes(term) ||
        String(arch.student_count || '').includes(term)
      );
    });
  };

  // Filter function for staff records table search
  const filterStaffArchitectures = (archs, searchTerm) => {
    if (!searchTerm.trim()) return archs;
    
    const term = searchTerm.toLowerCase().trim();
    return archs.filter(arch => {
      return (
        String(arch.id).toLowerCase().includes(term) ||
        (arch.name || '').toLowerCase().includes(term) ||
        (arch.institution_type || '').toLowerCase().includes(term) ||
        (arch.department_name || '').toLowerCase().includes(term) ||
        String(arch.staff_count || '').includes(term)
      );
    });
  };

  // Function to convert image URL to base64
  const imageToBase64 = async (url) => {
    try {
      if (url.startsWith('data:image')) {
        return url;
      }
      
      const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
      
      const token = getaccess();
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return 'Image not available';
    }
  };

  // Helper function to format values for Excel
  const formatValueForExcel = (value, fieldType) => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (fieldType?.toLowerCase()) {
      case 'checkbox':
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        if (value) {
          const dateValue = new Date(value);
          return !isNaN(dateValue.getTime()) ? dateValue : value;
        }
        return '-';
      case 'number':
      case 'integer':
      case 'float':
      case 'decimal':
        return isNaN(value) ? value : Number(value);
      default:
        return String(value);
    }
  };

  // Fetch all responses for architectures using the correct API endpoint
  const fetchArchitectureResponses = async (architecturesList) => {
    const allResponses = [];
    
    for (const arch of architecturesList) {
      try {
        const response = await authFetch(`${API_BASE_URL}/architecture/${arch.id}/responses/`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.responses && Array.isArray(data.responses) && data.responses.length > 0) {
            const responsesWithArchInfo = data.responses.map(resp => ({
              ...resp,
              architecture_id: arch.id,
              architecture_name: arch.name,
              architecture_class: arch.class_name || '',
              architecture_department: arch.department_name || '',
              architecture_institution: arch.institution_type || '',
              architecture_division: arch.division || '',
              architecture_student_count: arch.student_count || 0,
              architecture_staff_count: arch.staff_count || 0
            }));
            
            allResponses.push(...responsesWithArchInfo);
          }
        }
      } catch (error) {
        // Silently handle error
      }
    }
    
    return allResponses;
  };

  // Group responses by token
  const groupResponsesByToken = (responses) => {
    const grouped = {};
    
    responses.forEach(response => {
      const token = response.token || 'not-submitted';
      if (!grouped[token]) {
        grouped[token] = {
          token: token,
          responses: {},
          submissionId: response.submission_id,
          architectureName: response.architecture_name,
          timestamp: response.timestamp || response.submitted_at
        };
      }
      
      const fieldType = (response.field_type || '').toLowerCase().trim();
      
      let displayValue = null;
      
      if (fieldType === 'email') {
        displayValue = response.value_email;
      } else if (fieldType === 'phonenumber' || fieldType === 'phone' || fieldType === 'tel' || fieldType === 'telephone') {
        displayValue = response.value_phonenumber;
      } else if (fieldType === 'image' || fieldType === 'photo' || fieldType === 'picture') {
        displayValue = response.value_image;
      } else if (fieldType === 'date') {
        displayValue = response.value_date;
      } else if (fieldType === 'checkbox' || fieldType === 'boolean') {
        displayValue = response.value_boolean;
      } else if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'float' || fieldType === 'decimal') {
        displayValue = response.value_number;
      } else if (fieldType === 'url' || fieldType === 'link' || fieldType === 'website') {
        displayValue = response.value_url;
      } else {
        displayValue = response.value_text || response.value;
      }
      
      if (displayValue === null || displayValue === undefined) {
        displayValue = response.value;
      }
      
      grouped[token].responses[response.field_label] = {
        ...response,
        displayValue: displayValue,
        fieldType: fieldType
      };
    });

    return grouped;
  };

  // Get all unique field labels from responses
  const getAllFieldLabels = (responses) => {
    return [...new Set(responses
      .filter(response => response.field_label)
      .map(response => response.field_label))];
  };

  // Helper function for image conversion (unique name)
  const convertImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      if (url.startsWith('data:image')) {
        resolve(url);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64);
      };
      
      img.onerror = (error) => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  // Helper function to compress base64 image (unique name)
  const compressImageBase64 = (base64Str, maxWidth = 600, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve) => {
      try {
        if (!base64Str || !base64Str.startsWith('data:image')) {
          resolve(base64Str);
          return;
        }
        
        const img = new Image();
        img.src = base64Str;
        
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = Math.floor(height * (maxWidth / width));
              width = maxWidth;
            }
            
            if (height > maxHeight) {
              width = Math.floor(width * (maxHeight / height));
              height = maxHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            if (compressedBase64.length > 30000) {
              compressedBase64 = canvas.toDataURL('image/jpeg', 0.3);
              
              if (compressedBase64.length > 30000) {
                canvas.width = Math.floor(width * 0.5);
                canvas.height = Math.floor(height * 0.5);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compressedBase64 = canvas.toDataURL('image/jpeg', 0.3);
              }
            }
            
            resolve(compressedBase64);
          } catch (err) {
            resolve(base64Str);
          }
        };
        
        img.onerror = (err) => {
          resolve(base64Str);
        };
      } catch (err) {
        resolve(base64Str);
      }
    });
  };

  // Format value for Excel (unique name)
  const formatExcelValue = (value, fieldType) => {
    if (value === null || value === undefined) return '-';
    if (value === '') return '-';
    if (fieldType === 'image') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Updated downloadSearchedArchitecturesExcel function
  const downloadSearchedArchitecturesExcel = async () => {
    if (searchResults.length === 0) {
      alert('No architectures found with the searched name. Please search first.');
      return;
    }

    try {
      setDownloading(true);
      
      alert(`Fetching responses for ${searchResults.length} architecture(s). This may take a moment...`);
      
      const allResponses = await fetchArchitectureResponses(searchResults);
      
      if (allResponses.length === 0) {
        alert('No responses found for the searched architectures.');
        setDownloading(false);
        return;
      }
      
      const groupedResponses = groupResponsesByToken(allResponses);
      const tokens = Object.keys(groupedResponses).filter(t => t !== 'not-submitted');
      const allFieldLabels = getAllFieldLabels(allResponses);
      
      // Separate image fields from other fields
      const imageFields = [];
      const nonImageFields = [];
      
      allResponses.forEach(response => {
        if (response.field_label && 
            (response.field_type === 'image' || response.field_type === 'photo' || response.field_type === 'picture')) {
          if (!imageFields.includes(response.field_label)) {
            imageFields.push(response.field_label);
          }
        } else if (response.field_label) {
          if (!nonImageFields.includes(response.field_label)) {
            nonImageFields.push(response.field_label);
          }
        }
      });
      
      const dateFields = new Set();
      allResponses.forEach(response => {
        if (response.field_type === 'date') {
          dateFields.add(response.field_label);
        }
      });

      // Create a map to store class information for each token
      const tokenClassMap = new Map();
      
      // First, collect class information from all responses
      allResponses.forEach(response => {
        if (response.token && response.field_label && response.field_label.toLowerCase().includes('class')) {
          if (!tokenClassMap.has(response.token)) {
            tokenClassMap.set(response.token, response.displayValue || response.value || '');
          }
        }
      });
      
      // If no class field found in responses, try to get from architecture data
      if (tokenClassMap.size === 0 && searchResults.length > 0) {
        // Create a map of architecture ID to class
        const archClassMap = new Map();
        searchResults.forEach(arch => {
          if (arch.id && arch.class_name) {
            archClassMap.set(arch.id, arch.class_name);
          }
        });
        
        // For each token, try to find which architecture it belongs to
        tokens.forEach(token => {
          // Try to find which architecture this token belongs to
          const tokenResponses = allResponses.filter(r => r.token === token);
          for (const resp of tokenResponses) {
            if (resp.architecture_id && archClassMap.has(resp.architecture_id)) {
              tokenClassMap.set(token, archClassMap.get(resp.architecture_id));
              break;
            }
          }
        });
      }

      const excelData = [];
      
      // First, create all rows without sorting
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenData = groupedResponses[token];
        
        // Get class for this token
        let tokenClass = tokenClassMap.get(token) || '';
        
        // Create a base row with standard fields
        const rowData = {
          'Sr. No': i + 1,
          'Class': tokenClass,
          'Architecture ID': tokenData.responses[nonImageFields[0]]?.architecture_id || '',
          'Architecture Name': tokenData.architectureName || '',
          'Token': token,
          'Submission ID': tokenData.submissionId || '',
          'Timestamp': tokenData.timestamp ? new Date(tokenData.timestamp) : ''
        };

        // Add all non-image fields
        for (const fieldLabel of nonImageFields) {
          const response = tokenData.responses[fieldLabel];
          if (response) {
            let value = response.displayValue || response.value;
            
            if (response.fieldType === 'date' && value) {
              const dateValue = new Date(value);
              if (!isNaN(dateValue.getTime())) {
                rowData[fieldLabel] = dateValue;
              } else {
                rowData[fieldLabel] = value;
              }
            } else {
              rowData[fieldLabel] = formatExcelValue(value, response.fieldType);
            }
          } else {
            rowData[fieldLabel] = '-';
          }
        }

        // Handle images - combine all images into a single column
        if (imageFields.length > 0) {
          const imagesForToken = [];
          let hasValidImages = false;
          
          for (const fieldLabel of imageFields) {
            const response = tokenData.responses[fieldLabel];
            if (response && response.displayValue && response.displayValue !== '' && response.displayValue !== '-') {
              let imageValue = response.displayValue;
              hasValidImages = true;
              
              try {
                // Convert to base64 if it's a URL
                if (imageValue && !imageValue.startsWith('data:image')) {
                  try {
                    imageValue = await convertImageToBase64(imageValue);
                  } catch (convError) {
                    imagesForToken.push(`[Image URL could not be loaded - ${fieldLabel}]`);
                    continue;
                  }
                }
                
                // Clean the base64 data - remove any whitespace
                if (imageValue && imageValue.startsWith('data:image')) {
                  const parts = imageValue.split('base64,');
                  if (parts.length === 2) {
                    const prefix = parts[0] + 'base64,';
                    const base64Part = parts[1].replace(/\s/g, '');
                    imageValue = prefix + base64Part;
                  }
                }
                
                // Check if image exceeds Excel limit and compress if needed
                if (imageValue && imageValue.length > 30000) {
                  let compressedValue = await compressImageBase64(imageValue, 600, 600, 0.7);
                  
                  if (compressedValue.length <= 30000) {
                    imageValue = compressedValue;
                  } else {
                    imageValue = `[Image too large - ${fieldLabel}]`;
                  }
                }
                
                imagesForToken.push(imageValue);
              } catch (error) {
                imagesForToken.push(`[Image processing failed - ${fieldLabel}]`);
              }
            }
          }
          
          // Combine all images into one column
          if (hasValidImages) {
            rowData['Image'] = imagesForToken.join('\n\n');
          } else {
            rowData['Image'] = '-';
          }
        } else {
          rowData['Image'] = '-';
        }

        excelData.push(rowData);
      }

      // Sort the data by Class in ascending order
      excelData.sort((a, b) => {
        const classA = String(a['Class'] || '').toLowerCase();
        const classB = String(b['Class'] || '').toLowerCase();
        
        if (classA === '' && classB === '') return 0;
        if (classA === '') return 1;
        if (classB === '') return -1;
        
        if (classA < classB) return -1;
        if (classA > classB) return 1;
        return 0;
      });

      // Update Sr. No after sorting
      excelData.forEach((row, index) => {
        row['Sr. No'] = index + 1;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: false });

      // Set column widths - updated to include Class column
      const colWidths = [
        { wch: 8 },   // Sr. No
        { wch: 15 },  // Class
        { wch: 15 },  // Architecture ID
        { wch: 30 },  // Architecture Name
        { wch: 20 },  // Token
        { wch: 15 },  // Submission ID
        { wch: 20 },  // Timestamp
        ...nonImageFields.map(() => ({ wch: 25 })),
        { wch: 50 }   // Image column
      ];
      
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Submitted Responses');

      // Create summary sheet with Class information
      const summaryData = [];
      summaryData.push([
        'Sr. No',
        'Architecture ID',
        'Architecture Name',
        'Class',
        'Department',
        'Division',
        'Institution Type',
        'Student Count',
        'Staff Count',
        'Total Responses',
        'Unique Tokens',
        'Status'
      ]);

      // Sort architectures by class for summary sheet as well
      const sortedArchs = [...searchResults].sort((a, b) => {
        const classA = (a.class_name || '').toLowerCase();
        const classB = (b.class_name || '').toLowerCase();
        
        if (classA === '' && classB === '') return 0;
        if (classA === '') return 1;
        if (classB === '') return -1;
        
        if (classA < classB) return -1;
        if (classA > classB) return 1;
        return 0;
      });

      const responseCountMap = {};
      const uniqueTokensMap = {};
      allResponses.forEach(resp => {
        const archId = resp.architecture_id;
        responseCountMap[archId] = (responseCountMap[archId] || 0) + 1;
        
        if (!uniqueTokensMap[archId]) {
          uniqueTokensMap[archId] = new Set();
        }
        if (resp.token) {
          uniqueTokensMap[archId].add(resp.token);
        }
      });

      for (let i = 0; i < sortedArchs.length; i++) {
        const arch = sortedArchs[i];
        const responseCount = responseCountMap[arch.id] || 0;
        const uniqueTokenCount = uniqueTokensMap[arch.id]?.size || 0;
        
        const statusLabels = ['Pending', 'Accepted', 'Rejected', 'Completed'];
        const statusLabel = statusLabels[arch.status] || 'Unknown';

        summaryData.push([
          i + 1,
          arch.id,
          arch.name || '',
          arch.class_name || '',
          arch.department_name || '',
          arch.division || '',
          arch.institution_type || '',
          arch.student_count || 0,
          arch.staff_count || 0,
          responseCount,
          uniqueTokenCount,
          statusLabel
        ]);
      }

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      
      const summaryColWidths = [
        { wch: 8 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      summaryWs['!cols'] = summaryColWidths;
      
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Architecture Summary');

      const safeFileName = searchName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `responses_${safeFileName}_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);

      // Count how many rows have images
      const rowsWithImages = excelData.filter(row => row['Image'] && row['Image'] !== '-').length;
      
      const message = rowsWithImages > 0 
        ? `Successfully downloaded ${allResponses.length} responses from ${searchResults.length} architecture(s) to Excel!\n\nData sorted by Class in ascending order. All images are combined in the "Image" column.`
        : `Successfully downloaded ${allResponses.length} responses from ${searchResults.length} architecture(s) to Excel!\n\nData sorted by Class in ascending order.`;
      
      alert(message);
      
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);
    if (value.trim()) {
      searchArchitecturesByName(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchName('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle student table search
  const handleStudentSearch = (e) => {
    setStudentSearchTerm(e.target.value);
    setStudentCurrentPage(1);
  };

  // Handle staff table search
  const handleStaffSearch = (e) => {
    setStaffSearchTerm(e.target.value);
    setStaffCurrentPage(1);
  };

  // Clear student search
  const clearStudentSearch = () => {
    setStudentSearchTerm('');
    setStudentCurrentPage(1);
  };

  // Clear staff search
  const clearStaffSearch = () => {
    setStaffSearchTerm('');
    setStaffCurrentPage(1);
  };

  // Fetch architectures on component mount
  useEffect(() => {
    fetchArchitectures();
  }, []);

  // Filter architectures when architectures change
  useEffect(() => {
    const studentArchs = architectures.filter(arch => arch.student_count > 0);
    const staffArchs = architectures.filter(arch => arch.staff_count > 0);
    
    setStudentArchitectures(studentArchs);
    setStaffArchitectures(staffArchs);
    
    // If there's an active search, update search results (only from student architectures)
    if (searchName.trim()) {
      searchArchitecturesByName(searchName);
    }
  }, [architectures, searchName]);

  // Recalculate new entries count when architectures or seenEntries change
  useEffect(() => {
    calculateNewEntriesCount(architectures);
  }, [architectures, seenEntries]);

  // Filter architectures by status
  const filterByStatus = (archs) => {
    let filteredArchs = [];
    
    switch (statusFilter) {
      case 'pending':
        filteredArchs = archs.filter(arch => arch.status === 0);
        break;
      case 'accepted':
        filteredArchs = archs.filter(arch => arch.status === 1);
        break;
      case 'rejected':
        filteredArchs = archs.filter(arch => arch.status === 2);
        break;
      case 'completed':
        filteredArchs = archs.filter(arch => arch.status === 3);
        break;
      case 'all':
      default:
        filteredArchs = archs;
        break;
    }
    
    return filteredArchs;
  };

  // Handle when admin marks an architecture as seen
  const handleMarkAsSeen = (architectureId) => {
    setSeenEntries(prev => {
      const newSet = new Set(prev);
      newSet.add(architectureId);
      return newSet;
    });
    
    setArchitectures(prev => prev.map(arch => 
      arch.id === architectureId ? { ...arch, _seen: true } : arch
    ));
  };

  // Check if an entry should show as "new" 
  const shouldShowAsNew = (architecture) => {
    return architecture.custm_sent_to_admin && !seenEntries.has(architecture.id);
  };

  // Handle status update
  const handleStatusUpdate = (architectureId, newStatus) => {
    setArchitectures(prev => prev.map(arch => 
      arch.id === architectureId ? { ...arch, status: newStatus } : arch
    ));
  };

  // ===== UPDATED: Handle user profile click - directly use architecture ID =====
  const handleUserProfileClick = async (architecture) => {
    try {
      setProfileLoading(true);
      setProfileError('');
      
      // Directly fetch user profile using architecture ID
      const response = await authFetch(`${API_BASE_URL}/profile/${architecture.id}/`);
      
      if (response.ok) {
        const userProfileData = await response.json();
        setUserProfileData(userProfileData);
        setSelectedUserId(architecture.id); // Store architecture ID for reference
        setShowUserProfile(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setProfileError(errorData.error || 'Failed to fetch user profile for this architecture.');
        setShowUserProfile(true); // Still show popup with error
        setUserProfileData(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileError('Cannot fetch user profile information at this time.');
      setShowUserProfile(true); // Still show popup with error
      setUserProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Close user profile popup
  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserId(null);
    setUserProfileData(null);
    setProfileError('');
    setProfileLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch(
        `${API_BASE_URL}/architecture/${selectedArchitecture.id}/`,
        {
          method: 'PUT',
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update architecture');
      }
      
      setIsEditing(false);
      setFormData({ 
        name: '', 
        institution_type: '', 
        department_name: '', 
        class_name: '', 
        division: '', 
        student_count: 0, 
        staff_count: 0, 
        is_active: true, 
        parent: null 
      });
      fetchArchitectures();
      setView(previousView);
      alert('Architecture updated successfully!');
    } catch (error) {
      console.error('Error updating architecture:', error);
      alert('Error updating architecture. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this architecture?')) {
      try {
        const response = await authFetch(`${API_BASE_URL}/architecture/${id}/delete/`, {
          method: 'DELETE'
        });
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // Ignore JSON parse error
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.error || responseData?.details || `Failed to delete (Status: ${response.status})`;
          throw new Error(errorMessage);
        }
        
        alert(responseData?.message || 'Architecture deleted successfully!');
        
        await fetchArchitectures();
        setView(previousView);
        
      } catch (error) {
        console.error('Error deleting architecture:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  const handleEditClick = (architecture) => {
    setSelectedArchitecture(architecture);
    setFormData({
      name: architecture.name || '',
      institution_type: architecture.institution_type || '',
      department_name: architecture.department_name || '',
      class_name: architecture.class_name || '',
      division: architecture.division || '',
      student_count: architecture.student_count || 0,
      staff_count: architecture.staff_count || 0,
      is_active: architecture.is_active !== undefined ? architecture.is_active : true,
      parent: architecture.parent || null,
      status: architecture.status || 0
    });
    
    setIsEditing(true);
    setPreviousView(view);
    setView('detail');
  };

  // Get filtered and searched student architectures
  const getFilteredStudentArchitectures = () => {
    const statusFiltered = filterByStatus(studentArchitectures);
    return filterStudentArchitectures(statusFiltered, studentSearchTerm);
  };

  // Get filtered and searched staff architectures
  const getFilteredStaffArchitectures = () => {
    const statusFiltered = filterByStatus(staffArchitectures);
    return filterStaffArchitectures(statusFiltered, staffSearchTerm);
  };

  // Get paginated student architectures
  const getPaginatedStudentArchitectures = () => {
    const filtered = getFilteredStudentArchitectures();
    const startIndex = (studentCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Get paginated staff architectures
  const getPaginatedStaffArchitectures = () => {
    const filtered = getFilteredStaffArchitectures();
    const startIndex = (staffCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Get total pages for student architectures
  const getStudentTotalPages = () => {
    return Math.ceil(getFilteredStudentArchitectures().length / itemsPerPage);
  };

  // Get total pages for staff architectures
  const getStaffTotalPages = () => {
    return Math.ceil(getFilteredStaffArchitectures().length / itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setStudentCurrentPage(1);
    setStaffCurrentPage(1);
  };

  // Get token count for an architecture
  const getTokenCount = (architectureId) => {
    return tokenCounts[architectureId] || 0;
  };

  // Get expected count (student_count or staff_count) for an architecture
  const getExpectedCount = (arch) => {
    return view === 'students' ? arch.student_count : arch.staff_count;
  };

  // Refresh counter function
  const refreshCounter = () => {
    calculateNewEntriesCount(architectures);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* User Profile Popup - UPDATED to use userProfileData directly */}
        <UserProfilePopup 
          userProfile={userProfileData}
          isOpen={showUserProfile}
          onClose={handleCloseUserProfile}
          loading={profileLoading}
          error={profileError}
        />
        
        {/* Header with New Entries Counter and Search */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 lg:mb-0">
            Architecture Management
            {newEntriesCount > 0 && (
              <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                {newEntriesCount} New
              </span>
            )}
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Search and Download Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchName}
                  onChange={handleSearchChange}
                  placeholder="Search exact student architecture name..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
                {searchName && (
                  <button
                    onClick={clearSearch}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <button
                onClick={downloadSearchedArchitecturesExcel}
                disabled={downloading || searchResults.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors duration-200 ${
                  downloading || searchResults.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                }`}
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading Responses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Responses</span>
                    {searchResults.length > 0 && (
                      <span className="ml-1 bg-white text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {searchResults.length} arch
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* New Entries Counter Badge */}
            {newEntriesCount > 0 && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 animate-pulse shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                <span className="font-bold">{newEntriesCount} New Entries</span>
                <button 
                  onClick={refreshCounter}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded text-sm"
                  title="Refresh counter"
                >
                  ↻
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Summary */}
        {showSearchResults && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchResults.length > 0 ? (
                  <span className="text-blue-800 font-medium">
                    Found <span className="font-bold">{searchResults.length}</span> exact match(es) in student records for "<span className="font-bold">{searchName}</span>"
                  </span>
                ) : (
                  <span className="text-blue-800 font-medium">
                    No exact matches found in student records for "<span className="font-bold">{searchName}</span>"
                  </span>
                )}
              </div>
              {searchResults.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* View and Filter Controls */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <button 
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base flex-1 sm:flex-none ${
              view === 'students' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors duration-200`}
            onClick={() => setView('students')}
          >
            Student Records
          </button>
          <button 
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base flex-1 sm:flex-none ${
              view === 'staff' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors duration-200`}
            onClick={() => setView('staff')}
          >
            Staff Records
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>

          <button 
            className="px-4 sm:px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center text-sm sm:text-base transition-colors duration-200 flex-1 sm:flex-none justify-center shadow-md"
            onClick={fetchArchitectures}
            title="Refresh data"
          >
            <span className="mr-2">🔄</span> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading architectures...</span>
          </div>
        )}

        {(view === 'students' || view === 'staff') && !loading && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {view === 'students' ? 'Student' : 'Staff'} Records 
                    <span className="text-sm text-gray-600 ml-3 font-normal">
                      ({view === 'students' ? getFilteredStudentArchitectures().length : getFilteredStaffArchitectures().length} records)
                      {statusFilter !== 'all' && ` - ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                    </span>
                  </h2>
                  <div className="text-xs text-gray-500 mt-1">
                    Showing architectures with status: {statusFilter === 'all' ? 'All Statuses' : statusFilter}
                  </div>
                </div>
                
                {/* Table Search Input */}
                <div className="mt-3 sm:mt-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={view === 'students' ? studentSearchTerm : staffSearchTerm}
                      onChange={view === 'students' ? handleStudentSearch : handleStaffSearch}
                      placeholder={`Search in ${view === 'students' ? 'Student' : 'Staff'} Records...`}
                      className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {(view === 'students' ? studentSearchTerm : staffSearchTerm) && (
                      <button
                        onClick={view === 'students' ? clearStudentSearch : clearStaffSearch}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-sm font-bold">
                    <th className="px-4 py-4 text-left whitespace-nowrap w-16">Sr. No</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap w-20">Arch ID</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap min-w-[150px]">Name</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap min-w-[120px] hidden sm:table-cell">Type</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap min-w-[140px] hidden md:table-cell">Department</th>
                    {view === 'students' && (
                      <>
                        <th className="px-4 py-4 text-left whitespace-nowrap min-w-[100px] hidden lg:table-cell">Class</th>
                        <th className="px-4 py-4 text-left whitespace-nowrap min-w-[100px] hidden lg:table-cell">Division</th>
                      </>
                    )}
                    <th className="px-4 py-4 text-left whitespace-nowrap min-w-[100px]">
                      {view === 'students' ? 'Students' : 'Staff'}
                    </th>
                    <th className="px-4 py-4 text-left whitespace-nowrap min-w-[180px]">Status</th>
                    <th className="px-4 py-4 text-center whitespace-nowrap min-w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(view === 'students' ? getPaginatedStudentArchitectures() : getPaginatedStaffArchitectures()).map((arch, index) => {
                    const tokenCount = getTokenCount(arch.id);
                    const expectedCount = getExpectedCount(arch);
                    const showAsNew = shouldShowAsNew(arch);
                    
                    return (
                      <tr key={arch.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {(view === 'students' ? (studentCurrentPage - 1) * itemsPerPage : (staffCurrentPage - 1) * itemsPerPage) + index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap font-mono">
                          {arch.id}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {/* RED DOT - Only show for new entries */}
                            {showAsNew && (
                              <span className="flex-shrink-0 flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </span>
                            )}
                            {/* UPDATED: Click handler for user profile */}
                            <button 
                              onClick={() => handleUserProfileClick(arch)}
                              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-left bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
                              title="View creator profile"
                            >
                              {arch.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                            {arch.institution_type || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap hidden md:table-cell">
                          {arch.department_name || '-'}
                        </td>
                        {view === 'students' && (
                          <>
                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                {arch.class_name || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                {arch.division || '-'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <div className="flex flex-col">
                            {tokenCount > 0 ? (
                              <span className={`text-sm font-bold px-2 py-1 rounded ${
                                tokenCount === 0 
                                  ? 'bg-red-100 text-red-700' 
                                  : tokenCount < expectedCount 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-green-100 text-green-700'
                              }`}>
                                {tokenCount}
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                expectedCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {expectedCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <StatusManager 
                            architecture={arch} 
                            onStatusUpdate={handleStatusUpdate}
                            onMarkAsSeen={handleMarkAsSeen}
                          />
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <div className="flex justify-center space-x-3">
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                              onClick={() => navigate(`/admin/architecture/${arch.id}/responses`)}
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="text-xs font-medium">View</span>
                            </button>
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                              onClick={() => handleDelete(arch.id)}
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-xs font-medium">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={view === 'students' ? studentCurrentPage : staffCurrentPage}
              totalPages={view === 'students' ? getStudentTotalPages() : getStaffTotalPages()}
              onPageChange={(page) => {
                if (view === 'students') {
                  setStudentCurrentPage(page);
                } else {
                  setStaffCurrentPage(page);
                }
              }}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={view === 'students' ? getFilteredStudentArchitectures().length : getFilteredStaffArchitectures().length}
            />
            
            {view === 'students' && getFilteredStudentArchitectures().length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-medium text-gray-400">No student records found</p>
                <p className="text-sm mt-2 text-gray-500">
                  {studentSearchTerm ? 'Try adjusting your search terms' : 'Try changing your filters or refresh the data'}
                </p>
              </div>
            )}
            
            {view === 'staff' && getFilteredStaffArchitectures().length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-medium text-gray-400">No staff records found</p>
                <p className="text-sm mt-2 text-gray-500">
                  {staffSearchTerm ? 'Try adjusting your search terms' : 'Try changing your filters or refresh the data'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detail View Form */}
        {view === 'detail' && (
          <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
              Edit Architecture
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Form fields remain the same */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add your form fields here */}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setView(previousView);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Architecture
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectureManager;