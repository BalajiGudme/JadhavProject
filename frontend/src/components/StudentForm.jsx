// import { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import Webcam from "react-webcam";
// import './FormStyles.css';

// const API_BASE_URL = 'http://localhost:8000/api';

// const StudentForm = () => {
//   const [selectedForm, setSelectedForm] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [token, setToken] = useState('');
//   const [tokenValidated, setTokenValidated] = useState(false);
//   const [tokenInfo, setTokenInfo] = useState(null);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [backendErrors, setBackendErrors] = useState({});

//   // Image state
//   const [imageSrc, setImageSrc] = useState(null);
//   const [webcamActive, setWebcamActive] = useState(false);
//   const [zoom, setZoom] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
//   // Refs
//   const imgRef = useRef(null);
//   const webcamRef = useRef(null);
//   const containerRef = useRef(null);

//   // Validation functions
//   const validateEmail = (value) => {
//     if (!value) return '';
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(value) ? '' : 'Please enter a valid email address';
//   };

//   // const validateMobile = (value) => {
//   //   if (!value) return '';
//   //   // Remove all non-digits for validation
//   //   const digitsOnly = value.replace(/\D/g, '');
//   //   if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
//   //     return '';
//   //   }
//   //   return 'Please enter a valid phone number (10-15 digits)';
//   // };
// const validateMobile = (value) => {
//   if (!value) return '';
//   // Remove all non-digits for validation
//   const digitsOnly = value.replace(/\D/g, '');
//   if (digitsOnly.length === 10) {
//     return '';
//   }
//   return 'Please enter exactly 10 digits';
// };
//   const validateAlphanumeric = (value, fieldOptions) => {
//   if (!value) return '';
  
//   // Check if value contains only letters, numbers, and spaces
//   const alphanumericWithSpacesRegex = /^[a-zA-Z0-9\s]+$/;  // Added \s to allow spaces
//   if (!alphanumericWithSpacesRegex.test(value)) {
//     return 'Only letters, numbers, and spaces are allowed';
//   }
  
//   if (fieldOptions?.minLength && value.length < fieldOptions.minLength) {
//     return `Minimum ${fieldOptions.minLength} characters required`;
//   }
  
//   if (fieldOptions?.maxLength && value.length > fieldOptions.maxLength) {
//     return `Maximum ${fieldOptions.maxLength} characters allowed`;
//   }
  
//   return '';
// };

//   const validateDate = (value, fieldOptions) => {
//     if (!value) return '';
    
//     // Check date format
//     const date = new Date(value);
//     if (isNaN(date.getTime())) {
//       return 'Please enter a valid date';
//     }
    
//     // Check year is 4 digits
//     const year = value.split('-')[0];
//     if (year && year.length !== 4) {
//       return 'Year must be 4 digits (YYYY format)';
//     }
    
//     return '';
//   };

//   const validateNumber = (value, fieldOptions) => {
//     if (value === '' || value === null || value === undefined) return '';
    
//     const numValue = Number(value);
    
//     if (isNaN(numValue)) {
//       return 'Please enter a valid number';
//     }
    
//     if (fieldOptions?.min !== undefined && numValue < fieldOptions.min) {
//       return `Minimum value is ${fieldOptions.min}`;
//     }
    
//     if (fieldOptions?.max !== undefined && numValue > fieldOptions.max) {
//       return `Maximum value is ${fieldOptions.max}`;
//     }
    
//     return '';
//   };

//   const validateText = (value, fieldOptions) => {
//   if (!value) return '';
  
//   // Check if value contains only letters and spaces
//   const lettersAndSpacesRegex = /^[A-Za-z\s]+$/;  // Added \s to allow spaces
//   if (!lettersAndSpacesRegex.test(value)) {
//     return 'Only letters and spaces are allowed';
//   }
  
//   if (fieldOptions?.minLength && value.length < fieldOptions.minLength) {
//     return `Minimum ${fieldOptions.minLength} characters required`;
//   }
  
//   if (fieldOptions?.maxLength && value.length > fieldOptions.maxLength) {
//     return `Maximum ${fieldOptions.maxLength} characters allowed`;
//   }
  
//   return '';
// };
//   // Main validation handler
//   const handleValidation = (fieldId, value, fieldType, isRequired, fieldOptions = {}) => {
//     let error = '';
    
//     // Check required field
//     if (isRequired && (value === '' || value === null || value === undefined || value === false)) {
//       error = 'This field is required';
//     } else if (value && value !== '' && value !== false) {
//       // Type-specific validation (only if there's a value)
//       switch (fieldType) {
//         case 'email':
//           error = validateEmail(value);
//           break;
//         case 'phonenumber':
//           error = validateMobile(value);
//           break;
//         case 'alphanumeric':
//           error = validateAlphanumeric(value, fieldOptions);
//           break;
//         case 'date':
//           error = validateDate(value, fieldOptions);
//           break;
//         case 'number':
//           error = validateNumber(value, fieldOptions);
//           break;
//         case 'text':
//           error = validateText(value, fieldOptions);
//           break;
//         default:
//           error = '';
//       }
//     }
    
//     setFieldErrors(prev => ({
//       ...prev,
//       [fieldId]: error
//     }));
    
//     return error;
//   };

//   // Clear field error on focus
//   const clearFieldError = (fieldId) => {
//     setFieldErrors(prev => ({
//       ...prev,
//       [fieldId]: ''
//     }));
//     setBackendErrors(prev => ({
//       ...prev,
//       [fieldId]: ''
//     }));
//   };

//   // Validate all fields before submission
//   const validateAllFields = () => {
//     const errors = {};
//     let hasErrors = false;
    
//     if (!selectedForm) return false;
    
//     selectedForm.fields.forEach(field => {
//       const value = formData[field.id];
//       const fieldType = field.field_type;
//       const isRequired = field.is_required || field.required || false; // Check both possible property names
      
//       const error = handleValidation(field.id, value, fieldType, isRequired, field.options);
      
//       if (error) {
//         errors[field.id] = error;
//         hasErrors = true;
//       }
//     });
    
//     setFieldErrors(errors);
//     return !hasErrors;
//   };

//   const validateToken = async () => {
//     if (!token.trim()) {
//       setError("Please enter a token");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
      
//       const requestData = { token: token.trim() };
      
//       const response = await axios.post(
//         `${API_BASE_URL}/form-tokens/validate-token/`, 
//         requestData,
//         {
//           headers: { 'Content-Type': 'application/json' },
//           timeout: 10000
//         }
//       );
      
//       if (response.data.valid) {
//         setTokenValidated(true);
//         setSelectedForm(response.data.form);
//         setTokenInfo(response.data);
//         setError(null);
//         setFieldErrors({});
//         setBackendErrors({});
//       } else {
//         setError(response.data.error || "Invalid token");
//         setTokenValidated(false);
//       }
//     } catch (err) {
//       console.error("Token validation error:", err);
//       setError("Failed to validate token. Please check your connection and try again.");
//       setTokenValidated(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (fieldId, value) => {
//     setFormData((prev) => ({ ...prev, [fieldId]: value }));
//   };

//   // Handle input change with validation
//   const handleInputChangeWithValidation = (fieldId, value, fieldType, isRequired, fieldOptions = {}) => {
//     handleInputChange(fieldId, value);
//     handleValidation(fieldId, value, fieldType, isRequired, fieldOptions);
//   };

//   // Mouse events for dragging image
//   const handleMouseDown = (e) => {
//     if (!imageSrc) return;
//     e.preventDefault();
//     setIsDragging(true);
//     setLastMousePos({ x: e.clientX, y: e.clientY });
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging || !imageSrc) return;
    
//     const deltaX = e.clientX - lastMousePos.x;
//     const deltaY = e.clientY - lastMousePos.y;
    
//     setPosition(prev => ({
//       x: prev.x + deltaX,
//       y: prev.y + deltaY
//     }));
    
//     setLastMousePos({ x: e.clientX, y: e.clientY });
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   // Touch events for mobile
//   const handleTouchStart = (e) => {
//     if (!imageSrc) return;
//     e.preventDefault();
//     setIsDragging(true);
//     const touch = e.touches[0];
//     setLastMousePos({ x: touch.clientX, y: touch.clientY });
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging || !imageSrc) return;
//     e.preventDefault();
    
//     const touch = e.touches[0];
//     const deltaX = touch.clientX - lastMousePos.x;
//     const deltaY = touch.clientY - lastMousePos.y;
    
//     setPosition(prev => ({
//       x: prev.x + deltaX,
//       y: prev.y + deltaY
//     }));
    
//     setLastMousePos({ x: touch.clientX, y: touch.clientY });
//   };

//   const handleTouchEnd = () => {
//     setIsDragging(false);
//   };

//   // Mouse wheel zoom
//   const handleWheel = useCallback((e) => {
//     if (!imageSrc) return;
    
//     e.preventDefault();
//     const delta = e.deltaY > 0 ? -0.1 : 0.1;
//     const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
//     setZoom(newZoom);
//   }, [imageSrc, zoom]);

//   // Touch pinch-to-zoom
//   const [lastTouchDistance, setLastTouchDistance] = useState(null);

//   const handleTouchStartPinch = useCallback((e) => {
//     if (e.touches.length === 2) {
//       e.preventDefault();
//       const touch1 = e.touches[0];
//       const touch2 = e.touches[1];
//       const distance = Math.hypot(
//         touch2.clientX - touch1.clientX,
//         touch2.clientY - touch1.clientY
//       );
//       setLastTouchDistance(distance);
//     }
//   }, []);

//   const handleTouchMovePinch = useCallback((e) => {
//     if (e.touches.length === 2 && lastTouchDistance !== null) {
//       e.preventDefault();
//       const touch1 = e.touches[0];
//       const touch2 = e.touches[1];
//       const distance = Math.hypot(
//         touch2.clientX - touch1.clientX,
//         touch2.clientY - touch1.clientY
//       );
      
//       const zoomFactor = distance / lastTouchDistance;
//       const newZoom = Math.min(Math.max(0.5, zoom * zoomFactor), 3);
//       setZoom(newZoom);
//       setLastTouchDistance(distance);
//     }
//   }, [lastTouchDistance, zoom]);

//   const handleTouchEndPinch = useCallback(() => {
//     setLastTouchDistance(null);
//   }, []);

//   // Add event listeners for wheel and touch zoom
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container || !imageSrc) return;

//     container.addEventListener('wheel', handleWheel, { passive: false });
//     container.addEventListener('touchstart', handleTouchStartPinch, { passive: false });
//     container.addEventListener('touchmove', handleTouchMovePinch, { passive: false });
//     container.addEventListener('touchend', handleTouchEndPinch);

//     return () => {
//       container.removeEventListener('wheel', handleWheel);
//       container.removeEventListener('touchstart', handleTouchStartPinch);
//       container.removeEventListener('touchmove', handleTouchMovePinch);
//       container.removeEventListener('touchend', handleTouchEndPinch);
//     };
//   }, [imageSrc, handleWheel, handleTouchStartPinch, handleTouchMovePinch, handleTouchEndPinch]);

//   // Crop image to fit the box exactly
//   const cropImageToBox = async (field) => {
//     if (!imgRef.current || !field.options) return null;

//     const canvas = document.createElement('canvas');
//     const targetWidth = field.options.width || 300;
//     const targetHeight = field.options.height || 300;

//     canvas.width = targetWidth;
//     canvas.height = targetHeight;
//     const ctx = canvas.getContext('2d');

//     const container = containerRef.current;
//     if (!container) return null;

//     const containerRect = container.getBoundingClientRect();
    
//     // Calculate the position and size of the red box in the container
//     const boxWidth = Math.min(targetWidth, containerRect.width - 40);
//     const boxHeight = Math.min(targetHeight, 300);
//     const boxLeft = (containerRect.width - boxWidth) / 2;
//     const boxTop = (containerRect.height - boxHeight) / 2;

//     const scale = zoom;
//     const imgElement = imgRef.current;

//     const imgXInContainer = position.x;
//     const imgYInContainer = position.y;

//     const sourceX = (boxLeft - imgXInContainer) / scale;
//     const sourceY = (boxTop - imgYInContainer) / scale;
//     const sourceWidth = boxWidth / scale;
//     const sourceHeight = boxHeight / scale;

//     ctx.drawImage(
//       imgElement,
//       sourceX,
//       sourceY,
//       sourceWidth,
//       sourceHeight,
//       0,
//       0,
//       targetWidth,
//       targetHeight
//     );

//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
//     });
//   };

//   // Helper function to convert blob to base64
//   const blobToBase64 = (blob) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   // Reset form state
//   const resetForm = () => {
//     setFormData({});
//     setImageSrc(null);
//     setWebcamActive(false);
//     setZoom(1);
//     setPosition({ x: 0, y: 0 });
//     setToken("");
//     setTokenValidated(false);
//     setTokenInfo(null);
//     setError(null);
//     setSelectedForm(null);
//     setFieldErrors({});
//     setBackendErrors({});
//   };

//   // Handle back to token entry
//   const handleBackToTokenEntry = () => {
//     resetForm();
//   };

//   // Process backend validation errors
//   const processBackendErrors = (errorResponse) => {
//     const backendErrorState = {};
    
//     if (errorResponse.data) {
//       // Handle missing fields errors
//       if (errorResponse.data.missing_fields) {
//         errorResponse.data.missing_fields.forEach(field => {
//           backendErrorState[field.field_id] = field.message;
//         });
//       }
      
//       // Handle empty fields errors
//       if (errorResponse.data.empty_fields) {
//         errorResponse.data.empty_fields.forEach(field => {
//           backendErrorState[field.field_id] = field.message;
//         });
//       }
      
//       // Handle unique field errors
//       if (errorResponse.data.unique_field_errors) {
//         errorResponse.data.unique_field_errors.forEach(field => {
//           backendErrorState[field.field_id] = field.message;
//         });
//       }
      
//       // Handle type validation errors
//       if (errorResponse.data.type_errors) {
//         errorResponse.data.type_errors.forEach(field => {
//           backendErrorState[field.field_id] = field.message;
//         });
//       }
      
//       // Handle general validation errors
//       if (errorResponse.data.error && typeof errorResponse.data.error === 'string') {
//         setError(errorResponse.data.error);
//       }
//     }
    
//     setBackendErrors(backendErrorState);
    
//     // Combine with existing field errors
//     const combinedErrors = { ...fieldErrors, ...backendErrorState };
//     setFieldErrors(combinedErrors);
    
//     return Object.keys(backendErrorState).length > 0;
//   };

//   // Render fields dynamically with validation
//   const renderField = (field) => {
//     // Check if field is required (handle both property names)
//     const isRequired = field.is_required || field.required || false;
    
//     // Responsive classes
//     const inputClasses = "w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-base";
    
//     // Check for error
//     const hasError = fieldErrors[field.id] || backendErrors[field.id];
//     const errorMessage = fieldErrors[field.id] || backendErrors[field.id];

//     switch (field.field_type) {
//     case "text":
//   return (
//     <div className="space-y-1">
//       <input
//         type="text"
//         value={formData[field.id] || ""}
//         onChange={(e) => {
//           // Allow letters and spaces
//           const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // Added \s to allow spaces
//           handleInputChangeWithValidation(
//             field.id, 
//             value, 
//             'text',
//             isRequired,
//             field.options
//           );
//         }}
//         onFocus={() => clearFieldError(field.id)}
//         className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
//         placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//         maxLength={field.options?.maxLength}
//         pattern="[A-Za-z\s]*" // HTML5 pattern validation - added \s
//         title="Only letters and spaces are allowed"
//       />
//       {hasError && (
//         <p className="text-red-500 text-sm mt-1 flex items-center">
//           <i className="fas fa-exclamation-circle mr-2"></i>
//           {errorMessage}
//         </p>
//       )}
//       {field.options?.description && (
//         <p className="text-gray-500 text-xs mt-1">
//           {field.options.description}
//         </p>
//       )}
//     </div>
//   );    case "email":
//         return (
//           <div className="space-y-1">
//             <input
//               type="email"
//               value={formData[field.id] || ""}
//               onChange={(e) => handleInputChangeWithValidation(
//                 field.id, 
//                 e.target.value, 
//                 'email',
//                 isRequired,
//                 field.options
//               )}
//               onFocus={() => clearFieldError(field.id)}
//               className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
//               placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//               maxLength={field.options?.maxLength}
//               inputMode="email"
//             />
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1 flex items-center">
//                 <i className="fas fa-exclamation-circle mr-2"></i>
//                 {errorMessage}
//               </p>
//             )}
//             {field.options?.description && (
//               <p className="text-gray-500 text-xs mt-1">
//                 {field.options.description}
//               </p>
//             )}
//           </div>
//         );

