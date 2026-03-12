import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentForm from './StudentForm';
import Webcam from 'react-webcam';

// Set base URL for API
const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

// ============================================
// TOKEN UTILITY FUNCTIONS
// ============================================

const getAuthToken = () => {
  const token = 
    localStorage.getItem('access') || 
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('authToken');
  return token;
};

const setAuthToken = (token, useLocalStorage = true) => {
  if (useLocalStorage) {
    localStorage.setItem('access', token);
  } else {
    sessionStorage.setItem('access', token);
  }
};

const getRefreshToken = () => {
  return localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
};

const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh');
  sessionStorage.removeItem('authToken');
};

const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
      refresh: refreshToken
    });

    if (response.data.access) {
      setAuthToken(response.data.access);
      return response.data.access;
    }
  } catch (error) {
    clearTokens();
  }
  return null;
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

// ============================================
// MAIN COMPONENT
// ============================================

const ArchitectureResponsesView = () => {
  const { architectureId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [showUnusedTokens, setShowUnusedTokens] = useState(true);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, token: null, type: null });
  const [editingToken, setEditingToken] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editFormFields, setEditFormFields] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [sendingToAdmin, setSendingToAdmin] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Search state for submitted tokens
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [recordsPerPageOptions] = useState([5, 10, 20, 50, 100]);

  // Image editing state
  const [imageSrc, setImageSrc] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [editingImageField, setEditingImageField] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Refs
  const imgRef = useRef(null);
  const webcamRef = useRef(null);
  const containerRef = useRef(null);

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================
  const validateTextOnly = (value, field) => {
    if (!value) return field?.required ? 'This field is required' : null;
    
    if (typeof value === 'string') {
      if (value.trim() === '' && value.length > 0) {
        return field?.required ? 'Cannot contain only spaces' : null;
      }
    }
    
    const lettersAndSpacesRegex = /^[A-Za-z\s]+$/;
    if (!lettersAndSpacesRegex.test(value)) {
      return 'Only letters (A-Z, a-z) and spaces are allowed, no numbers or special characters';
    }
    
    if (field?.options?.maxLength && value.length > field.options.maxLength) {
      return `Maximum ${field.options.maxLength} characters allowed`;
    }
    
    return null;
  };

  const validateAlphanumeric = (value, field) => {
    if (!value) return field?.required ? 'This field is required' : null;
    
    if (typeof value === 'string') {
      if (value.trim() === '' && value.length > 0) {
        return field?.required ? 'Cannot contain only spaces' : null;
      }
    }
    
    const alphanumericWithSpacesRegex = /^[A-Za-z0-9\s]+$/;
    if (!alphanumericWithSpacesRegex.test(value)) {
      return 'Only letters, numbers, and spaces are allowed';
    }
    
    if (field?.options?.maxLength && value.length > field.options.maxLength) {
      return `Maximum ${field.options.maxLength} characters allowed`;
    }
    
    return null;
  };
  
  const validateEmail = (email, field) => {
    if (!email) return field?.required ? 'This field is required' : null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., name@example.com)';
    }
    return null;
  };

  const validatePhone = (phone, field) => {
    if (!phone) return field?.required ? 'This field is required' : null;
    const numericPhone = phone.replace(/\D/g, '');
    if (numericPhone.length < 10 || numericPhone.length > 15) {
      return 'Phone number must be between 10 and 15 digits';
    }
    if (!/^[\d\s\+\-\(\)]+$/.test(phone)) {
      return 'Phone number can only contain digits, spaces, +, -, and parentheses';
    }
    return null;
  };

  const validateUrl = (url, field) => {
    if (!url) return field?.required ? 'This field is required' : null;
    try {
      new URL(url);
      return null;
    } catch {
      try {
        new URL(`https://${url}`);
        return null;
      } catch {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
    }
  };

  const validateNumber = (num, field, type) => {
    if (num === '' || num === null || num === undefined) {
      return field?.required ? 'This field is required' : null;
    }
    const numValue = Number(num);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (type === 'integer' && !Number.isInteger(numValue)) {
      return 'Please enter a whole number (no decimals)';
    }
    if (field?.options) {
      let options = field.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch {
          options = {};
        }
      }
      if (options.min !== undefined && numValue < options.min) {
        return `Value must be at least ${options.min}`;
      }
      if (options.max !== undefined && numValue > options.max) {
        return `Value must be at most ${options.max}`;
      }
    }
    return null;
  };

  const validateDate = (date, field) => {
    if (!date) return field?.required ? 'This field is required' : null;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Please enter a valid date';
    }
    if (field?.options) {
      let options = field.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch {
          options = {};
        }
      }
      if (options.minDate) {
        const minDate = new Date(options.minDate);
        if (dateObj < minDate) {
          return `Date must be on or after ${minDate.toLocaleDateString()}`;
        }
      }
      if (options.maxDate) {
        const maxDate = new Date(options.maxDate);
        if (dateObj > maxDate) {
          return `Date must be on or before ${maxDate.toLocaleDateString()}`;
        }
      }
    }
    return null;
  };

  const validateRequired = (value, field) => {
    if (field?.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }
    return null;
  };

  const validateInput = (value, field, fieldType) => {
    const requiredError = validateRequired(value, field);
    if (requiredError) return requiredError;

    if (value && value !== '') {
      switch (fieldType) {
        case 'email':
          return validateEmail(value, field);
        case 'phone':
        case 'phonenumber':
        case 'phone_number':
        case 'tel':
        case 'telephone':
          return validatePhone(value, field);
        case 'url':
        case 'link':
        case 'website':
          return validateUrl(value, field);
        case 'number':
        case 'integer':
        case 'float':
        case 'decimal':
          return validateNumber(value, field, fieldType);
        case 'date':
          return validateDate(value, field);
        case 'textonly':
        case 'letters':
        case 'alpha':
          return validateTextOnly(value, field);
        case 'alphanumeric':
        case 'alnum':
          return validateAlphanumeric(value, field);
        default:
          if (field?.required && typeof value === 'string' && value.trim() === '' && value.length > 0) {
            return 'Cannot contain only spaces';
          }
          return null;
      }
    }
    return null;
  };
  
  // ============================================
  // HANDLER FUNCTIONS
  // ============================================

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingToken(null);
    setEditFormData({});
    setEditFormFields([]);
    setEditingImageField(null);
    setImageSrc(null);
    setValidationErrors({});
    setWebcamActive(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleInputChange = (fieldId, value) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // ============================================
  // IMAGE EDITING FUNCTIONS
  // ============================================

  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageSrc) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!imageSrc) return;
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    setLastMousePos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !imageSrc) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastMousePos.x;
    const deltaY = touch.clientY - lastMousePos.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = useCallback((e) => {
    if (!imageSrc) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  }, [imageSrc, zoom]);

  const handleTouchStartPinch = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
    }
  }, []);

  const handleTouchMovePinch = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const zoomFactor = distance / lastTouchDistance;
      const newZoom = Math.min(Math.max(0.5, zoom * zoomFactor), 3);
      setZoom(newZoom);
      setLastTouchDistance(distance);
    }
  }, [lastTouchDistance, zoom]);

  const handleTouchEndPinch = useCallback(() => {
    setLastTouchDistance(null);
  }, []);

  // ============================================
  // NAVIGATION FUNCTIONS
  // ============================================

  const goBack = () => {
    navigate('/architecture');
  };

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================

  const fetchArchitectureResponses = async (isMounted = true) => {
    try {
      if (isMounted) setLoading(true);
      
      const token = getAuthToken();
      
      if (!token) {
        if (isMounted) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
        }
        return;
      }
      
      const requestConfig = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/architecture/${architectureId}/responses/`,
        requestConfig
      );
      
      if (isMounted) {
        setApiResponse(response.data);
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        if (err.response?.status === 401) {
          const newToken = await refreshAuthToken();
          if (newToken) {
            fetchArchitectureResponses(isMounted);
            return;
          } else {
            setError('Your session has expired. Please log in again.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else if (err.response) {
          setError(`Server error: ${err.response.status} - ${err.response.data?.detail || err.response.data?.error || 'Unknown server error'}`);
        } else if (err.request) {
          setError('Cannot connect to server. Please check if the server is running.');
        } else {
          setError(`Request error: ${err.message}`);
        }
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  const sendToAdmin = async () => {
    try {
      setSendingToAdmin(true);
      setSendStatus(null);
      
      const token = getAuthToken();
      if (!token) {
        setSendStatus({ type: 'error', message: 'No authentication token found' });
        return;
      }
      
      const requestConfig = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        withCredentials: true
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/api/customsentoadmin/${architectureId}/`,
        {},
        requestConfig
      );
      
      setSendStatus({ 
        type: 'success', 
        message: response.data.message || 'Data sent to admin successfully!' 
      });
      
      setTimeout(() => {
        window.location.href = 'http://localhost:5173/architecture';
      }, 1500);
      
    } catch (err) {
      let errorMessage = 'Failed to send data to admin';
      let showUnusedTokens = false;
      
      if (err.response?.status === 401) {
        const newToken = await refreshAuthToken();
        if (newToken) {
          sendToAdmin();
          return;
        } else {
          errorMessage = 'Your session has expired. Please log in again.';
        }
      } else if (err.response?.status === 403) {
        errorMessage = err.response.data?.details || err.response.data?.message || 'Access denied. You can only submit your own data.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Please complete all token submissions before sending to admin.';
        setShowUnusedTokens(true);
        showUnusedTokens = true;
      } else if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setSendStatus({ 
        type: 'error', 
        message: errorMessage,
        showUnusedTokens: showUnusedTokens 
      });
      
      setTimeout(() => {
        setSendStatus(null);
      }, 8000);
    } finally {
      setSendingToAdmin(false);
    }
  };

  // ============================================
  // STUDENT FORM FUNCTIONS
  // ============================================

  const handleSubmitForm = (token) => {
    setSelectedToken(token);
    setShowStudentForm(true);
  };

  const handleStudentFormClose = () => {
    setShowStudentForm(false);
    setSelectedToken(null);
    fetchArchitectureResponses();
  };

  // ============================================
  // IMAGE PROCESSING FUNCTIONS
  // ============================================

  const cropImageToBox = async (field) => {
    if (!imgRef.current) {
      return null;
    }

    const targetWidth = field.imageWidth || 300;
    const targetHeight = field.imageHeight || 300;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    const container = containerRef.current;
    if (!container) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    
    const boxWidth = targetWidth;
    const boxHeight = targetHeight;
    const boxLeft = (containerRect.width - boxWidth) / 2;
    const boxTop = (400 - boxHeight) / 2;

    const scale = zoom;
    const imgElement = imgRef.current;

    const imgXInContainer = position.x;
    const imgYInContainer = position.y;

    const sourceX = (boxLeft - imgXInContainer) / scale;
    const sourceY = (boxTop - imgYInContainer) / scale;
    const sourceWidth = boxWidth / scale;
    const sourceHeight = boxHeight / scale;

    ctx.drawImage(
      imgElement,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async (field) => {
    try {
      if (!imgRef.current) {
        alert('Please select an image first');
        return;
      }
      
      const blob = await cropImageToBox(field);
      if (blob) {
        const base64Image = await blobToBase64(blob);
        const fieldKey = `field_${field.id}`;
        
        setEditFormData(prev => ({
          ...prev,
          [fieldKey]: base64Image
        }));
        
        setImageSrc(null);
        setEditingImageField(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        
        alert(`Image updated successfully! (${field.imageWidth || 300}×${field.imageHeight || 300})`);
      }
    } catch (error) {
      alert('Failed to process image. Please try again.');
    }
  };

  // ============================================
  // TOKEN EDITING FUNCTIONS
  // ============================================

  const handleEditToken = async (token) => {
    try {
      setEditLoading(true);
      setEditingToken(token);
      
      const authToken = getAuthToken();
      const requestConfig = {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.get(
        `${API_BASE_URL}/api/token/${token}/edit/`,
        requestConfig
      );
      
      if (response.data) {
        const processedFields = (response.data.available_fields || []).map(field => {
          let imageWidth = 300;
          let imageHeight = 300;
          
          const fieldType = (field.type || '').toLowerCase();
          
          if (fieldType === 'image' || fieldType === 'photo' || fieldType === 'picture') {
            if (field.options) {
              try {
                let optionsObj = field.options;
                if (typeof field.options === 'string') {
                  try {
                    optionsObj = JSON.parse(field.options);
                  } catch {
                  }
                }
                
                if (typeof optionsObj === 'object' && optionsObj !== null) {
                  imageWidth = parseInt(optionsObj.width) || 
                              parseInt(optionsObj.imageWidth) || 
                              parseInt(optionsObj.image_width) || 
                              imageWidth;
                              
                  imageHeight = parseInt(optionsObj.height) || 
                               parseInt(optionsObj.imageHeight) || 
                               parseInt(optionsObj.image_height) || 
                               imageHeight;
                }
              } catch (e) {
              }
            }
          }
          
          return {
            ...field,
            type: fieldType,
            options: field.options || null,
            imageWidth: imageWidth,
            imageHeight: imageHeight
          };
        });
        
        setEditFormFields(processedFields);
        
        const formData = {};
        if (response.data.responses) {
          response.data.responses.forEach(response => {
            const fieldKey = `field_${response.field_id}`;
            const fieldType = (response.field_type || '').toLowerCase();
            
            if (fieldType === 'checkbox' || fieldType === 'boolean') {
              formData[fieldKey] = response.value === true || response.value === 'true' || response.value === 1;
            } else if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'float' || fieldType === 'decimal') {
              formData[fieldKey] = response.value !== null && response.value !== undefined ? String(response.value) : '';
            } else {
              formData[fieldKey] = response.value !== null && response.value !== undefined ? String(response.value) : '';
            }
          });
        }
        
        setEditFormData(formData);
        setIsEditing(true);
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAuthToken();
        if (newToken) {
          handleEditToken(token);
          return;
        }
      }
      alert('Failed to load token data for editing');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    let hasErrors = false;
    const newValidationErrors = {};
    
    editFormFields.forEach(field => {
      const fieldKey = `field_${field.id}`;
      const value = editFormData[fieldKey];
      const fieldType = (field.type || '').toLowerCase().trim();
      
      const error = validateInput(value, field, fieldType);
      if (error) {
        hasErrors = true;
        newValidationErrors[fieldKey] = error;
      }
    });
    
    if (hasErrors) {
      setValidationErrors(newValidationErrors);
      alert('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      setEditLoading(true);
      const authToken = getAuthToken();
      
      const submitData = {};
      const fieldDefinitions = {};
      editFormFields.forEach(field => {
        fieldDefinitions[`field_${field.id}`] = field;
      });
      
      Object.keys(editFormData).forEach(key => {
        const value = editFormData[key];
        const fieldDef = fieldDefinitions[key];
        
        if (!fieldDef) {
          return;
        }
        
        const fieldType = (fieldDef.type || '').toLowerCase().trim();
        
        if (fieldType === 'image' || fieldType === 'photo' || fieldType === 'picture') {
          if (value && typeof value === 'string' && value.startsWith('data:image')) {
            submitData[key] = value;
          }
        } else if (fieldType === 'checkbox' || fieldType === 'boolean') {
          submitData[key] = value === true;
        } else if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'float' || fieldType === 'decimal') {
          if (value === '' || value === null || value === undefined) {
            submitData[key] = null;
          } else {
            const numValue = Number(value);
            submitData[key] = isNaN(numValue) ? null : numValue;
          }
        } else {
          if (value === '' || value === null || value === undefined) {
            submitData[key] = null;
          } else {
            if (typeof value === 'string') {
              const isAlphanumeric = 
                fieldType === 'alphanumeric' || 
                fieldType === 'alnum' ||
                (fieldDef?.options?.validation === 'alphanumeric');
              
              if (isAlphanumeric) {
                const trimmedValue = value.trim();
                
                if (trimmedValue === '') {
                  if (fieldDef.required) {
                    newValidationErrors[key] = 'Cannot contain only spaces';
                    hasErrors = true;
                    return;
                  } else {
                    submitData[key] = null;
                  }
                } else {
                  submitData[key] = trimmedValue;
                }
              } else if (value.trim() === '' && value.length > 0) {
                if (fieldDef.required) {
                  newValidationErrors[key] = 'Cannot contain only spaces';
                  hasErrors = true;
                  return;
                } else {
                  submitData[key] = null;
                }
              } else {
                submitData[key] = value.trim();
              }
            } else {
              submitData[key] = value;
            }
          }
        }
      });
      
      if (hasErrors) {
        setValidationErrors(prev => ({ ...prev, ...newValidationErrors }));
        setEditLoading(false);
        alert('Please fix validation errors');
        return;
      }
      
      if (Object.keys(submitData).length === 0) {
        alert('No fields to update');
        setEditLoading(false);
        return;
      }

      const requestConfig = {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/api/token/${editingToken}/edit/`,
        submitData,
        requestConfig
      );
      
      alert('Token responses updated successfully!');
      setIsEditing(false);
      setEditingToken(null);
      setEditFormData({});
      setEditFormFields([]);
      setEditingImageField(null);
      setImageSrc(null);
      setValidationErrors({});
      fetchArchitectureResponses();
      
    } catch (err) {
      let errorMessage = 'Failed to update token responses';
      if (err.response?.data) {
        if (err.response.data.details) {
          errorMessage = JSON.stringify(err.response.data.details);
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      
      alert(`Error: ${errorMessage}`);
      
      if (err.response?.status === 401) {
        const newToken = await refreshAuthToken();
        if (newToken) {
          handleEditSubmit(e);
          return;
        }
      }
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleDeleteToken = async (token) => {
    if (window.confirm(`Are you sure you want to delete token ${token}? This action cannot be undone.`)) {
      try {
        const authToken = getAuthToken();
        const requestConfig = {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };
        
        await axios.delete(
          `${API_BASE_URL}/api/token/${token}/delete/`,
          requestConfig
        );
        
        fetchArchitectureResponses();
        alert('Token deleted successfully');
      } catch (err) {
        alert('Failed to delete token');
      }
    }
  };

  const handleContextMenu = (e, token, type = 'submitted') => {
    e.preventDefault();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      token: token,
      type: type
    });
  };

  // ============================================
  // SEARCH FUNCTION
  // ============================================

  const filterSubmittedTokens = (tokens, groupedResponses, searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return tokens;
    }
    
    const safeSearchTerm = searchTerm.toLowerCase().trim();
    
    return tokens.filter(token => {
      if (token && String(token).toLowerCase().includes(safeSearchTerm)) {
        return true;
      }
      
      const tokenResponses = groupedResponses[token]?.responses || {};
      
      for (const fieldLabel in tokenResponses) {
        const response = tokenResponses[fieldLabel];
        if (response) {
          const displayValue = response.displayValue;
          
          let searchableValue = '';
          
          if (displayValue === null || displayValue === undefined) {
            searchableValue = '';
          } else if (typeof displayValue === 'object') {
            if (displayValue.props && displayValue.props.children) {
              if (Array.isArray(displayValue.props.children)) {
                searchableValue = displayValue.props.children
                  .filter(child => typeof child === 'string')
                  .join(' ');
              } else if (typeof displayValue.props.children === 'string') {
                searchableValue = displayValue.props.children;
              }
            }
          } else {
            searchableValue = String(displayValue);
          }
          
          if (searchableValue.toLowerCase().includes(safeSearchTerm)) {
            return true;
          }
          
          if (response.value) {
            const rawValueStr = String(response.value).toLowerCase();
            if (rawValueStr.includes(safeSearchTerm)) {
              return true;
            }
          }
          
          if (fieldLabel && fieldLabel.toLowerCase().includes(safeSearchTerm)) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  // ============================================
  // EFFECT HOOKS
  // ============================================

  useEffect(() => {
    let isMounted = true;
    
    const token = getAuthToken();
    
    if (!token) {
      if (isMounted) {
        setError('Please log in to access this page');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
      return;
    }
    
    if (architectureId) {
      fetchArchitectureResponses(isMounted);
    }
    
    return () => {
      isMounted = false;
    };
  }, [architectureId]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, token: null, type: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageSrc) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStartPinch, { passive: false });
    container.addEventListener('touchmove', handleTouchMovePinch, { passive: false });
    container.addEventListener('touchend', handleTouchEndPinch);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStartPinch);
      container.removeEventListener('touchmove', handleTouchMovePinch);
      container.removeEventListener('touchend', handleTouchEndPinch);
    };
  }, [imageSrc, handleWheel, handleTouchStartPinch, handleTouchMovePinch, handleTouchEndPinch]);

  // ============================================
  // RENDERING HELPER FUNCTIONS
  // ============================================

  const renderImageUpload = (field) => {
    const boxWidth = field.imageWidth || 300;
    const boxHeight = field.imageHeight || 300;

    return (
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
        {!imageSrc && !webcamActive && (
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 cursor-pointer">
              <span className="bg-blue-500 text-white px-4 py-2 rounded inline-block text-center w-full">
                <i className="fas fa-upload mr-2"></i>Upload Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageSrc(URL.createObjectURL(file));
                    setWebcamActive(false);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }
                }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setWebcamActive(true);
                setImageSrc(null);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="bg-green-500 text-white px-4 py-2 rounded flex-1"
            >
              <i className="fas fa-camera mr-2"></i>Use Webcam
            </button>
          </div>
        )}

        {webcamActive && (
          <div className="space-y-3">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded border w-full"
              screenshotQuality={0.9}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const screenshot = webcamRef.current.getScreenshot();
                  setImageSrc(screenshot);
                  setWebcamActive(false);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
              >
                <i className="fas fa-camera mr-2"></i>Capture
              </button>
              <button
                type="button"
                onClick={() => setWebcamActive(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
              >
                <i className="fas fa-times mr-2"></i>Cancel
              </button>
            </div>
          </div>
        )}

        {imageSrc && (
          <div className="space-y-3">
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-blue-700 font-medium">
                Required Size: {boxWidth} × {boxHeight} pixels
              </p>
              <p className="text-sm text-blue-600">
                • Drag to move image • Mouse wheel to zoom • Pinch to zoom on touch
              </p>
            </div>

            <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-sm font-medium">Zoom:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                  title="Zoom Out"
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                  title="Zoom In"
                >
                  <i className="fas fa-search-plus"></i>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative overflow-hidden rounded border-2 border-dashed border-blue-400 bg-gray-100 mx-auto"
              style={{ 
                width: '100%', 
                height: '400px',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                handleTouchStart(e);
                handleTouchStartPinch(e);
              }}
              onTouchMove={(e) => {
                handleTouchMove(e);
                handleTouchMovePinch(e);
              }}
              onTouchEnd={(e) => {
                handleTouchEnd(e);
                handleTouchEndPinch(e);
              }}
            >
              {imageSrc && (
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Adjust and crop"
                  className="absolute max-w-none"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: '0 0',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onLoad={() => {
                    if (imgRef.current && containerRef.current) {
                      const imgWidth = imgRef.current.naturalWidth;
                      const imgHeight = imgRef.current.naturalHeight;
                      const containerWidth = containerRef.current.clientWidth;
                      const containerHeight = 400;
                      
                      const initialX = (containerWidth - imgWidth) / 2;
                      const initialY = (containerHeight - imgHeight) / 2;
                      
                      setPosition({ x: initialX, y: initialY });
                    }
                  }}
                />
              )}

              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-500 bg-transparent pointer-events-none"
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="absolute -top-6 left-0 right-0 text-center">
                  <span className="bg-red-500 text-white px-2 py-1 text-sm rounded">
                    {boxWidth} × {boxHeight}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Red box shows exactly what will be saved - Position your image perfectly</p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleImageUpload(field)}
                className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
              >
                <i className="fas fa-crop mr-2"></i>Save Image ({boxWidth}×{boxHeight})
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
              >
                <i className="fas fa-times mr-2"></i>Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFieldInput = (field) => {
    const fieldKey = `field_${field.id}`;
    const value = editFormData[fieldKey];
    const validationError = validationErrors[fieldKey];
    
    if (editingImageField === field.id) {
      return renderImageUpload(field);
    }
    
    const fieldType = (field.type || '').toLowerCase().trim();
    
    const handleChangeWithValidation = (newValue) => {
      const error = validateInput(newValue, field, fieldType);
      setValidationErrors(prev => ({
        ...prev,
        [fieldKey]: error
      }));
      handleInputChange(fieldKey, newValue);
    };

    switch (fieldType) {
      case 'checkbox':
      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChangeWithValidation(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              min={field.options?.minDate}
              max={field.options?.maxDate}
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
          </div>
        );
        
      case 'number':
      case 'integer':
      case 'float':
      case 'decimal':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={value !== undefined && value !== null ? value : ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              step={fieldType === 'integer' ? '1' : 'any'}
              min={field.options?.min}
              max={field.options?.max}
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
            {field.options?.min !== undefined && field.options?.max !== undefined && (
              <p className="text-xs text-gray-500">
                Range: {field.options.min} - {field.options.max}
              </p>
            )}
          </div>
        );
        
      case 'dropdown':
      case 'select':
      case 'choice':
      case 'choices':
        let optionsArray = [];
        
        if (field.options) {
          if (typeof field.options === 'string') {
            try {
              const parsed = JSON.parse(field.options);
              if (parsed && typeof parsed === 'object') {
                if (parsed.choices && Array.isArray(parsed.choices)) {
                  optionsArray = parsed.choices;
                } else if (Array.isArray(parsed)) {
                  optionsArray = parsed;
                } else {
                  optionsArray = Object.values(parsed);
                }
              }
            } catch {
              optionsArray = field.options.split(',').map(opt => opt.trim());
            }
          } else if (Array.isArray(field.options)) {
            optionsArray = field.options;
          } else if (typeof field.options === 'object') {
            if (field.options.choices && Array.isArray(field.options.choices)) {
              optionsArray = field.options.choices;
            } else {
              optionsArray = Object.values(field.options);
            }
          }
        }
        
        return (
          <div className="space-y-2">
            <select
              value={value || ''}
              onChange={(e) => {
                handleChangeWithValidation(e.target.value);
                setValidationErrors(prev => ({
                  ...prev,
                  [fieldKey]: null
                }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {optionsArray.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-2">
            <input
              type="email"
              value={value || ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              onBlur={(e) => handleChangeWithValidation(e.target.value)}
              placeholder={field.placeholder || "Enter email address"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationError ? (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            ) : (
              value && (
                <p className="text-xs text-green-600">
                  <a href={`mailto:${value}`} className="underline">{value}</a>
                </p>
              )
            )}
          </div>
        );
        
      case 'phone':
      case 'phonenumber':
      case 'phone_number':
      case 'tel':
      case 'telephone':
        return (
          <div className="space-y-2">
            <input
              type="tel"
              value={value || ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              onBlur={(e) => handleChangeWithValidation(e.target.value)}
              placeholder={field.placeholder || "Enter phone number"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationError ? (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            ) : (
              value && (
                <p className="text-xs text-green-600">
                  <a href={`tel:${value.replace(/\s+/g, '')}`} className="underline">{value}</a>
                </p>
              )
            )}
            <p className="text-xs text-gray-400">Format: +1 (555) 123-4567</p>
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              placeholder={field.placeholder}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={field.options?.maxLength}
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
            {field.options?.maxLength && (
              <p className="text-xs text-gray-500">
                Max length: {field.options.maxLength} characters
              </p>
            )}
          </div>
        );
        
      case 'url':
      case 'link':
      case 'website':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleChangeWithValidation(e.target.value)}
              onBlur={(e) => handleChangeWithValidation(e.target.value)}
              placeholder={field.placeholder || "https://example.com"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationError ? (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            ) : (
              value && (
                <p className="text-xs text-blue-600">
                  <a href={value.startsWith('http') ? value : `https://${value}`} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="underline">
                    {value.length > 30 ? value.substring(0, 30) + '...' : value}
                  </a>
                </p>
              )
            )}
          </div>
        );
        
      case 'image':
      case 'photo':
      case 'picture':
        const hasExistingImage = value && typeof value === 'string' && value.startsWith('data:image');
        
        return (
          <div className="space-y-3">
            {hasExistingImage ? (
              <div className="flex flex-col items-start space-y-3">
                <div className="flex items-center space-x-3">
                  <ImageThumbnail src={value} alt="Current" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Current Image</p>
                    <p>Required Size: {field.imageWidth || 300}×{field.imageHeight || 300}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingImageField(field.id);
                    setImageSrc(null);
                    setWebcamActive(false);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  <i className="fas fa-edit mr-2"></i>Change Image
                </button>
              </div>
            ) : (
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-3">No image uploaded</p>
                <p className="text-xs text-gray-400 mb-2">Required Size: {field.imageWidth || 300}×{field.imageHeight || 300}</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingImageField(field.id);
                    setImageSrc(null);
                    setWebcamActive(false);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  <i className="fas fa-upload mr-2"></i>Upload Image
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        const isLettersOnly = 
          fieldType === 'textonly' || 
          fieldType === 'letters' || 
          fieldType === 'alpha' ||
          (field?.options?.validation === 'letters-only') ||
          (field.label?.toLowerCase().includes('name') && !field.label?.toLowerCase().includes('email'));
        
        const isAlphanumeric = 
          fieldType === 'alphanumeric' || 
          fieldType === 'alnum' ||
          (field?.options?.validation === 'alphanumeric') ||
          (field.label?.toLowerCase().includes('address') || 
           field.label?.toLowerCase().includes('id') ||
           field.label?.toLowerCase().includes('code') ||
           field.label?.toLowerCase().includes('number'));
        
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                let newValue = e.target.value;
                
                if (isLettersOnly) {
                  newValue = newValue.replace(/[^A-Za-z\s]/g, '');
                  newValue = newValue.replace(/\s+/g, ' ');
                } else if (isAlphanumeric) {
                  newValue = newValue.replace(/[^A-Za-z0-9\s]/g, '');
                  newValue = newValue.replace(/\s+/g, ' ');
                }
                
                handleChangeWithValidation(newValue);
              }}
              onKeyPress={(e) => {
                if (isLettersOnly) {
                  const key = e.key;
                  if (key === 'Backspace' || key === 'Delete' || key === 'Tab' || 
                      key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || 
                      key === 'End' || key === ' ') {
                    return;
                  }
                  if (!/^[A-Za-z]$/.test(key)) {
                    e.preventDefault();
                  }
                } else if (isAlphanumeric) {
                  const key = e.key;
                  if (key === 'Backspace' || key === 'Delete' || key === 'Tab' || 
                      key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || 
                      key === 'End' || key === ' ') {
                    return;
                  }
                  if (!/^[A-Za-z0-9]$/.test(key)) {
                    e.preventDefault();
                  }
                }
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val && typeof val === 'string' && val.trim() === '' && val.length > 0) {
                  setValidationErrors(prev => ({
                    ...prev,
                    [fieldKey]: field.required ? 'Cannot contain only spaces' : null
                  }));
                }
              }}
              placeholder={field.placeholder || `Enter ${field.label}`}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={field.options?.maxLength}
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
            {field.options?.maxLength && (
              <p className="text-xs text-gray-500">
                Max length: {field.options.maxLength} characters
              </p>
            )}
            {isLettersOnly && (
              <p className="text-xs text-blue-500">
                Only letters (A-Z, a-z) and spaces allowed
              </p>
            )}
            {isAlphanumeric && (
              <p className="text-xs text-blue-500">
                Only letters, numbers, and spaces allowed
              </p>
            )}
          </div>
        );
    }
  };

  const renderEditModal = () => {
    if (!isEditing) return null;

    return (
      <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Token Responses: {editingToken}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Update the field values for this token
            </p>
          </div>
          
          <form onSubmit={handleEditSubmit}>
            <div className="p-6">
              {editLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="ml-3 text-gray-600">Loading form data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editFormFields.map((field) => (
                    <div key={field.id} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        <span className="ml-2 text-xs text-gray-500 capitalize">({field.type})</span>
                        {field.type === 'image' && (
                          <span className="ml-2 text-xs text-blue-500">
                            {field.imageWidth || 300}×{field.imageHeight || 300}
                          </span>
                        )}
                      </label>
                      
                      {renderFieldInput(field)}
                      
                      {field.placeholder && (
                        <p className="text-xs text-gray-500">Placeholder: {field.placeholder}</p>
                      )}
                      
                      {field.options && field.type !== 'image' && (
                        <p className="text-xs text-gray-500">
                          Options: {typeof field.options === 'string' 
                            ? field.options 
                            : Array.isArray(field.options) 
                              ? field.options.join(', ') 
                              : JSON.stringify(field.options)}
                        </p>
                      )}
                      
                      <div className="flex justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {field.required ? 'Required' : 'Optional'}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Order: {field.order}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Fields: {editFormFields.length} | 
                Required: {editFormFields.filter(f => f.required).length}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update Responses'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const groupResponsesByToken = () => {
    if (!data || !data.responses) return {};

    const grouped = {};
    data.responses.forEach(response => {
      const token = response.token || 'not-submitted';
      if (!grouped[token]) {
        grouped[token] = {
          token: token,
          responses: {},
          submissionId: response.submission_id,
          architectureName: response.architecture_name,
          timestamp: response.timestamp
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
        displayValue = response.value_text;
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

  const formatValue = (value, fieldType) => {
    if (value === null || value === undefined || value === '') return '-';
    
    const type = (fieldType || '').toLowerCase().trim();
    
    if (type === 'email') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-blue-500">📧</span>
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        </div>
      );
    }
    
    if (type === 'phonenumber' || type === 'phone' || type === 'tel' || type === 'telephone') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-green-500">📱</span>
          <a 
            href={`tel:${value.replace(/\s+/g, '')}`} 
            className="text-green-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        </div>
      );
    }
    
    switch (type) {
      case 'date':
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
          return value;
        } catch (e) {
          return value;
        }
      
      case 'checkbox':
      case 'boolean':
        return value === true || value === 'true' || value === 1 ? '✅ Yes' : '❌ No';
      
      case 'url':
      case 'link':
      case 'website':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span>🔗</span>
            {value.length > 30 ? value.substring(0, 30) + '...' : value}
          </a>
        );
      
      case 'number':
      case 'integer':
      case 'float':
      case 'decimal':
        return value;
      
      default:
        return String(value);
    }
  };

  const getAllTokens = () => {
    if (!data) return [];
    
    const submittedTokens = data.responses 
      ? [...new Set(data.responses.map(response => response.token).filter(Boolean))]
      : [];
    
    const allTokens = data.tokens || [];
    const unusedTokens = allTokens.filter(token => !submittedTokens.includes(token));
    
    return {
      submitted: submittedTokens,
      unused: unusedTokens,
      all: allTokens
    };
  };

  const manualRetry = () => {
    fetchArchitectureResponses();
  };

  // ============================================
  // RENDER LOGIC
  // ============================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={goBack}
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Architectures
        </button>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading architecture responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={goBack}
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Architectures
        </button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-3 space-x-2">
                <button
                  onClick={manualRetry}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                >
                  Retry
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                >
                  Debug Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || (data.token_count === 0 && (!data.responses || data.responses.length === 0))) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  mt-20 py-8">
        <button
          onClick={goBack}
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Architectures
        </button>

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Architecture Responses: {data?.architecture_name || 'Unknown Architecture'}
            </h2>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-800">No Data Available</h3>
          <p className="text-sm text-yellow-700 mt-1">
            This architecture doesn't have any tokens or responses yet.
          </p>
        </div>
      </div>
    );
  }

  if (showStudentForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleStudentFormClose}
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Architecture Responses
        </button>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Submit Form for Token: {selectedToken}
          </h2>
          <StudentForm 
            preFilledToken={selectedToken}
            onClose={handleStudentFormClose}
          />
        </div>
      </div>
    );
  }

  const groupedResponses = groupResponsesByToken();
  const tokens = getAllTokens();
  
  const allFieldLabels = [...new Set(data.responses
    .filter(response => response.field_label)
    .map(response => response.field_label))];

  const filteredSubmittedTokens = filterSubmittedTokens(
    tokens.submitted, 
    groupedResponses, 
    searchTerm
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubmittedTokens.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSubmittedTokens.length / recordsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-27">
      {renderEditModal()}

      {contextMenu.show && (
        <div 
          className="fixed bg-white shadow-lg rounded-md py-2 z-50 border border-gray-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'submitted' && (
            <button
              onClick={() => {
                handleEditToken(contextMenu.token);
                setContextMenu({ show: false, x: 0, y: 0, token: null, type: null });
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          <button
            onClick={() => {
              handleDeleteToken(contextMenu.token);
              setContextMenu({ show: false, x: 0, y: 0, token: null, type: null });
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      <button
        onClick={goBack}
        className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Architectures
      </button>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Architecture Responses: {data.architecture_name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Architecture ID: {architectureId}
              {data && ` • Total Tokens: ${tokens.all.length} • Submitted: ${tokens.submitted.length} • Unused: ${tokens.unused.length}`}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="text-right">
              <button
                onClick={sendToAdmin}
                disabled={sendingToAdmin}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  sendingToAdmin 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {sendingToAdmin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send for ID Card Processing
                  </>
                )}
              </button>
              
              <div className="text-xs text-gray-500 mt-1 max-w-xs">
                {tokens.unused.length > 0 
                  ? `${tokens.unused.length} unused tokens remaining - complete all to send` 
                  : 'Send all completed data for ID card processing'
                }
              </div>
            </div>
            
            {sendStatus && (
              <div className={`text-xs px-3 py-2 rounded max-w-md ${
                sendStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className="font-medium mb-1">
                  {sendStatus.type === 'success' ? 'Success!' : 'Unable to Send'}
                </div>
                <div>{sendStatus.message}</div>
                {sendStatus.type === 'error' && sendStatus.showUnusedTokens && (
                  <div className="mt-2 text-red-700 font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Please check unused tokens below
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-3 bg-blue-50 border-b">
          <div className="flex justify-between items-center">
            <button
              onClick={() => fetchArchitectureResponses()}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <div className="text-sm text-blue-700">
              Click "Send for ID Card Processing" to submit all completed data to administrators
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Submitted Token Responses ({filteredSubmittedTokens.length} of {tokens.submitted.length})
          </h3>
          
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Token or any field value..."
                className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value || '')}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="text-sm text-gray-600 mt-2">
                Found {filteredSubmittedTokens.length} of {tokens.submitted.length} matching records
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Searching in: Token and all form fields
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr. No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                {allFieldLabels.map((fieldLabel, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {fieldLabel}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.length > 0 ? (
                currentRecords.map((token, index) => {
                  const actualIndex = indexOfFirstRecord + index + 1;
                  return (
                    <tr key={token} onContextMenu={(e) => handleContextMenu(e, token, 'submitted')} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {actualIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {token}
                      </td>
                      {allFieldLabels.map((fieldLabel, fieldIndex) => {
                        const response = groupedResponses[token]?.responses[fieldLabel];
                        return (
                          <td key={fieldIndex} className="px-6 py-4 text-sm text-gray-900">
                            {response ? (
                              (() => {
                                const displayValue = response.displayValue;
                                const fieldType = response.fieldType;
                                
                                if (fieldType === 'image' || fieldType === 'photo' || fieldType === 'picture') {
                                  return displayValue ? (
                                    <div className="relative">
                                      <img 
                                        src={displayValue} 
                                        alt={fieldLabel}
                                        className="h-16 w-16 object-cover rounded-md border border-gray-200 cursor-pointer hover:border-blue-500 transition-all"
                                        onClick={() => {
                                          const modal = document.createElement('div');
                                          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                          modal.onclick = () => document.body.removeChild(modal);
                                          modal.innerHTML = `
                                            <div class="relative max-w-4xl max-h-full">
                                              <img src="${displayValue}" class="max-w-full max-h-full object-contain rounded-lg" />
                                              <button class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">✕</button>
                                            </div>
                                          `;
                                          document.body.appendChild(modal);
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                                        }}
                                      />
                                    </div>
                                  ) : '-';
                                }
                                
                                return formatValue(displayValue, fieldType);
                              })()
                            ) : '-'}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditToken(token)}
                          className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                          title="Edit token responses"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteToken(token)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete token"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={allFieldLabels.length + 3} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching records found' : 'No submitted tokens available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredSubmittedTokens.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
                <span className="text-sm text-gray-700">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredSubmittedTokens.length)} of {filteredSubmittedTokens.length} records
                </span>
                <select
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {recordsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                      {option} per page
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === totalPages || totalPages === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === totalPages || totalPages === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showUnusedTokens || tokens.unused.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-yellow-50">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Unused Tokens ({tokens.unused.length})
              </h3>
              <p className="text-sm text-yellow-600 mt-1">
                Complete these forms to enable ID card processing
              </p>
            </div>
            <button
              onClick={() => setShowUnusedTokens(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              Hide
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.unused.map((token) => (
                <div 
                  key={token} 
                  className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 hover:bg-yellow-100 transition-colors duration-200 cursor-pointer shadow-sm"
                  onClick={() => handleSubmitForm(token)}
                  onContextMenu={(e) => handleContextMenu(e, token, 'unused')}
                  title="Click to submit form for this token. Right-click for delete option."
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-lg font-semibold text-yellow-800">{token}</div>
                      <div className="text-sm text-yellow-600">Not Submitted</div>
                    </div>
                    <div className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded font-medium">
                      Click to Submit
                    </div>
                  </div>
                  <div className="text-xs text-yellow-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete this form to proceed with ID card processing
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureResponsesView;