
// export default CreativeAgencyPortfolio;
import React, { useState, useEffect, useRef } from 'react';
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
  
  // Add these states for upload feature
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [selectedMonitorSlide, setSelectedMonitorSlide] = useState(null);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showMonitorActionButtons, setShowMonitorActionButtons] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMonitorEditModal, setShowMonitorEditModal] = useState(false);
  const [editFiles, setEditFiles] = useState([null, null, null]);
  const [monitorEditFiles, setMonitorEditFiles] = useState([null, null, null]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const frameRef = useRef(null);
  const scaleRef = useRef(null);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];
  const monitorFileInputRefs = [useRef(null), useRef(null), useRef(null)];

  // Original slides as fallback
  const fallbackSlides = [slide1, slide1, slide1];
  const monitorFallbackSlides = [slide3, slide4Image, slide1];

  // SIMPLE function to get token
  const getAuthToken = () => {
    // First, check if there's a token in the URL (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('Found token in URL');
      localStorage.setItem('jwt_token', tokenFromUrl);
      return tokenFromUrl;
    }
    
    // Check all possible storage locations
    const possibleKeys = ['token', 'access_token', 'jwt_token', 'access', 'jwt', 'auth_token'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token && token.length > 10) {
        console.log(`Found token with key: ${key}`);
        return token;
      }
    }
    
    // Check cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (possibleKeys.includes(key) && value && value.length > 10) {
        console.log(`Found token in cookie: ${key}`);
        return value;
      }
    }
    
    console.log('No token found in any storage location');
    return null;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
  };

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

  // Handle small panel slide click
  const handleSlideClick = (slideIndex) => {
    const slidesToUse = apiSlides.length > 0 ? apiSlides : fallbackSlides;
    const selected = {
      index: slideIndex,
      url: slidesToUse[slideIndex]
    };
    setSelectedSlide(selected);
    setShowActionButtons(true);
    setShowMonitorActionButtons(false);
    setSelectedMonitorSlide(null);
  };

  // Handle monitor screen click
  const handleMonitorClick = () => {
    const slidesToUse = monitorSlides.length > 0 ? monitorSlides : monitorFallbackSlides;
    const selected = {
      index: currentMonitorIndex,
      url: slidesToUse[currentMonitorIndex]
    };
    setSelectedMonitorSlide(selected);
    setShowMonitorActionButtons(true);
    setShowActionButtons(false);
    setSelectedSlide(null);
  };

  // Handle edit button click for small panel - Open edit modal
  const handleEditClick = () => {
    if (!isAuthenticated()) {
      alert('Please log in first to edit slides');
      return;
    }
    setEditFiles([null, null, null]);
    setShowEditModal(true);
  };

  // Handle edit button click for monitor screen - Open monitor edit modal
  const handleMonitorEditClick = () => {
    if (!isAuthenticated()) {
      alert('Please log in first to edit slides');
      return;
    }
    setMonitorEditFiles([null, null, null]);
    setShowMonitorEditModal(true);
  };

  // Handle file selection in edit modal (small panel)
  const handleEditFileChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    const newEditFiles = [...editFiles];
    newEditFiles[index] = file;
    setEditFiles(newEditFiles);
  };

  // Handle file selection in monitor edit modal
  const handleMonitorEditFileChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    const newEditFiles = [...monitorEditFiles];
    newEditFiles[index] = file;
    setMonitorEditFiles(newEditFiles);
  };

  // Upload all 3 images for small panel (slide1)
  const handleUploadImages = async () => {
    const selectedCount = editFiles.filter(file => file).length;
    if (selectedCount !== 3) {
      alert(`Please select exactly 3 images. Currently selected: ${selectedCount}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Authentication required. Please log in first.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress({ message: 'Preparing upload...', percent: 0 });
      
      // Create FormData
      const formData = new FormData();
      
      editFiles.forEach((file, index) => {
        if (file) {
          formData.append(`image${index + 1}`, file);
        }
      });
      
      formData.append('id', 1);
      
      setUploadProgress({ message: 'Uploading images to server...', percent: 30 });
      
      console.log('Uploading small panel slides with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`http://127.0.0.1:8000/api/slide1/1/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress({ message: 'Processing images...', percent: 60 });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Authentication failed (401). Token may be invalid or expired.';
        } else if (response.status === 403) {
          errorMessage = 'Permission denied (403). You do not have access.';
        }
        
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          if (errorData.detail) {
            errorMessage += ` Details: ${errorData.detail}`;
          }
        } catch (e) {
          // Ignore if response is not JSON
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      setUploadProgress({ message: 'Updating display...', percent: 90 });
      
      // Extract updated images
      const updatedSlides = [];
      if (data.image1) updatedSlides.push(data.image1);
      if (data.image2) updatedSlides.push(data.image2);
      if (data.image3) updatedSlides.push(data.image3);
      
      setApiSlides(updatedSlides);
      
      setUploadProgress({ message: 'Upload complete!', percent: 100 });

      setTimeout(() => {
        setShowEditModal(false);
        setEditFiles([null, null, null]);
        setShowActionButtons(false);
        setSelectedSlide(null);
        setUploadProgress({});
        alert('Small panel slides uploaded successfully!');
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      
      // Show detailed error info
      if (error.message.includes('401')) {
        alert('Your session may have expired. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Upload all 3 images for monitor screen (slide2)
  const handleMonitorUploadImages = async () => {
    const selectedCount = monitorEditFiles.filter(file => file).length;
    if (selectedCount !== 3) {
      alert(`Please select exactly 3 images. Currently selected: ${selectedCount}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Authentication required. Please log in first.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress({ message: 'Preparing upload...', percent: 0 });
      
      // Create FormData
      const formData = new FormData();
      
      monitorEditFiles.forEach((file, index) => {
        if (file) {
          formData.append(`image${index + 1}`, file);
        }
      });
      
      formData.append('id', 1);
      
      setUploadProgress({ message: 'Uploading images to server...', percent: 30 });
      
      console.log('Uploading monitor slides with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`http://127.0.0.1:8000/api/slide2/1/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress({ message: 'Processing images...', percent: 60 });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Authentication failed (401). Token may be invalid or expired.';
        } else if (response.status === 403) {
          errorMessage = 'Permission denied (403). You do not have access.';
        }
        
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          if (errorData.detail) {
            errorMessage += ` Details: ${errorData.detail}`;
          }
        } catch (e) {
          // Ignore if response is not JSON
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      setUploadProgress({ message: 'Updating display...', percent: 90 });
      
      // Extract updated images
      const updatedSlides = [];
      if (data.image1) updatedSlides.push(data.image1);
      if (data.image2) updatedSlides.push(data.image2);
      if (data.image3) updatedSlides.push(data.image3);
      
      setMonitorSlides(updatedSlides);
      
      setUploadProgress({ message: 'Upload complete!', percent: 100 });

      setTimeout(() => {
        setShowMonitorEditModal(false);
        setMonitorEditFiles([null, null, null]);
        setShowMonitorActionButtons(false);
        setSelectedMonitorSlide(null);
        setUploadProgress({});
        alert('Monitor screen slides uploaded successfully!');
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      
      // Show detailed error info
      if (error.message.includes('401')) {
        alert('Your session may have expired. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFiles([null, null, null]);
    setUploadProgress({});
  };

  // Close monitor edit modal
  const handleCloseMonitorEditModal = () => {
    setShowMonitorEditModal(false);
    setMonitorEditFiles([null, null, null]);
    setUploadProgress({});
  };

  // Function to manually set token (for testing)
  const handleSetToken = () => {
    const token = prompt('Paste your JWT token here:');
    if (token) {
      localStorage.setItem('jwt_token', token);
      alert('Token saved! Try uploading now.');
    }
  };

  // Function to check current token
  const checkToken = () => {
    const token = getAuthToken();
    if (token) {
      alert(`Token found (first 20 chars): ${token.substring(0, 20)}...`);
      console.log('Full token:', token);
    } else {
      alert('No token found in storage');
    }
  };

  // Close action buttons when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionButtons && !event.target.closest('.action-buttons-container') && 
          !event.target.closest('.monitor-action-buttons-container')) {
        setShowActionButtons(false);
        setSelectedSlide(null);
      }
      if (showMonitorActionButtons && !event.target.closest('.monitor-action-buttons-container') && 
          !event.target.closest('.action-buttons-container')) {
        setShowMonitorActionButtons(false);
        setSelectedMonitorSlide(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionButtons, showMonitorActionButtons]);

  // Determine which slides to display
  const displaySlides = apiSlides.length > 0 ? apiSlides : fallbackSlides;
  const displayMonitorSlides = monitorSlides.length > 0 ? monitorSlides : monitorFallbackSlides;
  const authenticated = isAuthenticated();

  return (
    <div className="relative w-full bg-gray-50 overflow-x-hidden">
      {/* Simple Auth Status */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 items-end">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${authenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {authenticated ? '✓ Logged In' : '⚠ Not Logged In'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={checkToken}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-full"
          >
            Check Token
          </button>
          <button
            onClick={handleSetToken}
            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs rounded-full"
          >
            Set Token
          </button>
        </div>
      </div>

      {/* Hidden file inputs for small panel */}
      {[0, 1, 2].map((index) => (
        <input
          key={`small-panel-${index}`}
          type="file"
          ref={fileInputRefs[index]}
          onChange={(e) => handleEditFileChange(index, e)}
          accept="image/*"
          style={{ display: 'none' }}
        />
      ))}

      {/* Hidden file inputs for monitor screen */}
      {[0, 1, 2].map((index) => (
        <input
          key={`monitor-${index}`}
          type="file"
          ref={monitorFileInputRefs[index]}
          onChange={(e) => handleMonitorEditFileChange(index, e)}
          accept="image/*"
          style={{ display: 'none' }}
        />
      ))}

      {/* Edit Modal for Small Panel */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Upload 3 Slides for Small Panel</h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                disabled={isUploading}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {!authenticated && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">
                    You need to be logged in to upload images.
                  </p>
                  <button
                    onClick={handleSetToken}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                  >
                    Set JWT Token
                  </button>
                </div>
              )}
              
              {uploadProgress.message && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{uploadProgress.message}</span>
                    <span>{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${uploadProgress.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-4 text-center">Slide {index + 1}</h4>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Current:</p>
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={displaySlides[index]}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => fileInputRefs[index].current.click()}
                    >
                      {editFiles[index] ? (
                        <div className="text-center">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2">
                            <img
                              src={URL.createObjectURL(editFiles[index])}
                              alt="New image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {editFiles[index].name}
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="text-3xl mb-2 text-gray-400">📤</div>
                          <p className="text-gray-500">Select image</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRefs[index].current.click()}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                      >
                        {editFiles[index] ? 'Change' : 'Select'}
                      </button>
                      {editFiles[index] && (
                        <button
                          onClick={() => {
                            const newFiles = [...editFiles];
                            newFiles[index] = null;
                            setEditFiles(newFiles);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600">Selected: </span>
                  <span className={`font-bold ${editFiles.filter(f => f).length === 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {editFiles.filter(f => f).length} of 3
                  </span>
                </div>
                <div className="text-sm">
                  <span className={`font-bold ${authenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {authenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleCloseEditModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={authenticated ? handleUploadImages : handleSetToken}
                  disabled={isUploading || editFiles.some(f => !f) || !authenticated}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    !authenticated || editFiles.some(f => !f)
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isUploading ? 'Uploading...' : authenticated ? 'Upload All 3 Images' : 'Set Token First'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for Monitor Screen */}
      {showMonitorEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Upload 3 Slides for Monitor Screen</h3>
              <button
                onClick={handleCloseMonitorEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                disabled={isUploading}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {!authenticated && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">
                    You need to be logged in to upload images.
                  </p>
                  <button
                    onClick={handleSetToken}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                  >
                    Set JWT Token
                  </button>
                </div>
              )}
              
              {uploadProgress.message && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{uploadProgress.message}</span>
                    <span>{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${uploadProgress.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-4 text-center">Slide {index + 1}</h4>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Current:</p>
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={displayMonitorSlides[index]}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => monitorFileInputRefs[index].current.click()}
                    >
                      {monitorEditFiles[index] ? (
                        <div className="text-center">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2">
                            <img
                              src={URL.createObjectURL(monitorEditFiles[index])}
                              alt="New image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {monitorEditFiles[index].name}
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="text-3xl mb-2 text-gray-400">📤</div>
                          <p className="text-gray-500">Select image</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => monitorFileInputRefs[index].current.click()}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                      >
                        {monitorEditFiles[index] ? 'Change' : 'Select'}
                      </button>
                      {monitorEditFiles[index] && (
                        <button
                          onClick={() => {
                            const newFiles = [...monitorEditFiles];
                            newFiles[index] = null;
                            setMonitorEditFiles(newFiles);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600">Selected: </span>
                  <span className={`font-bold ${monitorEditFiles.filter(f => f).length === 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {monitorEditFiles.filter(f => f).length} of 3
                  </span>
                </div>
                <div className="text-sm">
                  <span className={`font-bold ${authenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {authenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleCloseMonitorEditModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={authenticated ? handleMonitorUploadImages : handleSetToken}
                  disabled={isUploading || monitorEditFiles.some(f => !f) || !authenticated}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    !authenticated || monitorEditFiles.some(f => !f)
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isUploading ? 'Uploading...' : authenticated ? 'Upload All 3 Images' : 'Set Token First'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop Frame */}
      <div
        ref={frameRef}
        className="relative w-full max-w-6xl mx-auto"
        style={{ aspectRatio: "1200 / 528" }}
      >
        <div
          ref={scaleRef}
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: "1200px", height: "528px" }}
        >
        <div className="fixed inset-0 -z-10">
  <img
    src={slide4Image}
    alt="Desktop Frame"
    className="w-full h-full object-cover"
  />
</div>




          {/* Monitor Screen - Clickable for Edit */}
          <div
            className="absolute overflow-hidden monitor-action-buttons-container cursor-pointer"
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
            onClick={handleMonitorClick}
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
            
            {/* Add click indicator overlay */}
            {!showMonitorActionButtons && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  Click to edit slides
                </div>
              </div>
            )}
            
            {/* Selected indicator */}
            {selectedMonitorSlide && (
              <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none shadow-[0_0_20px_yellow] animate-pulse"></div>
            )}
          </div>

          {/* Action Buttons for Monitor Screen */}
          {showMonitorActionButtons && selectedMonitorSlide && (
            <div
              className="absolute monitor-action-buttons-container flex gap-2 p-3 bg-black/95 backdrop-blur-sm rounded-xl shadow-2xl z-50 border border-gray-700"
              style={{
                top: "calc(36.5% + 38.5% + 15px)",
                left: "54.3%",
                transform: "perspective(700px) rotateY(-17deg) rotateX(8deg)",
                minWidth: '180px'
              }}
            >
              <button
                onClick={authenticated ? handleMonitorEditClick : () => alert('Please log in first')}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  authenticated 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {authenticated ? 'Edit All Slides' : 'Login to Edit'}
              </button>
              <button
                onClick={() => {
                  setShowMonitorActionButtons(false);
                  setSelectedMonitorSlide(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}

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
          <div className="action-buttons-container">
            <div
              className="absolute overflow-hidden bg-black cursor-pointer"
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
              onClick={() => handleSlideClick(0)}
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
              
              {selectedSlide && (
                <div className="absolute inset-0 border-2 border-yellow-400 pointer-events-none shadow-[0_0_10px_yellow]"></div>
              )}
            </div>

            {/* Action Buttons for Small Panel */}
            {showActionButtons && selectedSlide && (
              <div
                className="absolute flex gap-2 p-3 bg-black/95 backdrop-blur-sm rounded-xl shadow-2xl z-50 border border-gray-700"
                style={{
                  top: "calc(69.9% + 14.5% + 15px)",
                  left: "39.0%",
                  transform: "perspective(700px) rotateY(-17deg) rotateX(8deg)",
                  minWidth: '180px'
                }}
              >
                <button
                  onClick={authenticated ? handleEditClick : () => alert('Please log in first')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    authenticated 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {authenticated ? 'Edit All Slides' : 'Login to Edit'}
                </button>
                <button
                  onClick={() => {
                    setShowActionButtons(false);
                    setSelectedSlide(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
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
  
  // Stats Modal States
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [newStat, setNewStat] = useState({ number: '', label: '' });
  
  // Portfolio Modal States
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [newPortfolio, setNewPortfolio] = useState({
    category: 'web',
    title: '',
    client: '',
    year: '',
    image: ''
  });
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  
  // Services Modal States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    icon: '🎨',
    title: '',
    description: ''
  });
  const [services, setServices] = useState([]);
  
  // Testimonials Modal States
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    text: '',
    author: '',
    position: '',
    avatar: ''
  });
  const [testimonials, setTestimonials] = useState([]);
  
  // Clients Modal States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: ''
  });
  const [clients, setClients] = useState([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // Get authentication token
  const getAuthToken = () => {
    const possibleKeys = ['token', 'access_token', 'jwt_token', 'access', 'jwt', 'auth_token'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token && token.length > 10) {
        return token;
      }
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('jwt_token', tokenFromUrl);
      return tokenFromUrl;
    }
    
    return null;
  };

  // Check authentication status
  const checkAuthentication = () => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    return !!token;
  };

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

  // STATISTICS CRUD OPERATIONS
  const addStat = async () => {
    if (!newStat.number || !newStat.label) {
      alert('Please fill in both number and label');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to add statistics');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/statistics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newStat),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => [...prev, data]);
        setNewStat({ number: '', label: '' });
        setShowStatModal(false);
        alert('Statistic added successfully!');
      } else {
        alert('Failed to add statistic');
      }
    } catch (error) {
      console.error('Error adding statistic:', error);
      alert('Error adding statistic');
    }
  };

  const updateStat = async () => {
    if (!editingStat || !editingStat.number || !editingStat.label) {
      alert('Please fill in both number and label');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to update statistics');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/statistics/${editingStat.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: editingStat.number,
          label: editingStat.label
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => prev.map(stat => 
          stat.id === editingStat.id ? data : stat
        ));
        setEditingStat(null);
        alert('Statistic updated successfully!');
      } else {
        alert('Failed to update statistic');
      }
    } catch (error) {
      console.error('Error updating statistic:', error);
      alert('Error updating statistic');
    }
  };

  const deleteStat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this statistic?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to delete statistics');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/statistics/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStats(prev => prev.filter(stat => stat.id !== id));
        if (editingStat && editingStat.id === id) {
          setEditingStat(null);
        }
        alert('Statistic deleted successfully!');
      } else {
        alert('Failed to delete statistic');
      }
    } catch (error) {
      console.error('Error deleting statistic:', error);
      alert('Error deleting statistic');
    }
  };

  // PORTFOLIO CRUD OPERATIONS
  const addPortfolio = async () => {
    if (!newPortfolio.title || !newPortfolio.client || !newPortfolio.year || !newPortfolio.image) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to add portfolio items');
      return;
    }

    try {
      let imageUrl = newPortfolio.image;
      
      if (portfolioFile) {
        const formData = new FormData();
        formData.append('image', portfolioFile);
        
        const uploadResponse = await fetch('http://127.0.0.1:8000/api/upload-image/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.image_url || uploadData.url || newPortfolio.image;
        } else {
          alert('Failed to upload image. Using provided URL instead.');
        }
      }

      const response = await fetch('http://127.0.0.1:8000/api/portfolio/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPortfolio,
          image: imageUrl
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(prev => [...prev, data]);
        setNewPortfolio({
          category: 'web',
          title: '',
          client: '',
          year: '',
          image: ''
        });
        setPortfolioFile(null);
        setShowPortfolioModal(false);
        alert('Portfolio item added successfully!');
      } else {
        alert('Failed to add portfolio item');
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      alert('Error adding portfolio item');
    }
  };

  const updatePortfolio = async () => {
    if (!editingPortfolio || !editingPortfolio.title || !editingPortfolio.client || !editingPortfolio.year || !editingPortfolio.image) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to update portfolio items');
      return;
    }

    try {
      let imageUrl = editingPortfolio.image;
      
      if (portfolioFile) {
        const formData = new FormData();
        formData.append('image', portfolioFile);
        
        const uploadResponse = await fetch('http://127.0.0.1:8000/api/upload-image/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.image_url || uploadData.url || editingPortfolio.image;
        } else {
          alert('Failed to upload image. Using existing image instead.');
        }
      }

      const response = await fetch(`http://127.0.0.1:8000/api/portfolio/${editingPortfolio.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editingPortfolio,
          image: imageUrl
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(prev => prev.map(item => 
          item.id === editingPortfolio.id ? data : item
        ));
        setEditingPortfolio(null);
        setPortfolioFile(null);
        alert('Portfolio item updated successfully!');
      } else {
        alert('Failed to update portfolio item');
      }
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      alert('Error updating portfolio item');
    }
  };

  const deletePortfolio = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to delete portfolio items');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/portfolio/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPortfolioItems(prev => prev.filter(item => item.id !== id));
        if (editingPortfolio && editingPortfolio.id === id) {
          setEditingPortfolio(null);
        }
        alert('Portfolio item deleted successfully!');
      } else {
        alert('Failed to delete portfolio item');
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      alert('Error deleting portfolio item');
    }
  };

  // SERVICES CRUD OPERATIONS
  const addService = async () => {
    if (!newService.icon || !newService.title || !newService.description) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to add services');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/services/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        const data = await response.json();
        setServices(prev => [...prev, data]);
        setNewService({ icon: '🎨', title: '', description: '' });
        setShowServiceModal(false);
        alert('Service added successfully!');
      } else {
        alert('Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service');
    }
  };

  const updateService = async () => {
    if (!editingService || !editingService.icon || !editingService.title || !editingService.description) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to update services');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/services/${editingService.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          icon: editingService.icon,
          title: editingService.title,
          description: editingService.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setServices(prev => prev.map(service => 
          service.id === editingService.id ? data : service
        ));
        setEditingService(null);
        alert('Service updated successfully!');
      } else {
        alert('Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to delete services');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/services/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setServices(prev => prev.filter(service => service.id !== id));
        if (editingService && editingService.id === id) {
          setEditingService(null);
        }
        alert('Service deleted successfully!');
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  // TESTIMONIALS CRUD OPERATIONS
  const addTestimonial = async () => {
    if (!newTestimonial.text || !newTestimonial.author || !newTestimonial.position || !newTestimonial.avatar) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to add testimonials');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/testimonials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTestimonial),
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(prev => [...prev, data]);
        setNewTestimonial({ text: '', author: '', position: '', avatar: '' });
        setShowTestimonialModal(false);
        alert('Testimonial added successfully!');
      } else {
        alert('Failed to add testimonial');
      }
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Error adding testimonial');
    }
  };

  const updateTestimonial = async () => {
    if (!editingTestimonial || !editingTestimonial.text || !editingTestimonial.author || !editingTestimonial.position || !editingTestimonial.avatar) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to update testimonials');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/testimonials/${editingTestimonial.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editingTestimonial.text,
          author: editingTestimonial.author,
          position: editingTestimonial.position,
          avatar: editingTestimonial.avatar
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(prev => prev.map(testimonial => 
          testimonial.id === editingTestimonial.id ? data : testimonial
        ));
        setEditingTestimonial(null);
        alert('Testimonial updated successfully!');
      } else {
        alert('Failed to update testimonial');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      alert('Error updating testimonial');
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to delete testimonials');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/testimonials/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
        if (editingTestimonial && editingTestimonial.id === id) {
          setEditingTestimonial(null);
        }
        alert('Testimonial deleted successfully!');
      } else {
        alert('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial');
    }
  };

  // CLIENTS CRUD OPERATIONS
  const addClient = async () => {
    if (!newClient.name) {
      alert('Please fill in the client name');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to add clients');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        const data = await response.json();
        setClients(prev => [...prev, data]);
        setNewClient({ name: '' });
        setShowClientModal(false);
        alert('Client added successfully!');
      } else {
        alert('Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client');
    }
  };

  const updateClient = async () => {
    if (!editingClient || !editingClient.name) {
      alert('Please fill in the client name');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to update clients');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clients/${editingClient.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingClient.name
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClients(prev => prev.map(client => 
          client.id === editingClient.id ? data : client
        ));
        setEditingClient(null);
        alert('Client updated successfully!');
      } else {
        alert('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client');
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login to delete clients');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clients/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setClients(prev => prev.filter(client => client.id !== id));
        if (editingClient && editingClient.id === id) {
          setEditingClient(null);
        }
        alert('Client deleted successfully!');
      } else {
        alert('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  };

  // Handle edit button click for stats
  const handleEditStat = (stat) => {
    setEditingStat({ ...stat });
  };

  // Handle edit button click for portfolio
  const handleEditPortfolio = (item) => {
    setEditingPortfolio({ ...item });
  };

  // Handle edit button click for services
  const handleEditService = (service) => {
    setEditingService({ ...service });
  };

  // Handle edit button click for testimonials
  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial({ ...testimonial });
  };

  // Handle edit button click for clients
  const handleEditClient = (client) => {
    setEditingClient({ ...client });
  };

  // Handle add button click for portfolio
  const handleAddPortfolio = () => {
    setNewPortfolio({
      category: 'web',
      title: '',
      client: '',
      year: '',
      image: ''
    });
    setPortfolioFile(null);
    setEditingPortfolio(null);
    setShowPortfolioModal(true);
  };

  // Handle add button click for services
  const handleAddService = () => {
    setNewService({
      icon: '🎨',
      title: '',
      description: ''
    });
    setEditingService(null);
    setShowServiceModal(true);
  };

  // Handle add button click for testimonials
  const handleAddTestimonial = () => {
    setNewTestimonial({
      text: '',
      author: '',
      position: '',
      avatar: ''
    });
    setEditingTestimonial(null);
    setShowTestimonialModal(true);
  };

  // Handle add button click for clients
  const handleAddClient = () => {
    setNewClient({ name: '' });
    setEditingClient(null);
    setShowClientModal(true);
  };

  // Handle cancel edit for portfolio
  const handleCancelPortfolioEdit = () => {
    setEditingPortfolio(null);
    setPortfolioFile(null);
  };

  // Handle cancel edit for stats
  const handleCancelEdit = () => {
    setEditingStat(null);
  };

  // Handle cancel edit for services
  const handleCancelServiceEdit = () => {
    setEditingService(null);
  };

  // Handle cancel edit for testimonials
  const handleCancelTestimonialEdit = () => {
    setEditingTestimonial(null);
  };

  // Handle cancel edit for clients
  const handleCancelClientEdit = () => {
    setEditingClient(null);
  };

  // Handle add button click for stats
  const handleAddStat = () => {
    setNewStat({ number: '', label: '' });
    setEditingStat(null);
    setShowStatModal(true);
  };

  // Handle file selection for portfolio
  const handlePortfolioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    setPortfolioFile(file);
    
    // Create a preview URL and set it as the image
    const imageUrl = URL.createObjectURL(file);
    if (editingPortfolio) {
      setEditingPortfolio({ ...editingPortfolio, image: imageUrl });
    } else {
      setNewPortfolio({ ...newPortfolio, image: imageUrl });
    }
  };

  // Handle set token for authentication
  const handleSetToken = () => {
    const token = prompt('Paste your JWT token here:');
    if (token) {
      localStorage.setItem('jwt_token', token);
      setIsAuthenticated(true);
      alert('Token saved! You can now edit content.');
    }
  };

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

  // Check authentication and fetch data on component mount
  useEffect(() => {
    checkAuthentication();
    fetchStats();
    fetchPortfolioItems();
    fetchServices();
    fetchTestimonials();
    fetchClients();
  }, []);

  const filteredItems = activeTab === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeTab);

  // Popular emoji icons for services
  const emojiIcons = [
    '🎨', '💻', '📱', '🚀', '🛍️', '🎯', '🔧', '📈', '🎪', '💡',
    '✨', '🌟', '🔥', '💎', '⚡', '🌈', '🌐', '📊', '🖥️', '📲'
  ];

  return (
    <>
     <DesktopMonitorSlideshow />
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Monitor Slideshow Section */}
     

      {/* Statistics Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-white relative z-30 
                         rounded-t-2xl sm:rounded-t-3xl shadow-lg 
                         mt-[-40px] sm:mt-[-5px] md:mt-[-6px] lg:mt-[-4px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Auth Status and Controls */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Our Achievements
            </h2>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? '✓ Logged In' : '⚠ Not Logged In'}
              </div>
              
              {isAuthenticated && (
                <button
                  onClick={handleAddStat}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full flex items-center gap-1"
                >
                  <span>+</span> Add Stat
                </button>
              )}
              
              {!isAuthenticated && (
                <button
                  onClick={handleSetToken}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full"
                >
                  Set Token
                </button>
              )}
            </div>
          </div>

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
                    className="text-center bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    {/* Edit/Delete buttons for authenticated users */}
                    {isAuthenticated && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleEditStat(stat)}
                          className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteStat(stat.id)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Portfolio</h2>
              {isAuthenticated && (
                <button
                  onClick={handleAddPortfolio}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  + Add Portfolio Item
                </button>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Explore our latest projects and see how we've helped businesses transform their digital presence.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
            {['all', 'branding', 'web', 'mobile'].map((tab) => (
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

          {/* Portfolio Grid */}
          {portfolioLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id} 
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 aspect-square cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                >
                  {/* Edit/Delete buttons for authenticated users */}
                  {isAuthenticated && (
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPortfolio(item);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePortfolio(item.id);
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div 
                    className="absolute inset-0 bg-gray-300 group-hover:scale-110 transition-transform duration-700"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{item.title}</h3>
                      <div className="flex justify-between text-xs sm:text-sm opacity-90">
                        <span>{item.client}</span>
                        <span>{item.year}</span>
                      </div>
                      <div className="mt-2 text-xs px-2 py-1 bg-purple-600 inline-block rounded-full">
                        {item.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Services</h2>
              {isAuthenticated && (
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  + Add Service
                </button>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
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
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-purple-200 hover:scale-[1.02] relative"
                >
                  {/* Edit/Delete buttons for authenticated users */}
                  {isAuthenticated && (
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">What Our Clients Say</h2>
              {isAuthenticated && (
                <button
                  onClick={handleAddTestimonial}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  + Add Testimonial
                </button>
              )}
            </div>
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
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/10 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl relative"
                >
                  {/* Edit/Delete buttons for authenticated users */}
                  {isAuthenticated && (
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTestimonial(testimonial.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">Trusted By</h2>
              {isAuthenticated && (
                <button
                  onClick={handleAddClient}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  + Add Client
                </button>
              )}
            </div>
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
                  className="h-12 sm:h-14 md:h-16 lg:h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl text-gray-700 font-bold text-base sm:text-lg md:text-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100 relative group"
                >
                  {/* Edit/Delete buttons for authenticated users */}
                  {isAuthenticated && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full"
                        title="Edit"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                        title="Delete"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {client.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Edit/Add Statistic Modal */}
      {(editingStat || showStatModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStat ? 'Edit Statistic' : 'Add New Statistic'}
              </h3>
              <button
                onClick={() => {
                  setEditingStat(null);
                  setShowStatModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number/Value
                  </label>
                  <input
                    type="text"
                    value={editingStat ? editingStat.number : newStat.number}
                    onChange={(e) => {
                      if (editingStat) {
                        setEditingStat({ ...editingStat, number: e.target.value });
                      } else {
                        setNewStat({ ...newStat, number: e.target.value });
                      }
                    }}
                    placeholder="e.g., 150+ or 99%"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editingStat ? editingStat.label : newStat.label}
                    onChange={(e) => {
                      if (editingStat) {
                        setEditingStat({ ...editingStat, label: e.target.value });
                      } else {
                        setNewStat({ ...newStat, label: e.target.value });
                      }
                    }}
                    placeholder="e.g., Projects Completed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setEditingStat(null);
                    setShowStatModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {editingStat && (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={updateStat}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Update
                    </button>
                  </>
                )}
                
                {showStatModal && (
                  <button
                    onClick={addStat}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Add Statistic
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Portfolio Modal */}
      {(editingPortfolio || showPortfolioModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingPortfolio ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
              </h3>
              <button
                onClick={() => {
                  setEditingPortfolio(null);
                  setShowPortfolioModal(false);
                  setPortfolioFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={editingPortfolio ? editingPortfolio.category : newPortfolio.category}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, category: e.target.value });
                        } else {
                          setNewPortfolio({ ...newPortfolio, category: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    >
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                      <option value="branding">Branding</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editingPortfolio ? editingPortfolio.title : newPortfolio.title}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, title: e.target.value });
                        } else {
                          setNewPortfolio({ ...newPortfolio, title: e.target.value });
                        }
                      }}
                      placeholder="e.g., E-commerce Platform"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client *
                    </label>
                    <input
                      type="text"
                      value={editingPortfolio ? editingPortfolio.client : newPortfolio.client}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, client: e.target.value });
                        } else {
                          setNewPortfolio({ ...newPortfolio, client: e.target.value });
                        }
                      }}
                      placeholder="e.g., Fashion Brand"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="text"
                      value={editingPortfolio ? editingPortfolio.year : newPortfolio.year}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, year: e.target.value });
                        } else {
                          setNewPortfolio({ ...newPortfolio, year: e.target.value });
                        }
                      }}
                      placeholder="e.g., 2023"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      value={editingPortfolio ? editingPortfolio.image : newPortfolio.image}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, image: e.target.value });
                        } else {
                          setNewPortfolio({ ...newPortfolio, image: e.target.value });
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none mb-2"
                    />
                    <p className="text-xs text-gray-500">Or upload an image file below</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                         onClick={() => document.getElementById('portfolio-file-input').click()}>
                      {portfolioFile ? (
                        <div className="text-center">
                          <div className="relative h-32 w-full mx-auto rounded-lg overflow-hidden mb-2">
                            <img
                              src={URL.createObjectURL(portfolioFile)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {portfolioFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="py-6">
                          <div className="text-3xl mb-2 text-gray-400">📤</div>
                          <p className="text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="portfolio-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePortfolioFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={editingPortfolio ? editingPortfolio.image : newPortfolio.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400/cccccc/969696?text=Image+Preview';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setEditingPortfolio(null);
                    setShowPortfolioModal(false);
                    setPortfolioFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {editingPortfolio && (
                  <>
                    <button
                      onClick={handleCancelPortfolioEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={updatePortfolio}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                      Update Portfolio
                    </button>
                  </>
                )}
                
                {showPortfolioModal && (
                  <button
                    onClick={addPortfolio}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                  >
                    Add Portfolio Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Service Modal */}
      {(editingService || showServiceModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => {
                  setEditingService(null);
                  setShowServiceModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Emoji *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingService ? editingService.icon : newService.icon}
                        onChange={(e) => {
                          if (editingService) {
                            setEditingService({ ...editingService, icon: e.target.value });
                          } else {
                            setNewService({ ...newService, icon: e.target.value });
                          }
                        }}
                        placeholder="e.g., 🎨"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-2xl text-center"
                        maxLength="2"
                      />
                      <div className="text-3xl">
                        {editingService ? editingService.icon : newService.icon}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter a single emoji or choose from popular ones below
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popular Icons
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg">
                      {emojiIcons.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (editingService) {
                              setEditingService({ ...editingService, icon: emoji });
                            } else {
                              setNewService({ ...newService, icon: emoji });
                            }
                          }}
                          className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            (editingService ? editingService.icon : newService.icon) === emoji 
                              ? 'bg-purple-100 border-2 border-purple-500' 
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editingService ? editingService.title : newService.title}
                      onChange={(e) => {
                        if (editingService) {
                          setEditingService({ ...editingService, title: e.target.value });
                        } else {
                          setNewService({ ...newService, title: e.target.value });
                        }
                      }}
                      placeholder="e.g., UI/UX Design"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={editingService ? editingService.description : newService.description}
                      onChange={(e) => {
                        if (editingService) {
                          setEditingService({ ...editingService, description: e.target.value });
                        } else {
                          setNewService({ ...newService, description: e.target.value });
                        }
                      }}
                      placeholder="e.g., User-centered design that enhances engagement and drives conversions."
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Describe your service in 1-2 sentences
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-3xl mb-3">
                        {editingService ? editingService.icon : newService.icon}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {editingService ? editingService.title : newService.title || 'Service Title'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {editingService ? editingService.description : newService.description || 'Service description will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowServiceModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {editingService && (
                  <>
                    <button
                      onClick={handleCancelServiceEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={updateService}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                    >
                      Update Service
                    </button>
                  </>
                )}
                
                {showServiceModal && (
                  <button
                    onClick={addService}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                  >
                    Add Service
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Testimonial Modal */}
      {(editingTestimonial || showTestimonialModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setShowTestimonialModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testimonial Text *
                    </label>
                    <textarea
                      value={editingTestimonial ? editingTestimonial.text : newTestimonial.text}
                      onChange={(e) => {
                        if (editingTestimonial) {
                          setEditingTestimonial({ ...editingTestimonial, text: e.target.value });
                        } else {
                          setNewTestimonial({ ...newTestimonial, text: e.target.value });
                        }
                      }}
                      placeholder="What the client said about your services..."
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use quotes and keep it authentic
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial ? editingTestimonial.author : newTestimonial.author}
                      onChange={(e) => {
                        if (editingTestimonial) {
                          setEditingTestimonial({ ...editingTestimonial, author: e.target.value });
                        } else {
                          setNewTestimonial({ ...newTestimonial, author: e.target.value });
                        }
                      }}
                      placeholder="e.g., Sarah Johnson"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial ? editingTestimonial.position : newTestimonial.position}
                      onChange={(e) => {
                        if (editingTestimonial) {
                          setEditingTestimonial({ ...editingTestimonial, position: e.target.value });
                        } else {
                          setNewTestimonial({ ...newTestimonial, position: e.target.value });
                        }
                      }}
                      placeholder="e.g., CEO, TechVision"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar Initials *
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={editingTestimonial ? editingTestimonial.avatar : newTestimonial.avatar}
                        onChange={(e) => {
                          if (editingTestimonial) {
                            setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value });
                          } else {
                            setNewTestimonial({ ...newTestimonial, avatar: e.target.value });
                          }
                        }}
                        placeholder="e.g., SJ"
                        className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center uppercase"
                        maxLength="2"
                      />
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white">
                        {editingTestimonial ? editingTestimonial.avatar : newTestimonial.avatar || '??'}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      1-2 character initials (e.g., SJ for Sarah Johnson)
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 text-white">
                      <div className="text-2xl mb-3 text-purple-400">"</div>
                      <p className="text-sm text-gray-300 mb-4 italic">
                        {editingTestimonial ? editingTestimonial.text : newTestimonial.text || 'Testimonial text will appear here...'}
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white mr-3">
                          {editingTestimonial ? editingTestimonial.avatar : newTestimonial.avatar || '??'}
                        </div>
                        <div>
                          <div className="font-bold text-sm">
                            {editingTestimonial ? editingTestimonial.author : newTestimonial.author || 'Author Name'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {editingTestimonial ? editingTestimonial.position : newTestimonial.position || 'Position, Company'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setEditingTestimonial(null);
                    setShowTestimonialModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {editingTestimonial && (
                  <>
                    <button
                      onClick={handleCancelTestimonialEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={updateTestimonial}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                    >
                      Update Testimonial
                    </button>
                  </>
                )}
                
                {showTestimonialModal && (
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                  >
                    Add Testimonial
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Client Modal */}
      {(editingClient || showClientModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setShowClientModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={editingClient ? editingClient.name : newClient.name}
                    onChange={(e) => {
                      if (editingClient) {
                        setEditingClient({ ...editingClient, name: e.target.value });
                      } else {
                        setNewClient({ ...newClient, name: e.target.value });
                      }
                    }}
                    placeholder="e.g., TechCorp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Company or brand name
                  </p>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg text-gray-700 font-bold text-lg border border-gray-100">
                    {editingClient ? editingClient.name : newClient.name || 'Client Name'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setShowClientModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {editingClient && (
                  <>
                    <button
                      onClick={handleCancelClientEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={updateClient}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                    >
                      Update Client
                    </button>
                  </>
                )}
                
                {showClientModal && (
                  <button
                    onClick={addClient}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                  >
                    Add Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
 
};

export default CreativeAgencyPortfolio;