//       // case "phonenumber":
//       //   return (
//       //     <div className="space-y-1">
//       //       <input
//       //         type="tel"
//       //         value={formData[field.id] || ""}
//       //         onChange={(e) => {
//       //           // Allow only digits and + at the beginning
//       //           let value = e.target.value;
//       //           if (value && !value.startsWith('+')) {
//       //             value = value.replace(/[^0-9]/g, '');
//       //           } else {
//       //             value = value.replace(/[^0-9+]/g, '');
//       //             if (value.indexOf('+') > 0) {
//       //               value = value.replace(/\+/g, '');
//       //             }
//       //           }
//       //           handleInputChangeWithValidation(
//       //             field.id, 
//       //             value, 
//       //             'phonenumber',
//       //             isRequired,
//       //             field.options
//       //           );
//       //         }}
//       //         onFocus={() => clearFieldError(field.id)}
//       //         className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
//       //         placeholder={field.placeholder || "Enter phone number (e.g., +1234567890)"}
//       //         maxLength={field.options?.maxLength || 15}
//       //         inputMode="tel"
//       //       />
//       //       {hasError && (
//       //         <p className="text-red-500 text-sm mt-1 flex items-center">
//       //           <i className="fas fa-exclamation-circle mr-2"></i>
//       //           {errorMessage}
//       //         </p>
//       //       )}
//       //       {field.options?.description && (
//       //         <p className="text-gray-500 text-xs mt-1">
//       //           {field.options.description}
//       //         </p>
//       //       )}
//       //     </div>
//       //   );


//    case "phonenumber":
//   return (
//     <div className="space-y-1">
//       <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent overflow-hidden">
//         <span className="bg-gray-50 px-3 py-3 text-gray-600 font-medium border-r border-gray-300">
//           +91
//         </span>
//         <input
//           type="tel"
//           value={formData[field.id] || ""}
//           onChange={(e) => {
//             // Remove any non-digits from input
//             const value = e.target.value.replace(/\D/g, '');
            
//             // Limit to 10 digits
//             if (value.length <= 10) {
//               handleInputChangeWithValidation(
//                 field.id, 
//                 value, 
//                 'phonenumber',
//                 isRequired,
//                 field.options
//               );
//             }
//           }}
//           onFocus={() => clearFieldError(field.id)}
//           className="w-full px-3 py-3 outline-none text-base"
//           placeholder="9876543210"
//           maxLength={10}
//           inputMode="numeric"
//         />
//       </div>
//       {hasError && (
//         <p className="text-red-500 text-sm mt-1 flex items-center">
//           <i className="fas fa-exclamation-circle mr-2"></i>
//           {errorMessage}
//         </p>
//       )}
//       {field.options?.description && (
//         <p className="text-gray-500 text-xs mt-1">
//           {field.options.description}
//         </p>
//       )}
//     </div>
//   );





  
//      case "alphanumeric":
//   return (
//     <div className="space-y-1">
//       <input
//         type="text"
//         value={formData[field.id] || ""}
//         onChange={(e) => {
//           // Allow letters, numbers, and spaces
//           const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''); // Added \s to allow spaces
//           handleInputChangeWithValidation(
//             field.id, 
//             value, 
//             'alphanumeric',
//             isRequired,
//             field.options
//           );
//         }}
//         onFocus={() => clearFieldError(field.id)}
//         className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
//         placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//         maxLength={field.options?.maxLength}
//       />
//       {hasError && (
//         <p className="text-red-500 text-sm mt-1 flex items-center">
//           <i className="fas fa-exclamation-circle mr-2"></i>
//           {errorMessage}
//         </p>
//       )}
//       {field.options?.description && (
//         <p className="text-gray-500 text-xs mt-1">
//           {field.options.description}
//         </p>
//       )}
//     </div>
//   );
//       case "number":
//         return (
//           <div className="space-y-1">
//             <input
//               type="number"
//               value={formData[field.id] || ""}
//               onChange={(e) => handleInputChangeWithValidation(
//                 field.id, 
//                 e.target.value, 
//                 'number',
//                 isRequired,
//                 field.options
//               )}
//               onFocus={() => clearFieldError(field.id)}
//               className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
//               placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//               min={field.options?.min}
//               max={field.options?.max}
//               step={field.options?.step || "any"}
//             />
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1 flex items-center">
//                 <i className="fas fa-exclamation-circle mr-2"></i>
//                 {errorMessage}
//               </p>
//             )}
//           </div>
//         );

//       case "date":
//         return (
//           <div className="space-y-1">
//             <div className="relative">
//               <input
//                 type="date"
//                 value={formData[field.id] || ""}
//                 onChange={(e) => {
//                   let value = e.target.value;
//                   if (value.length > 10) value = value.slice(0, 10);
//                   handleInputChangeWithValidation(
//                     field.id, 
//                     value, 
//                     'date',
//                     isRequired,
//                     field.options
//                   );
//                 }}
//                 onFocus={() => clearFieldError(field.id)}
//                 className={`${inputClasses} ${hasError ? 'border-red-500' : ''} pr-10`}
//                 max={field.options?.maxDate === 'today' ? new Date().toISOString().split('T')[0] : field.options?.maxDate}
//                 min={field.options?.minDate}
//               />
//               <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
//             </div>
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1 flex items-center">
//                 <i className="fas fa-exclamation-circle mr-2"></i>
//                 {errorMessage}
//               </p>
//             )}
//           </div>
//         );

//       case "dropdown":
//         return (
//           <div className="space-y-1">
//             <div className="relative">
//               <select
//                 value={formData[field.id] || ""}
//                 onChange={(e) => handleInputChangeWithValidation(
//                   field.id, 
//                   e.target.value, 
//                   'dropdown',
//                   isRequired,
//                   field.options
//                 )}
//                 onFocus={() => clearFieldError(field.id)}
//                 className={`${inputClasses} appearance-none ${hasError ? 'border-red-500' : ''} pr-10`}
//               >
//                 <option value="">{field.placeholder || `Select ${field.label}`}</option>
//                 {field.options?.choices?.map((choice, idx) => (
//                   <option key={idx} value={choice}>
//                     {choice}
//                   </option>
//                 ))}
//               </select>
//               <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
//             </div>
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1 flex items-center">
//                 <i className="fas fa-exclamation-circle mr-2"></i>
//                 {errorMessage}
//               </p>
//             )}
//           </div>
//         );

//       case "checkbox":
//         return (
//           <div className="space-y-1">
//             <div className="flex items-start">
//               <input
//                 type="checkbox"
//                 id={`checkbox-${field.id}`}
//                 checked={formData[field.id] || false}
//                 onChange={(e) => {
//                   handleInputChange(field.id, e.target.checked);
//                   handleValidation(
//                     field.id, 
//                     e.target.checked, 
//                     'checkbox',
//                     isRequired,
//                     field.options
//                   );
//                 }}
//                 onFocus={() => clearFieldError(field.id)}
//                 className={`mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 ${hasError ? 'border-red-500' : ''}`}
//               />
//               <label htmlFor={`checkbox-${field.id}`} className="ml-3 text-gray-700">
//                 {field.label} {isRequired && <span className="text-red-500 ml-1">*</span>}
//               </label>
//             </div>
//             {hasError && (
//               <p className="text-red-500 text-sm mt-1 flex items-center">
//                 <i className="fas fa-exclamation-circle mr-2"></i>
//                 {errorMessage}
//               </p>
//             )}
//           </div>
//         );

//       case "image":
//         const boxWidth = field.options?.width || 300;
//         const boxHeight = field.options?.height || 300;

//         return (
//           <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//             {/* File validation error */}
//             {hasError && !imageSrc && !webcamActive && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <p className="text-red-600 text-sm flex items-center">
//                   <i className="fas fa-exclamation-triangle mr-2"></i>
//                   {errorMessage}
//                 </p>
//               </div>
//             )}

//             {!imageSrc && !webcamActive && (
//               <div className="flex flex-col gap-3">
//                 <label className="cursor-pointer">
//                   <span className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 w-full">
//                     <i className="fas fa-upload mr-2"></i>Upload Image
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     capture="environment"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         const maxSize = field.options?.maxSize || 5 * 1024 * 1024;
//                         if (file.size > maxSize) {
//                           setFieldErrors(prev => ({
//                             ...prev,
//                             [field.id]: `File size must be less than ${maxSize / (1024 * 1024)}MB`
//                           }));
//                           return;
//                         }

//                         const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
//                         if (!validTypes.includes(file.type)) {
//                           setFieldErrors(prev => ({
//                             ...prev,
//                             [field.id]: 'Please upload JPEG, PNG, WebP, or GIF image'
//                           }));
//                           return;
//                         }

//                         setImageSrc(URL.createObjectURL(file));
//                         setWebcamActive(false);
//                         setZoom(1);
//                         setPosition({ x: 0, y: 0 });
//                         setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
//                         setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
//                       }
//                     }}
//                     className="hidden"
//                   />
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setWebcamActive(true);
//                     setImageSrc(null);
//                     setZoom(1);
//                     setPosition({ x: 0, y: 0 });
//                     setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
//                     setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
//                   }}
//                   className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 w-full"
//                 >
//                   <i className="fas fa-camera mr-2"></i>Use Webcam
//                 </button>
//               </div>
//             )}

//             {webcamActive && (
//               <div className="space-y-4">
//                 <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
//                   <Webcam
//                     ref={webcamRef}
//                     screenshotFormat="image/jpeg"
//                     className="w-full h-full object-contain"
//                     screenshotQuality={0.9}
//                     videoConstraints={{
//                       facingMode: "environment",
//                       width: { ideal: 1280 },
//                       height: { ideal: 720 }
//                     }}
//                   />
//                 </div>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const screenshot = webcamRef.current?.getScreenshot();
//                       if (screenshot) {
//                         setImageSrc(screenshot);
//                         setWebcamActive(false);
//                         setZoom(1);
//                         setPosition({ x: 0, y: 0 });
//                       }
//                     }}
//                     className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
//                   >
//                     <i className="fas fa-camera mr-2"></i>Capture Photo
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setWebcamActive(false)}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200"
//                   >
//                     <i className="fas fa-times mr-2"></i>Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {imageSrc && (
//               <div className="space-y-4">
//                 <div className="text-center p-3 bg-blue-50 rounded-lg">
//                   <p className="text-blue-700 font-medium">
//                     Required Size: {boxWidth} × {boxHeight} pixels
//                   </p>
//                   <p className="text-sm text-blue-600 mt-1">
//                     • Drag to move • Pinch/scroll to zoom
//                   </p>
//                 </div>

//                 {/* Zoom Controls */}
//                 <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-3 rounded-lg gap-3">
//                   <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">Zoom Controls:</span>
//                   <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
//                     <button
//                       type="button"
//                       onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
//                       className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
//                       title="Zoom Out"
//                     >
//                       <i className="fas fa-search-minus text-gray-700"></i>
//                     </button>
//                     <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
//                     <button
//                       type="button"
//                       onClick={() => setZoom(Math.min(3, zoom + 0.1))}
//                       className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
//                       title="Zoom In"
//                     >
//                       <i className="fas fa-search-plus text-gray-700"></i>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setZoom(1);
//                         setPosition({ x: 0, y: 0 });
//                       }}
//                       className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm transition-colors duration-200"
//                       title="Reset Zoom"
//                     >
//                       Reset
//                     </button>
//                   </div>
//                 </div>

//                 {/* Image Container */}
//                 <div 
//                   ref={containerRef}
//                   className="relative overflow-hidden rounded-lg border-2 border-dashed border-blue-400 bg-gray-100 mx-auto touch-none"
//                   style={{ 
//                     width: '100%', 
//                     height: '300px',
//                     maxHeight: '50vh',
//                     cursor: isDragging ? 'grabbing' : 'grab',
//                     touchAction: 'none'
//                   }}
//                   onMouseDown={handleMouseDown}
//                   onMouseMove={handleMouseMove}
//                   onMouseUp={handleMouseUp}
//                   onMouseLeave={handleMouseUp}
//                   onTouchStart={(e) => {
//                     handleTouchStart(e);
//                     handleTouchStartPinch(e);
//                   }}
//                   onTouchMove={(e) => {
//                     handleTouchMove(e);
//                     handleTouchMovePinch(e);
//                   }}
//                   onTouchEnd={(e) => {
//                     handleTouchEnd(e);
//                     handleTouchEndPinch(e);
//                   }}
//                 >
//                   {imageSrc && (
//                     <img
//                       ref={imgRef}
//                       src={imageSrc}
//                       alt="Adjust and crop"
//                       className="absolute max-w-none select-none"
//                       style={{
//                         transform: `scale(${zoom})`,
//                         transformOrigin: '0 0',
//                         left: `${position.x}px`,
//                         top: `${position.y}px`,
//                         cursor: isDragging ? 'grabbing' : 'grab'
//                       }}
//                       onLoad={() => {
//                         if (imgRef.current && containerRef.current) {
//                           const imgWidth = imgRef.current.naturalWidth;
//                           const imgHeight = imgRef.current.naturalHeight;
//                           const containerWidth = containerRef.current.clientWidth;
//                           const containerHeight = containerRef.current.clientHeight;
                          
//                           const initialX = (containerWidth - imgWidth * zoom) / 2;
//                           const initialY = (containerHeight - imgHeight * zoom) / 2;
                          
//                           setPosition({ x: initialX, y: initialY });
//                         }
//                       }}
//                     />
//                   )}

//                   {/* Crop Overlay */}
//                   <div 
//                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-500 bg-transparent pointer-events-none"
//                     style={{
//                       width: `min(${boxWidth}px, 80vw)`,
//                       height: `min(${boxHeight}px, 40vh)`,
//                       boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
//                     }}
//                   >
//                     <div className="absolute -top-8 left-0 right-0 text-center">
//                       <span className="bg-red-500 text-white px-3 py-1 text-sm rounded-lg">
//                         {boxWidth} × {boxHeight}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-center text-sm text-gray-600">
//                   <p>Position image within the red box</p>
//                 </div>

//                 {hasError && (
//                   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-red-600 flex items-center">
//                       <i className="fas fa-exclamation-triangle mr-2"></i>
//                       {errorMessage}
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <button
//                     type="button"
//                     onClick={async () => {
//                       try {
//                         const blob = await cropImageToBox(field);
//                         if (blob) {
//                           const img = new Image();
//                           img.onload = () => {
//                             if (Math.abs(img.width - boxWidth) > 5 || Math.abs(img.height - boxHeight) > 5) {
//                               setFieldErrors(prev => ({
//                                 ...prev,
//                                 [field.id]: `Image must be exactly ${boxWidth}×${boxHeight} pixels`
//                               }));
//                               return;
//                             }
//                             handleInputChange(field.id, blob);
//                             handleValidation(
//                               field.id, 
//                               blob, 
//                               'image',
//                               isRequired,
//                               field.options
//                             );
//                             setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
//                             setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
//                           };
//                           img.src = URL.createObjectURL(blob);
//                         }
//                       } catch (error) {
//                         setFieldErrors(prev => ({
//                           ...prev,
//                           [field.id]: 'Failed to process image'
//                         }));
//                       }
//                     }}
//                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
//                   >
//                     <i className="fas fa-crop mr-2"></i>Save Image ({boxWidth}×{boxHeight})
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setImageSrc(null);
//                       setZoom(1);
//                       setPosition({ x: 0, y: 0 });
//                       setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
//                       setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
//                     }}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
//                   >
//                     <i className="fas fa-times mr-2"></i>Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {formData[field.id] && !hasError && (
//               <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="text-green-700 flex items-center">
//                   <i className="fas fa-check-circle mr-2"></i>
//                   Image ready for submission ({boxWidth}×{boxHeight})
//                 </p>
//                 <div className="mt-2 flex flex-col items-center">
//                   <p className="text-sm text-gray-600 mb-2">Preview:</p>
//                   <img 
//                     src={URL.createObjectURL(formData[field.id])} 
//                     alt="Cropped preview" 
//                     className="max-h-32 border rounded-lg mx-auto"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedForm || !tokenValidated) {
//       setError("Please select a form and validate your token first.");
//       return;
//     }

//     // Clear any previous backend errors before validation
//     setBackendErrors({});
    
//     if (!validateAllFields()) {
//       setError("Please fix the errors in the form before submitting.");
      
//       const firstErrorField = document.querySelector('.border-red-500');
//       if (firstErrorField) {
//         firstErrorField.scrollIntoView({ 
//           behavior: 'smooth', 
//           block: 'center' 
//         });
//         setTimeout(() => {
//           const input = firstErrorField.querySelector('input, select, textarea');
//           if (input) input.focus();
//         }, 300);
//       }
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(false);
      
//       const responses = [];
      
//       for (const [fieldId, value] of Object.entries(formData)) {
//         let processedValue = value;
        
//         if (value instanceof Blob) {
//           try {
//             processedValue = await blobToBase64(value);
//           } catch (blobError) {
//             console.error("Error converting image to base64:", blobError);
//             setError("Failed to process image. Please try again.");
//             setLoading(false);
//             return;
//           }
//         }
        
//         responses.push({
//           field_id: parseInt(fieldId),
//           value: processedValue
//         });
//       }

//       if (!token || token.trim() === '') {
//         setError("Token is required.");
//         setLoading(false);
//         return;
//       }

//       const payload = { 
//         responses,
//         token: token.trim()
//       };

//       const submitStartTime = Date.now();
      
//       const response = await axios.post(`${API_BASE_URL}/submit-form/`, payload, { 
//         headers: { "Content-Type": "application/json" },
//         timeout: 30000
//       });

//       const elapsedTime = Date.now() - submitStartTime;
//       if (elapsedTime < 1000) {
//         await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
//       }

//       if (response.data && (response.data.success || response.data.message)) {
//         setSuccess(true);
//         setTokenInfo(prev => ({ ...prev, is_used: true }));
        
//         setTimeout(() => {
//           resetForm();
//         }, 3000);
//       } else {
//         throw new Error("Submission failed without proper response.");
//       }
      
//     } catch (err) {
//       console.error("Submission error:", err);
      
//       if (err.code === 'ECONNABORTED') {
//         setError("Request timeout. Please check your internet connection and try again.");
//       } else if (err.response) {
//         // Process backend validation errors
//         const hasFieldErrors = processBackendErrors(err.response);
        
//         if (!hasFieldErrors) {
//           const serverError = err.response.data?.error || 
//                               err.response.data?.message || 
//                               err.response.statusText;
//           setError(`Submission failed: ${serverError}`);
//         }
//       } else if (err.request) {
//         setError("No response from server. Please check your internet connection.");
//       } else {
//         setError(err.message || "Failed to submit form. Please try again.");
//       }
      
//       // Scroll to first error field
//       setTimeout(() => {
//         const firstErrorField = document.querySelector('.border-red-500');
//         if (firstErrorField) {
//           firstErrorField.scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'center' 
//           });
//         }
//       }, 100);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-25 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-4xl mx-auto">
//         {/* Main Card */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//           <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          
//           <div className="p-4 sm:p-6 lg:p-8">
//             {/* Progress Indicator */}
//             <div className="mb-6 sm:mb-8">
//               <div className="flex items-center justify-between relative">
//                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
//                 <div className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 -translate-y-1/2 transition-all duration-500 ${
//                   selectedForm ? 'w-full' : 'w-1/2'
//                 }`}></div>
                
//                 <div className="relative z-10">
//                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
//                     !selectedForm 
//                       ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600 text-white shadow-lg' 
//                       : 'bg-white border-yellow-500 text-yellow-600'
//                   }`}>
//                     <span className="font-bold text-sm">1</span>
//                   </div>
//                   <span className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700">
//                     Token Entry
//                   </span>
//                 </div>
                
//                 <div className="relative z-10">
//                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
//                     selectedForm 
//                       ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600 text-white shadow-lg' 
//                       : 'bg-white border-gray-300 text-gray-400'
//                   }`}>
//                     <span className="font-bold text-sm">2</span>
//                   </div>
//                   <span className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700">
//                     Form Details
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Error/Success Messages */}
//             {error && (
//               <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg">
//                 <div className="flex items-start">
//                   <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <p className="ml-3 text-sm text-red-800">{error}</p>
//                 </div>
//               </div>
//             )}

//             {success && (
//               <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg">
//                 <div className="flex items-start">
//                   <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <div className="ml-3">
//                     <p className="text-sm text-green-800">
//                       Form submitted successfully! Redirecting...
//                     </p>
//                     <div className="mt-2 w-full bg-green-200 rounded-full h-2">
//                       <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Token Entry Section */}
//             {!selectedForm ? (
//               <div className="space-y-6">
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
//                   <div className="flex items-start mb-4">
//                     <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                     </svg>
//                     <div className="ml-3">
//                       <h3 className="text-lg font-semibold text-gray-800">Enter Your Access Token</h3>
//                       <p className="text-sm text-gray-600 mt-1">Enter the token provided to access the form</p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Access Token <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         value={token}
//                         onChange={(e) => setToken(e.target.value)}
//                         className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base bg-white"
//                         placeholder="Enter your access token"
//                         required
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => validateToken()}
//                   disabled={loading || !token.trim()}
//                   className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 sm:py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center">
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Validating Token...
//                     </span>
//                   ) : (
//                     'Validate Token'
//                   )}
//                 </button>
//               </div>
//             ) : (
//               /* Form Section */
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Token Information Card */}
//                 {tokenInfo && (
//                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center">
//                         <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <h3 className="ml-2 font-semibold text-gray-800">Token Information</h3>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                         tokenInfo.is_used 
//                           ? 'bg-red-100 text-red-800 border border-red-200' 
//                           : 'bg-green-100 text-green-800 border border-green-200'
//                       }`}>
//                         {tokenInfo.is_used ? 'Used' : 'Valid'}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       <div className="bg-white p-3 rounded-lg border border-gray-200">
//                         <p className="text-xs text-gray-500 mb-1">Token ID</p>
//                         <p className="font-mono text-sm font-medium text-gray-800 break-all">
//                           {tokenInfo.token}
//                         </p>
//                       </div>
//                       <div className="bg-white p-3 rounded-lg border border-gray-200">
//                         <p className="text-xs text-gray-500 mb-1">Valid Until</p>
//                         <p className="text-sm font-medium text-gray-800">
//                           {tokenInfo.expires_at ? new Date(tokenInfo.expires_at).toLocaleDateString() : 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Back Button */}
//                 {!tokenInfo?.is_used && (
//                   <button
//                     type="button"
//                     onClick={handleBackToTokenEntry}
//                     className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
//                   >
//                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                     Back to Token Entry
//                   </button>
//                 )}

//                 {/* Form Fields */}
//                 {tokenValidated && !tokenInfo?.is_used && (
//                   <div className="space-y-6">
//                     <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
//                       <div className="flex items-center mb-4">
//                         <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         <div className="ml-2">
//                           <h3 className="font-semibold text-gray-800">Form Details</h3>
//                           <p className="text-sm text-gray-600">Please fill in all required fields marked with *</p>
//                         </div>
//                       </div>

//                       <div className="space-y-4">
//                         {selectedForm.fields.map((field, index) => {
//                           const isRequired = field.is_required || field.required || false;
                          
//                           return (
//                             <div 
//                               key={field.id} 
//                               className="bg-white p-4 rounded-xl border border-gray-200"
//                             >
//                               <div className="mb-4">
//                                 <div className="flex items-center mb-2">
//                                   <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex items-center justify-center text-xs font-bold mr-2">
//                                     {index + 1}
//                                   </span>
//                                   <label className="font-semibold text-gray-800">
//                                     {field.label}
//                                     {isRequired && <span className="text-red-500 ml-1">*</span>}
//                                   </label>
//                                 </div>
//                                 {field.description && (
//                                   <p className="text-gray-600 text-sm mb-3">{field.description}</p>
//                                 )}
//                                 {renderField(field)}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
//                       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                         <div>
//                           <h4 className="font-semibold text-gray-800">Ready to Submit?</h4>
//                           <p className="text-gray-600 text-sm mt-1">Please review all information before submitting</p>
//                         </div>
//                         <button
//                           type="submit"
//                           disabled={loading}
//                           className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
//                         >
//                           {loading ? (
//                             <span className="flex items-center justify-center">
//                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                               </svg>
//                               Submitting...
//                             </span>
//                           ) : (
//                             'Submit Form'
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </form>
//             )}

//             {/* Footer Note */}
//             <div className="mt-6 pt-4 border-t border-gray-200">
//               <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500">
//                 <div className="flex items-center mb-3 sm:mb-0">
//                   <svg className="h-4 w-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                   <span>Your information is secure and encrypted</span>
//                 </div>
//                 <div className="flex items-center">
//                   <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span>Need help? Contact support@goldenlamtouch.com</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentForm;






import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import './FormStyles.css';

const API_BASE_URL = 'http://localhost:8000/api';

const StudentForm = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Image state
  const [imageSrc, setImageSrc] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Refs
  const imgRef = useRef(null);
  const webcamRef = useRef(null);
  const containerRef = useRef(null);

  // Validation functions
  const validateEmail = (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Please enter a valid email address';
  };

  // const validateMobile = (value) => {
  //   if (!value) return '';
  //   // Remove all non-digits for validation
  //   const digitsOnly = value.replace(/\D/g, '');
  //   if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
  //     return '';
  //   }
  //   return 'Please enter a valid phone number (10-15 digits)';
  // };
const validateMobile = (value) => {
  if (!value) return '';
  // Remove all non-digits for validation
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return '';
  }
  return 'Please enter exactly 10 digits';
};
  const validateAlphanumeric = (value, fieldOptions) => {
  if (!value) return '';
  
  // Check if value contains only letters, numbers, and spaces
  const alphanumericWithSpacesRegex = /^[\s\S]+$/;  // Added \s to allow spaces
  if (!alphanumericWithSpacesRegex.test(value)) {
    return 'allows ANY character - letters, numbers, symbols, spaces, everything!';
  }
  
  if (fieldOptions?.minLength && value.length < fieldOptions.minLength) {
    return `Minimum ${fieldOptions.minLength} characters required`;
  }
  
  if (fieldOptions?.maxLength && value.length > fieldOptions.maxLength) {
    return `Maximum ${fieldOptions.maxLength} characters allowed`;
  }
  
  return '';
};

  const validateDate = (value, fieldOptions) => {
    if (!value) return '';
    
    // Check date format
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    
    // Check year is 4 digits
    const year = value.split('-')[0];
    if (year && year.length !== 4) {
      return 'Year must be 4 digits (YYYY format)';
    }
    
    return '';
  };

  const validateNumber = (value, fieldOptions) => {
    if (value === '' || value === null || value === undefined) return '';
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    
    if (fieldOptions?.min !== undefined && numValue < fieldOptions.min) {
      return `Minimum value is ${fieldOptions.min}`;
    }
    
    if (fieldOptions?.max !== undefined && numValue > fieldOptions.max) {
      return `Maximum value is ${fieldOptions.max}`;
    }
    
    return '';
  };

  const validateText = (value, fieldOptions) => {
  if (!value) return '';
  
  // Check if value contains only letters and spaces
  const lettersAndSpacesRegex = /^[A-Za-z\s]+$/;  // Added \s to allow spaces
  if (!lettersAndSpacesRegex.test(value)) {
    return 'Only letters and spaces are allowed';
  }
  
  if (fieldOptions?.minLength && value.length < fieldOptions.minLength) {
    return `Minimum ${fieldOptions.minLength} characters required`;
  }
  
  if (fieldOptions?.maxLength && value.length > fieldOptions.maxLength) {
    return `Maximum ${fieldOptions.maxLength} characters allowed`;
  }
  
  return '';
};
  // Main validation handler
  const handleValidation = (fieldId, value, fieldType, isRequired, fieldOptions = {}) => {
    let error = '';
    
    // Check required field
    if (isRequired && (value === '' || value === null || value === undefined || value === false)) {
      error = 'This field is required';
    } else if (value && value !== '' && value !== false) {
      // Type-specific validation (only if there's a value)
      switch (fieldType) {
        case 'email':
          error = validateEmail(value);
          break;
        case 'phonenumber':
          error = validateMobile(value);
          break;
        case 'alphanumeric':
          error = validateAlphanumeric(value, fieldOptions);
          break;
        case 'date':
          error = validateDate(value, fieldOptions);
          break;
        case 'number':
          error = validateNumber(value, fieldOptions);
          break;
        case 'text':
          error = validateText(value, fieldOptions);
          break;
        default:
          error = '';
      }
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));
    
    return error;
  };

  // Clear field error on focus
  const clearFieldError = (fieldId) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: ''
    }));
    setBackendErrors(prev => ({
      ...prev,
      [fieldId]: ''
    }));
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    const errors = {};
    let hasErrors = false;
    
    if (!selectedForm) return false;
    
    selectedForm.fields.forEach(field => {
      const value = formData[field.id];
      const fieldType = field.field_type;
      const isRequired = field.is_required || field.required || false; // Check both possible property names
      
      const error = handleValidation(field.id, value, fieldType, isRequired, field.options);
      
      if (error) {
        errors[field.id] = error;
        hasErrors = true;
      }
    });
    
    setFieldErrors(errors);
    return !hasErrors;
  };

  const validateToken = async () => {
    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const requestData = { token: token.trim() };
      
      const response = await axios.post(
        `${API_BASE_URL}/form-tokens/validate-token/`, 
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );
      
      if (response.data.valid) {
        setTokenValidated(true);
        setSelectedForm(response.data.form);
        setTokenInfo(response.data);
        setError(null);
        setFieldErrors({});
        setBackendErrors({});
      } else {
        setError(response.data.error || "Invalid token");
        setTokenValidated(false);
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setError("Failed to validate token. Please check your connection and try again.");
      setTokenValidated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Handle input change with validation
  const handleInputChangeWithValidation = (fieldId, value, fieldType, isRequired, fieldOptions = {}) => {
    handleInputChange(fieldId, value);
    handleValidation(fieldId, value, fieldType, isRequired, fieldOptions);
  };

  // Mouse events for dragging image
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

  // Touch events for mobile
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

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (!imageSrc) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  }, [imageSrc, zoom]);

  // Touch pinch-to-zoom
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

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

  // Add event listeners for wheel and touch zoom
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

  // Crop image to fit the box exactly
  const cropImageToBox = async (field) => {
    if (!imgRef.current || !field.options) return null;

    const canvas = document.createElement('canvas');
    const targetWidth = field.options.width || 300;
    const targetHeight = field.options.height || 300;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    const container = containerRef.current;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    
    // Calculate the position and size of the red box in the container
    const boxWidth = Math.min(targetWidth, containerRect.width - 40);
    const boxHeight = Math.min(targetHeight, 300);
    const boxLeft = (containerRect.width - boxWidth) / 2;
    const boxTop = (containerRect.height - boxHeight) / 2;

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

  // Helper function to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Reset form state
  const resetForm = () => {
    setFormData({});
    setImageSrc(null);
    setWebcamActive(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setToken("");
    setTokenValidated(false);
    setTokenInfo(null);
    setError(null);
    setSelectedForm(null);
    setFieldErrors({});
    setBackendErrors({});
  };

  // Handle back to token entry
  const handleBackToTokenEntry = () => {
    resetForm();
  };

  // Process backend validation errors
  const processBackendErrors = (errorResponse) => {
    const backendErrorState = {};
    
    if (errorResponse.data) {
      // Handle missing fields errors
      if (errorResponse.data.missing_fields) {
        errorResponse.data.missing_fields.forEach(field => {
          backendErrorState[field.field_id] = field.message;
        });
      }
      
      // Handle empty fields errors
      if (errorResponse.data.empty_fields) {
        errorResponse.data.empty_fields.forEach(field => {
          backendErrorState[field.field_id] = field.message;
        });
      }
      
      // Handle unique field errors
      if (errorResponse.data.unique_field_errors) {
        errorResponse.data.unique_field_errors.forEach(field => {
          backendErrorState[field.field_id] = field.message;
        });
      }
      
      // Handle type validation errors
      if (errorResponse.data.type_errors) {
        errorResponse.data.type_errors.forEach(field => {
          backendErrorState[field.field_id] = field.message;
        });
      }
      
      // Handle general validation errors
      if (errorResponse.data.error && typeof errorResponse.data.error === 'string') {
        setError(errorResponse.data.error);
      }
    }
    
    setBackendErrors(backendErrorState);
    
    // Combine with existing field errors
    const combinedErrors = { ...fieldErrors, ...backendErrorState };
    setFieldErrors(combinedErrors);
    
    return Object.keys(backendErrorState).length > 0;
  };

  // Render fields dynamically with validation
  const renderField = (field) => {
    // Check if field is required (handle both property names)
    const isRequired = field.is_required || field.required || false;
    
    // Responsive classes
    const inputClasses = "w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 text-base";
    
    // Check for error
    const hasError = fieldErrors[field.id] || backendErrors[field.id];
    const errorMessage = fieldErrors[field.id] || backendErrors[field.id];

    switch (field.field_type) {
    case "text":
  return (
    <div className="space-y-1">
      <input
        type="text"
        value={formData[field.id] || ""}
        onChange={(e) => {
          // Allow letters and spaces
          const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // Added \s to allow spaces
          handleInputChangeWithValidation(
            field.id, 
            value, 
            'text',
            isRequired,
            field.options
          );
        }}
        onFocus={() => clearFieldError(field.id)}
        className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        maxLength={field.options?.maxLength}
        pattern="[A-Za-z\s]*" // HTML5 pattern validation - added \s
        title="Only letters and spaces are allowed"
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {errorMessage}
        </p>
      )}
      {field.options?.description && (
        <p className="text-gray-500 text-xs mt-1">
          {field.options.description}
        </p>
      )}
    </div>
  );    case "email":
        return (
          <div className="space-y-1">
            <input
              type="email"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChangeWithValidation(
                field.id, 
                e.target.value, 
                'email',
                isRequired,
                field.options
              )}
              onFocus={() => clearFieldError(field.id)}
              className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              maxLength={field.options?.maxLength}
              inputMode="email"
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errorMessage}
              </p>
            )}
            {field.options?.description && (
              <p className="text-gray-500 text-xs mt-1">
                {field.options.description}
              </p>
            )}
          </div>
        );

      // case "phonenumber":
      //   return (
      //     <div className="space-y-1">
      //       <input
      //         type="tel"
      //         value={formData[field.id] || ""}
      //         onChange={(e) => {
      //           // Allow only digits and + at the beginning
      //           let value = e.target.value;
      //           if (value && !value.startsWith('+')) {
      //             value = value.replace(/[^0-9]/g, '');
      //           } else {
      //             value = value.replace(/[^0-9+]/g, '');
      //             if (value.indexOf('+') > 0) {
      //               value = value.replace(/\+/g, '');
      //             }
      //           }
      //           handleInputChangeWithValidation(
      //             field.id, 
      //             value, 
      //             'phonenumber',
      //             isRequired,
      //             field.options
      //           );
      //         }}
      //         onFocus={() => clearFieldError(field.id)}
      //         className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
      //         placeholder={field.placeholder || "Enter phone number (e.g., +1234567890)"}
      //         maxLength={field.options?.maxLength || 15}
      //         inputMode="tel"
      //       />
      //       {hasError && (
      //         <p className="text-red-500 text-sm mt-1 flex items-center">
      //           <i className="fas fa-exclamation-circle mr-2"></i>
      //           {errorMessage}
      //         </p>
      //       )}
      //       {field.options?.description && (
      //         <p className="text-gray-500 text-xs mt-1">
      //           {field.options.description}
      //         </p>
      //       )}
      //     </div>
      //   );


   case "phonenumber":
  return (
    <div className="space-y-1">
      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent overflow-hidden">
        <span className="bg-gray-50 px-3 py-3 text-gray-600 font-medium border-r border-gray-300">
          +91
        </span>
        <input
          type="tel"
          value={formData[field.id] || ""}
          onChange={(e) => {
            // Remove any non-digits from input
            const value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length <= 10) {
              handleInputChangeWithValidation(
                field.id, 
                value, 
                'phonenumber',
                isRequired,
                field.options
              );
            }
          }}
          onFocus={() => clearFieldError(field.id)}
          className="w-full px-3 py-3 outline-none text-base"
          placeholder="9876543210"
          maxLength={10}
          inputMode="numeric"
        />
      </div>
      {hasError && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {errorMessage}
        </p>
      )}
      {field.options?.description && (
        <p className="text-gray-500 text-xs mt-1">
          {field.options.description}
        </p>
      )}
    </div>
  );





  
  //    case "alphanumeric":
  // return (
  //   <div className="space-y-1">
  //     <input
  //       type="text"
  //       value={formData[field.id] || ""}
  //       onChange={(e) => {
  //         // Allow letters, numbers, and spaces
  //         const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''); // Added \s to allow spaces
  //         handleInputChangeWithValidation(
  //           field.id, 
  //           value, 
  //           'alphanumeric',
  //           isRequired,
  //           field.options
  //         );
  //       }}
  //       onFocus={() => clearFieldError(field.id)}
  //       className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
  //       placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
  //       maxLength={field.options?.maxLength}
  //     />
  //     {hasError && (
  //       <p className="text-red-500 text-sm mt-1 flex items-center">
  //         <i className="fas fa-exclamation-circle mr-2"></i>
  //         {errorMessage}
  //       </p>
  //     )}
  //     {field.options?.description && (
  //       <p className="text-gray-500 text-xs mt-1">
  //         {field.options.description}
  //       </p>
  //     )}
  //   </div>
  // );
 
 

  case "alphanumeric":
  return (
    <div className="space-y-1">
      <input
        type="text"
        value={formData[field.id] || ""}
        onChange={(e) => {
          // Allow ANY character - no filtering at all
          const value = e.target.value;  // Just take whatever user types
          handleInputChangeWithValidation(
            field.id, 
            value, 
            'alphanumeric',
            isRequired,
            field.options
          );
        }}
        onFocus={() => clearFieldError(field.id)}
        className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        maxLength={field.options?.maxLength}
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {errorMessage}
        </p>
      )}
      {field.options?.description && (
        <p className="text-gray-500 text-xs mt-1">
          {field.options.description}
        </p>
      )}
    </div>
  );
 
  case "number":
        return (
          <div className="space-y-1">
            <input
              type="number"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChangeWithValidation(
                field.id, 
                e.target.value, 
                'number',
                isRequired,
                field.options
              )}
              onFocus={() => clearFieldError(field.id)}
              className={`${inputClasses} ${hasError ? 'border-red-500' : ''}`}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              min={field.options?.min}
              max={field.options?.max}
              step={field.options?.step || "any"}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div className="space-y-1">
            <div className="relative">
              <input
                type="date"
                value={formData[field.id] || ""}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.length > 10) value = value.slice(0, 10);
                  handleInputChangeWithValidation(
                    field.id, 
                    value, 
                    'date',
                    isRequired,
                    field.options
                  );
                }}
                onFocus={() => clearFieldError(field.id)}
                className={`${inputClasses} ${hasError ? 'border-red-500' : ''} pr-10`}
                max={field.options?.maxDate === 'today' ? new Date().toISOString().split('T')[0] : field.options?.maxDate}
                min={field.options?.minDate}
              />
              <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-1">
            <div className="relative">
              <select
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChangeWithValidation(
                  field.id, 
                  e.target.value, 
                  'dropdown',
                  isRequired,
                  field.options
                )}
                onFocus={() => clearFieldError(field.id)}
                className={`${inputClasses} appearance-none ${hasError ? 'border-red-500' : ''} pr-10`}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {field.options?.choices?.map((choice, idx) => (
                  <option key={idx} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-1">
            <div className="flex items-start">
              <input
                type="checkbox"
                id={`checkbox-${field.id}`}
                checked={formData[field.id] || false}
                onChange={(e) => {
                  handleInputChange(field.id, e.target.checked);
                  handleValidation(
                    field.id, 
                    e.target.checked, 
                    'checkbox',
                    isRequired,
                    field.options
                  );
                }}
                onFocus={() => clearFieldError(field.id)}
                className={`mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 ${hasError ? 'border-red-500' : ''}`}
              />
              <label htmlFor={`checkbox-${field.id}`} className="ml-3 text-gray-700">
                {field.label} {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "image":
        const boxWidth = field.options?.width || 300;
        const boxHeight = field.options?.height || 300;

        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {/* File validation error */}
            {hasError && !imageSrc && !webcamActive && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {errorMessage}
                </p>
              </div>
            )}

            {!imageSrc && !webcamActive && (
              <div className="flex flex-col gap-3">
                <label className="cursor-pointer">
                  <span className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 w-full">
                    <i className="fas fa-upload mr-2"></i>Upload Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const maxSize = field.options?.maxSize || 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          setFieldErrors(prev => ({
                            ...prev,
                            [field.id]: `File size must be less than ${maxSize / (1024 * 1024)}MB`
                          }));
                          return;
                        }

                        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                        if (!validTypes.includes(file.type)) {
                          setFieldErrors(prev => ({
                            ...prev,
                            [field.id]: 'Please upload JPEG, PNG, WebP, or GIF image'
                          }));
                          return;
                        }

                        setImageSrc(URL.createObjectURL(file));
                        setWebcamActive(false);
                        setZoom(1);
                        setPosition({ x: 0, y: 0 });
                        setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
                        setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
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
                    setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
                    setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
                  }}
                  className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 w-full"
                >
                  <i className="fas fa-camera mr-2"></i>Use Webcam
                </button>
              </div>
            )}

            {webcamActive && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-contain"
                    screenshotQuality={0.9}
                    videoConstraints={{
                      facingMode: "environment",
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const screenshot = webcamRef.current?.getScreenshot();
                      if (screenshot) {
                        setImageSrc(screenshot);
                        setWebcamActive(false);
                        setZoom(1);
                        setPosition({ x: 0, y: 0 });
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                  >
                    <i className="fas fa-camera mr-2"></i>Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebcamActive(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}

            {imageSrc && (
              <div className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    Required Size: {boxWidth} × {boxHeight} pixels
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    • Drag to move • Pinch/scroll to zoom
                  </p>
                </div>

                {/* Zoom Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-3 rounded-lg gap-3">
                  <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">Zoom Controls:</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                      title="Zoom Out"
                    >
                      <i className="fas fa-search-minus text-gray-700"></i>
                    </button>
                    <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                      title="Zoom In"
                    >
                      <i className="fas fa-search-plus text-gray-700"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setPosition({ x: 0, y: 0 });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                      title="Reset Zoom"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Image Container */}
                <div 
                  ref={containerRef}
                  className="relative overflow-hidden rounded-lg border-2 border-dashed border-blue-400 bg-gray-100 mx-auto touch-none"
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    maxHeight: '50vh',
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
                      className="absolute max-w-none select-none"
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
                          const containerHeight = containerRef.current.clientHeight;
                          
                          const initialX = (containerWidth - imgWidth * zoom) / 2;
                          const initialY = (containerHeight - imgHeight * zoom) / 2;
                          
                          setPosition({ x: initialX, y: initialY });
                        }
                      }}
                    />
                  )}

                  {/* Crop Overlay */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-500 bg-transparent pointer-events-none"
                    style={{
                      width: `min(${boxWidth}px, 80vw)`,
                      height: `min(${boxHeight}px, 40vh)`,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="absolute -top-8 left-0 right-0 text-center">
                      <span className="bg-red-500 text-white px-3 py-1 text-sm rounded-lg">
                        {boxWidth} × {boxHeight}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Position image within the red box</p>
                </div>

                {hasError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 flex items-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const blob = await cropImageToBox(field);
                        if (blob) {
                          const img = new Image();
                          img.onload = () => {
                            if (Math.abs(img.width - boxWidth) > 5 || Math.abs(img.height - boxHeight) > 5) {
                              setFieldErrors(prev => ({
                                ...prev,
                                [field.id]: `Image must be exactly ${boxWidth}×${boxHeight} pixels`
                              }));
                              return;
                            }
                            handleInputChange(field.id, blob);
                            handleValidation(
                              field.id, 
                              blob, 
                              'image',
                              isRequired,
                              field.options
                            );
                            setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
                            setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
                          };
                          img.src = URL.createObjectURL(blob);
                        }
                      } catch (error) {
                        setFieldErrors(prev => ({
                          ...prev,
                          [field.id]: 'Failed to process image'
                        }));
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <i className="fas fa-crop mr-2"></i>Save Image ({boxWidth}×{boxHeight})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSrc(null);
                      setZoom(1);
                      setPosition({ x: 0, y: 0 });
                      setFieldErrors(prev => ({ ...prev, [field.id]: '' }));
                      setBackendErrors(prev => ({ ...prev, [field.id]: '' }));
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}

            {formData[field.id] && !hasError && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  Image ready for submission ({boxWidth}×{boxHeight})
                </p>
                <div className="mt-2 flex flex-col items-center">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={URL.createObjectURL(formData[field.id])} 
                    alt="Cropped preview" 
                    className="max-h-32 border rounded-lg mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedForm || !tokenValidated) {
      setError("Please select a form and validate your token first.");
      return;
    }

    // Clear any previous backend errors before validation
    setBackendErrors({});
    
    if (!validateAllFields()) {
      setError("Please fix the errors in the form before submitting.");
      
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setTimeout(() => {
          const input = firstErrorField.querySelector('input, select, textarea');
          if (input) input.focus();
        }, 300);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const responses = [];
      
      for (const [fieldId, value] of Object.entries(formData)) {
        let processedValue = value;
        
        if (value instanceof Blob) {
          try {
            processedValue = await blobToBase64(value);
          } catch (blobError) {
            console.error("Error converting image to base64:", blobError);
            setError("Failed to process image. Please try again.");
            setLoading(false);
            return;
          }
        }
        
        responses.push({
          field_id: parseInt(fieldId),
          value: processedValue
        });
      }

      if (!token || token.trim() === '') {
        setError("Token is required.");
        setLoading(false);
        return;
      }

      const payload = { 
        responses,
        token: token.trim()
      };

      const submitStartTime = Date.now();
      
      const response = await axios.post(`${API_BASE_URL}/submit-form/`, payload, { 
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      const elapsedTime = Date.now() - submitStartTime;
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }

      if (response.data && (response.data.success || response.data.message)) {
        setSuccess(true);
        setTokenInfo(prev => ({ ...prev, is_used: true }));
        
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        throw new Error("Submission failed without proper response.");
      }
      
    } catch (err) {
      console.error("Submission error:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your internet connection and try again.");
      } else if (err.response) {
        // Process backend validation errors
        const hasFieldErrors = processBackendErrors(err.response);
        
        if (!hasFieldErrors) {
          const serverError = err.response.data?.error || 
                              err.response.data?.message || 
                              err.response.statusText;
          setError(`Submission failed: ${serverError}`);
        }
      } else if (err.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to submit form. Please try again.");
      }
      
      // Scroll to first error field
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-25 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Progress Indicator */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 -translate-y-1/2 transition-all duration-500 ${
                  selectedForm ? 'w-full' : 'w-1/2'
                }`}></div>
                
                <div className="relative z-10">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    !selectedForm 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600 text-white shadow-lg' 
                      : 'bg-white border-yellow-500 text-yellow-600'
                  }`}>
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <span className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700">
                    Token Entry
                  </span>
                </div>
                
                <div className="relative z-10">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    selectedForm 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600 text-white shadow-lg' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <span className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700">
                    Form Details
                  </span>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Form submitted successfully! Redirecting...
                    </p>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Entry Section */}
            {!selectedForm ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                  <div className="flex items-start mb-4">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-800">Enter Your Access Token</h3>
                      <p className="text-sm text-gray-600 mt-1">Enter the token provided to access the form</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base bg-white"
                        placeholder="Enter your access token"
                        required
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => validateToken()}
                  disabled={loading || !token.trim()}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 sm:py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Validating Token...
                    </span>
                  ) : (
                    'Validate Token'
                  )}
                </button>
              </div>
            ) : (
              /* Form Section */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Token Information Card */}
                {tokenInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="ml-2 font-semibold text-gray-800">Token Information</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tokenInfo.is_used 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {tokenInfo.is_used ? 'Used' : 'Valid'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Token ID</p>
                        <p className="font-mono text-sm font-medium text-gray-800 break-all">
                          {tokenInfo.token}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                        <p className="text-sm font-medium text-gray-800">
                          {tokenInfo.expires_at ? new Date(tokenInfo.expires_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back Button */}
                {!tokenInfo?.is_used && (
                  <button
                    type="button"
                    onClick={handleBackToTokenEntry}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Token Entry
                  </button>
                )}

                {/* Form Fields */}
                {tokenValidated && !tokenInfo?.is_used && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="ml-2">
                          <h3 className="font-semibold text-gray-800">Form Details</h3>
                          <p className="text-sm text-gray-600">Please fill in all required fields marked with *</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedForm.fields.map((field, index) => {
                          const isRequired = field.is_required || field.required || false;
                          
                          return (
                            <div 
                              key={field.id} 
                              className="bg-white p-4 rounded-xl border border-gray-200"
                            >
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex items-center justify-center text-xs font-bold mr-2">
                                    {index + 1}
                                  </span>
                                  <label className="font-semibold text-gray-800">
                                    {field.label}
                                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                </div>
                                {field.description && (
                                  <p className="text-gray-600 text-sm mb-3">{field.description}</p>
                                )}
                                {renderField(field)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">Ready to Submit?</h4>
                          <p className="text-gray-600 text-sm mt-1">Please review all information before submitting</p>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            'Submit Form'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500">
                <div className="flex items-center mb-3 sm:mb-0">
                  <svg className="h-4 w-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Your information is secure and encrypted</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Need help? Contact support@goldenlamtouch.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;