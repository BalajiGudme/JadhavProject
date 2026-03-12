// import React, { useState, useCallback, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// // Fixed Password Input Component - Defined outside or with useCallback
// const PasswordInput = React.memo(({ 
//   name, 
//   placeholder, 
//   value, 
//   error, 
//   showPassword, 
//   onToggleShowPassword,
//   onChange,
//   passwordStrength,
//   showStrength
// }) => (
//   <div className="relative">
//     <input
//       type={showPassword ? "text" : "password"}
//       name={name}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors pr-10 ${
//         error ? "border-red-500" : "border-gray-300"
//       }`}
//       required
//     />
//     <button
//       type="button"
//       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//       onClick={onToggleShowPassword}
//       tabIndex={-1}
//     >
//       {showPassword ? (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.29 3.29M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//         </svg>
//       ) : (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//         </svg>
//       )}
//     </button>
//     {/* Password strength indicator for main password field only */}
//     {showStrength && passwordStrength && (
//       <p className={`text-sm mt-1 ${getPasswordStrengthColor(passwordStrength)}`}>
//         Strength: {passwordStrength}
//       </p>
//     )}
//     {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//   </div>
// ));
// // OTP Input Component
// const OTPInput = ({ value, onChange, onResend, timeLeft, canResend }) => {
//   const handleChange = (e) => {
//     const val = e.target.value.replace(/[^0-9]/g, '');
//     if (val.length <= 6) {
//       onChange(val);
//     }
//   };
//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Enter OTP
//         </label>
//         <input
//           type="text"
//           value={value}
//           onChange={handleChange}
//           placeholder="Enter 6-digit OTP"
//           maxLength="6"
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
//           autoFocus
//         />
//       </div>
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           {timeLeft > 0 ? (
//             <>OTP expires in: <span className="font-semibold text-blue-600">{timeLeft}s</span></>
//           ) : (
//             <span className="text-red-500">OTP expired</span>
//           )}
//         </p>
//         <button
//           type="button"
//           onClick={onResend}
//           disabled={!canResend || timeLeft > 0}
//           className={`text-sm font-semibold ${
//             !canResend || timeLeft > 0
//               ? "text-gray-400 cursor-not-allowed"
//               : "text-blue-600 hover:text-blue-800 hover:underline"
//           }`}
//         >
//           Resend OTP
//         </button>
//       </div>
//     </div>
//   );
// };
// // Success Message Component
// const SuccessMessage = ({ email, onLogin }) => (
//   <div className="text-center space-y-6 py-8">
//     <div className="flex justify-center">
//       <div className="bg-green-100 rounded-full p-4">
//         <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//         </svg>
//       </div>
//     </div>
//     <h3 className="text-2xl font-bold text-gray-800">Registration Initiated!</h3>
//     <p className="text-gray-600">
//       Your account has been created successfully for <span className="font-semibold">{email}</span>.
//     </p>
//     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
//       <p className="text-yellow-800 font-medium mb-2">⚠️ Admin Approval Required</p>
//       <p className="text-yellow-700 text-sm">
//         Your account is pending admin approval. You will be able to login only after an 
//         administrator approves your account. We'll notify you once your account is approved.
//       </p>
//     </div>
//     <button
//       onClick={onLogin}
//       className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
//     >
//       Go to Login
//     </button>
//   </div>
// );
// // Helper function outside component
// const getPasswordStrengthColor = (strength) => {
//   switch (strength) {
//     case "Strong": return "text-green-600";
//     case "Medium": return "text-yellow-600";
//     case "Weak": return "text-red-600";
//     case "Too short": return "text-red-600";
//     default: return "text-gray-600";
//   }
// };
// function Register({ onClose, onSwitchToLogin }) {
//   const navigate = useNavigate();
//   // States for different steps
//   const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification, 3: Success
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [canResend, setCanResend] = useState(true);
//   const [otpError, setOtpError] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     full_name: "",
//     username: "",
//     email: "",
//     phone_number: "",
//     college_company: "",
//     address: "",
//     password: "",
//     password2: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState("");
//   // Timer for OTP expiration
//   useEffect(() => {
//     let timer;
//     if (step === 2 && timeLeft > 0) {
//       timer = setInterval(() => {
//         setTimeLeft(prev => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [step, timeLeft]);
//   // Use useCallback to prevent unnecessary re-renders
//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     // Apply input masking/filtering based on field type
//     let processedValue = value;
//     if (name === "full_name") {
//       // Allow only letters, spaces, dots, and hyphens for full name
//       processedValue = value.replace(/[^A-Za-z\s.-]/g, '');
//       // Prevent multiple spaces
//       processedValue = processedValue.replace(/\s+/g, ' ');
//     }
//     if (name === "username") {
//       // Allow only letters, numbers, underscores, and dots for username
//       processedValue = value.replace(/[^a-zA-Z0-9_.]/g, '');
//     }
//     if (name === "phone_number") {
//       // Format phone number to start with + and only allow digits after
//       if (value && !value.startsWith('+')) {
//         processedValue = '+' + value.replace(/[^0-9]/g, '');
//       } else {
//         processedValue = '+' + value.slice(1).replace(/[^0-9]/g, '');
//       }
//       // Limit to 15 characters including +
//       if (processedValue.length > 15) {
//         processedValue = processedValue.slice(0, 15);
//       }
//     }
//     setFormData(prev => ({ ...prev, [name]: processedValue }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: "" }));
//     }
//     // Real-time password strength feedback
//     if (name === "password") {
//       if (value.length === 0) {
//         setPasswordStrength("");
//       } else if (value.length < 8) {
//         setPasswordStrength("Too short");
//       } else {
//         // Check for complexity
//         const hasUpper = /[A-Z]/.test(value);
//         const hasLower = /[a-z]/.test(value);
//         const hasNumber = /[0-9]/.test(value);
//         const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
//         const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
//         if (strengthCount === 4) {
//           setPasswordStrength("Strong");
//         } else if (strengthCount >= 2) {
//           setPasswordStrength("Medium");
//         } else {
//           setPasswordStrength("Weak");
//         }
//       }
//     }
//     // Update email state for later use
//     if (name === "email") {
//       setEmail(value);
//     }
//   }, [errors]);
//   // Memoized input className function
//   const getInputClassName = useCallback((fieldName) => {
//     return `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
//       errors[fieldName] ? "border-red-500" : "border-gray-300"
//     }`;
//   }, [errors]);
//   const validateForm = () => {
//     const newErrors = {};
//     // Full Name validation
//     if (!formData.full_name.trim()) {
//       newErrors.full_name = "Full name is required";
//     } else if (formData.full_name.length < 2) {
//       newErrors.full_name = "Full name must be at least 2 characters long";
//     } else if (formData.full_name.length > 100) {
//       newErrors.full_name = "Full name must be less than 100 characters";
//     } else if (!/^[A-Za-z\s.-]+$/.test(formData.full_name)) {
//       newErrors.full_name = "Full name can only contain letters, spaces, dots, and hyphens";
//     } else if (/\s{2,}/.test(formData.full_name)) {
//       newErrors.full_name = "Full name cannot contain multiple consecutive spaces";
//     }
//     // Username validation
//     if (!formData.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (formData.username.length < 3) {
//       newErrors.username = "Username must be at least 3 characters long";
//     } else if (formData.username.length > 50) {
//       newErrors.username = "Username must be less than 50 characters";
//     } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
//       newErrors.username = "Username can only contain letters, numbers, underscores, and dots";
//     } else if (/^[._]|[._]$/.test(formData.username)) {
//       newErrors.username = "Username cannot start or end with underscore or dot";
//     } else if (/[._]{2,}/.test(formData.username)) {
//       newErrors.username = "Username cannot have consecutive underscores or dots";
//     }
//     // Email validation
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address (e.g., name@example.com)";
//     } else if (formData.email.length > 254) {
//       newErrors.email = "Email address is too long";
//     }
//     // Phone Number validation - Make it optional but if provided, validate format
//     if (formData.phone_number) {
//       // Check if it starts with + and has 10-15 digits
//       if (!/^\+\d{10,15}$/.test(formData.phone_number)) {
//         newErrors.phone_number = "Please enter a valid phone number with country code (e.g., +1234567890)";
//       }
//     }
//     // College/Company validation
//     if (!formData.college_company.trim()) {
//       newErrors.college_company = "College/Company is required";
//     } else if (formData.college_company.length < 2) {
//       newErrors.college_company = "College/Company name must be at least 2 characters long";
//     } else if (formData.college_company.length > 200) {
//       newErrors.college_company = "College/Company name must be less than 200 characters";
//     } else if (!/^[A-Za-z0-9\s&.,'-]+$/.test(formData.college_company)) {
//       newErrors.college_company = "College/Company name can only contain letters, numbers, spaces, and basic punctuation (&.,'-)";
//     }
//     // Address validation
//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required";
//     } else if (formData.address.length < 10) {
//       newErrors.address = "Address must be at least 10 characters long";
//     } else if (formData.address.length > 500) {
//       newErrors.address = "Address must be less than 500 characters";
//     } else if (!/^[A-Za-z0-9\s,.#\-'()]+$/.test(formData.address)) {
//       newErrors.address = "Address contains invalid characters";
//     }
//     // Password validation
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters long";
//     } else if (formData.password.length > 128) {
//       newErrors.password = "Password must be less than 128 characters";
//     } else {
//       // Check for complexity
//       const hasUpper = /[A-Z]/.test(formData.password);
//       const hasLower = /[a-z]/.test(formData.password);
//       const hasNumber = /[0-9]/.test(formData.password);
//       const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
//       if (!hasUpper) {
//         newErrors.password = "Password must contain at least one uppercase letter";
//       } else if (!hasLower) {
//         newErrors.password = "Password must contain at least one lowercase letter";
//       } else if (!hasNumber) {
//         newErrors.password = "Password must contain at least one number";
//       } else if (!hasSpecial) {
//         newErrors.password = "Password must contain at least one special character";
//       }
//     }
//     // Confirm Password validation
//     if (!formData.password2) {
//       newErrors.password2 = "Please confirm your password";
//     } else if (formData.password !== formData.password2) {
//       newErrors.password2 = "Passwords do not match";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
//   const handleClose = () => {
//     navigate("/");
//     if (onClose) onClose();
//   };
//   // Handle initial registration and send OTP
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       return;
//     }
//     setLoading(true);
//     try {
//       // Prepare data for backend
//       const submitData = {
//         full_name: formData.full_name.trim().replace(/\s+/g, ' '),
//         username: formData.username.trim(),
//         email: formData.email.trim().toLowerCase(),
//         phone_number: formData.phone_number || "",
//         college_company: formData.college_company.trim(),
//         address: formData.address.trim(),
//         role: "customer",
//         password: formData.password,
//         password2: formData.password2,
//       };
//       
//       // Call registration init endpoint to send OTP
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/auth/register/init/",
//         submitData,
//         { 
//           headers: { "Content-Type": "application/json" },
//           timeout: 10000
//         }
//       );
//       
//       // Set email for OTP verification
//       setEmail(formData.email);
//       // Move to OTP verification step
//       setStep(2);
//       setTimeLeft(60); // Reset timer
//     } catch (error) {
//       
//       if (error.response && error.response.data) {
//         
//         const serverErrors = error.response.data;
//         const formattedErrors = {};
//         Object.keys(serverErrors).forEach(key => {
//           if (Array.isArray(serverErrors[key])) {
//             formattedErrors[key] = serverErrors[key].join(", ");
//           } else if (typeof serverErrors[key] === 'string') {
//             formattedErrors[key] = serverErrors[key];
//           } else {
//             formattedErrors[key] = "Invalid field";
//           }
//         });
//         setErrors(formattedErrors);
//         const errorMessages = Object.values(formattedErrors).join("\n");
//         alert(`❌ Registration failed!\n${errorMessages}`);
//       } else if (error.request) {
//         alert("❌ Network error: Could not connect to server. Please check your connection.");
//       } else {
//         alert("❌ Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Handle OTP verification
//   const handleOTPSubmit = async (e) => {
//     e.preventDefault();
//     if (!otp || otp.length !== 6) {
//       setOtpError("Please enter a valid 6-digit OTP");
//       return;
//     }
//     setOtpLoading(true);
//     setOtpError("");
//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/auth/register/verify/",
//         {
//           email: email,
//           otp_code: otp
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//           timeout: 10000
//         }
//       );
//       
//       // Move to success step
//       setStep(3);
//     } catch (error) {
//       
//       if (error.response && error.response.data) {
//         if (error.response.data.error) {
//           setOtpError(error.response.data.error);
//         } else if (error.response.data.message) {
//           setOtpError(error.response.data.message);
//         } else {
//           setOtpError("OTP verification failed. Please try again.");
//         }
//       } else if (error.request) {
//         setOtpError("Network error. Please check your connection.");
//       } else {
//         setOtpError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setOtpLoading(false);
//     }
//   };
//   // Handle resend OTP
//   const handleResendOTP = async () => {
//     if (!canResend) return;
//     setCanResend(false);
//     try {
//       await axios.post(
//         "http://127.0.0.1:8000/api/auth/register/resend-otp/",
//         { email: email },
//         {
//           headers: { "Content-Type": "application/json" },
//           timeout: 10000
//         }
//       );
//       // Reset timer
//       setTimeLeft(60);
//       setOtpError("");
//       // Allow resend after 30 seconds
//       setTimeout(() => {
//         setCanResend(true);
//       }, 30000);
//     } catch (error) {
//       
//       setOtpError("Failed to resend OTP. Please try again.");
//       setCanResend(true);
//     }
//   };
//   // Handle back to registration form
//   const handleBackToForm = () => {
//     setStep(1);
//     setOtp("");
//     setOtpError("");
//     setTimeLeft(60);
//   };
//   // Handle login navigation
//   const handleLogin = () => {
//     handleClose();
//     if (onSwitchToLogin) {
//       onSwitchToLogin();
//     } else {
//       navigate("/login");
//     }
//   };
//   // Render based on current step
//   const renderStep = () => {
//     switch (step) {
//       case 1: // Registration Form
//         return (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <h2 className="text-2xl font-bold text-center text-blue-700">
//               Create Account
//             </h2>
//             <p className="text-center text-gray-500">
//               Fill in your details below
//             </p>
//             {/* Full Name */}
//             <div>
//               <input
//                 type="text"
//                 name="full_name"
//                 placeholder="Full Name (e.g., John Doe)"
//                 value={formData.full_name}
//                 onChange={handleChange}
//                 className={getInputClassName("full_name")}
//                 required
//               />
//               {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
//             </div>
//             {/* Username */}
//             <div>
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Username (e.g., john_doe123)"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className={getInputClassName("username")}
//                 required
//               />
//               {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
//             </div>
//             {/* Email */}
//             <div>
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email Address (e.g., john@example.com)"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={getInputClassName("email")}
//                 required
//               />
//               {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//             </div>
//             {/* Phone Number */}
//             <div>
//               <input
//                 type="text"
//                 name="phone_number"
//                 placeholder="Phone Number with Country Code (e.g., +1234567890)"
//                 value={formData.phone_number}
//                 onChange={handleChange}
//                 className={getInputClassName("phone_number")}
//               />
//               {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
//             </div>
//             {/* College/Company */}
//             <div>
//               <input
//                 type="text"
//                 name="college_company"
//                 placeholder="College / Company Name"
//                 value={formData.college_company}
//                 onChange={handleChange}
//                 className={getInputClassName("college_company")}
//                 required
//               />
//               {errors.college_company && <p className="text-red-500 text-sm mt-1">{errors.college_company}</p>}
//             </div>
//             {/* Address */}
//             <div>
//               <textarea
//                 name="address"
//                 placeholder="Complete Address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className={getInputClassName("address")}
//                 rows="3"
//                 required
//               />
//               {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
//             </div>
//             {/* Password */}
//             <div>
//               <PasswordInput
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 error={errors.password}
//                 showPassword={showPassword}
//                 onToggleShowPassword={() => setShowPassword(!showPassword)}
//                 onChange={handleChange}
//                 passwordStrength={passwordStrength}
//                 showStrength={true}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Password must be at least 8 characters with uppercase, lowercase, number, and special character
//               </p>
//             </div>
//             {/* Confirm Password */}
//             <div>
//               <PasswordInput
//                 name="password2"
//                 placeholder="Confirm Password"
//                 value={formData.password2}
//                 error={errors.password2}
//                 showPassword={showConfirmPassword}
//                 onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
//                 onChange={handleChange}
//                 passwordStrength=""
//                 showStrength={false}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-60"
//             >
//               {loading ? "Sending OTP..." : "Register"}
//             </button>
//             <p className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <span
//                 className="text-blue-600 hover:underline cursor-pointer"
//                 onClick={() => {
//                   handleClose();
//                   if (onSwitchToLogin) onSwitchToLogin();
//                 }}
//               >
//                 Login
//               </span>
//             </p>
//           </form>
//         );
//       case 2: // OTP Verification
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold text-blue-700 mb-2">
//                 Verify Your Email
//               </h2>
//               <p className="text-gray-600">
//                 We've sent a 6-digit OTP to <span className="font-semibold">{email}</span>
//               </p>
//               <button
//                 onClick={handleBackToForm}
//                 className="text-sm text-blue-600 hover:underline mt-1"
//               >
//                 ← Back to registration form
//               </button>
//             </div>
//             <form onSubmit={handleOTPSubmit} className="space-y-4">
//               <OTPInput
//                 value={otp}
//                 onChange={setOtp}
//                 onResend={handleResendOTP}
//                 timeLeft={timeLeft}
//                 canResend={canResend}
//               />
//               {otpError && (
//                 <p className="text-red-500 text-sm text-center">{otpError}</p>
//               )}
//               <button
//                 type="submit"
//                 disabled={otpLoading || otp.length !== 6}
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-60"
//               >
//                 {otpLoading ? "Verifying..." : "Verify OTP"}
//               </button>
//             </form>
//             <p className="text-xs text-gray-500 text-center">
//               Didn't receive the code? Check your spam folder or request a new one.
//             </p>
//           </div>
//         );
//       case 3: // Success Message
//         return (
//           <SuccessMessage 
//             email={email} 
//             onLogin={handleLogin}
//           />
//         );
//       default:
//         return null;
//     }
//   };
//   return (
//     <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto p-6">
//         <button
//           onClick={handleClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl z-10"
//         >
//           ✖
//         </button>
//         {renderStep()}
//       </div>
//     </div>
//   );
// }
// export default Register;
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Fixed Password Input Component - Defined outside or with useCallback
const PasswordInput = React.memo(({ 
  name, 
  label,
  placeholder, 
  value, 
  error, 
  showPassword, 
  onToggleShowPassword,
  onChange,
  passwordStrength,
  showStrength
}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        id={name}
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors pr-10 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        required
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : showStrength ? `${name}-strength` : undefined}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={onToggleShowPassword}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.29 3.29M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
      {/* Password strength indicator for main password field only */}
      {showStrength && passwordStrength && (
        <p id={`${name}-strength`} className={`text-sm mt-1 ${getPasswordStrengthColor(passwordStrength)}`}>
          Strength: {passwordStrength}
        </p>
      )}
      {error && <p id={`${name}-error`} className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  </div>
));
// OTP Input Component
const OTPInput = ({ value, onChange, onResend, timeLeft, canResend }) => {
  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      onChange(val);
    }
  };
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Enter OTP <span className="text-red-500">*</span>
        </label>
        <input
          id="otp"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
          autoFocus
          required
          aria-label="6-digit OTP code"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {timeLeft > 0 ? (
            <>OTP expires in: <span className="font-semibold text-blue-600">{timeLeft}s</span></>
          ) : (
            <span className="text-red-500">OTP expired</span>
          )}
        </p>
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend || timeLeft > 0}
          className={`text-sm font-semibold ${
            !canResend || timeLeft > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:text-blue-800 hover:underline"
          }`}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};
// Success Message Component
const SuccessMessage = ({ email, onLogin }) => (
  <div className="text-center space-y-6 py-8">
    <div className="flex justify-center">
      <div className="bg-green-100 rounded-full p-4">
        <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-800">Registration Initiated!</h3>
    <p className="text-gray-600">
      Your account has been created successfully for <span className="font-semibold">{email}</span>.
    </p>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
      <p className="text-yellow-800 font-medium mb-2">⚠️ Admin Approval Required</p>
      <p className="text-yellow-700 text-sm">
        Your account is pending admin approval. You will be able to login only after an 
        administrator approves your account. We'll notify you once your account is approved.
      </p>
    </div>
    <button
      onClick={onLogin}
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
    >
      Go to Login
    </button>
  </div>
);
// Helper function outside component
const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case "Strong": return "text-green-600";
    case "Medium": return "text-yellow-600";
    case "Weak": return "text-red-600";
    case "Too short": return "text-red-600";
    default: return "text-gray-600";
  }
};
function Register({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  // States for different steps
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone_number: "+91", // Set default +91
    college_company: "",
    address: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  // Timer for OTP expiration
  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);
  // Use useCallback to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Apply input masking/filtering based on field type
    let processedValue = value;
    if (name === "full_name") {
      // Allow only letters, spaces, dots, and hyphens for full name
      processedValue = value.replace(/[^A-Za-z\s.-]/g, '');
      // Prevent multiple spaces
      processedValue = processedValue.replace(/\s+/g, ' ');
    }
    if (name === "username") {
      // Allow only letters, numbers, underscores, and dots for username
      processedValue = value.replace(/[^a-zA-Z0-9_.]/g, '');
    }
    if (name === "phone_number") {
      // Ensure +91 prefix is always present and non-removable
      if (!value.startsWith('+91')) {
        processedValue = '+91' + value.replace(/[^0-9]/g, '');
      } else {
        // Keep the +91 prefix and only allow digits after it
        const prefix = '+91';
        const rest = value.slice(3).replace(/[^0-9]/g, '');
        processedValue = prefix + rest;
      }
      // Limit to 13 characters total (+91 + 10 digits)
      if (processedValue.length > 13) {
        processedValue = processedValue.slice(0, 13);
      }
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    // Real-time password strength feedback
    if (name === "password") {
      if (value.length === 0) {
        setPasswordStrength("");
      } else if (value.length < 8) {
        setPasswordStrength("Too short");
      } else {
        // Check for complexity
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
        const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        if (strengthCount === 4) {
          setPasswordStrength("Strong");
        } else if (strengthCount >= 2) {
          setPasswordStrength("Medium");
        } else {
          setPasswordStrength("Weak");
        }
      }
    }
    // Update email state for later use
    if (name === "email") {
      setEmail(value);
    }
  }, [errors]);
  // Memoized input className function
  const getInputClassName = useCallback((fieldName) => {
    return `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
      errors[fieldName] ? "border-red-500" : "border-gray-300"
    }`;
  }, [errors]);
  const validateForm = () => {
    const newErrors = {};
    // Full Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters long";
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = "Full name must be less than 100 characters";
    } else if (!/^[A-Za-z\s.-]+$/.test(formData.full_name)) {
      newErrors.full_name = "Full name can only contain letters, spaces, dots, and hyphens";
    } else if (/\s{2,}/.test(formData.full_name)) {
      newErrors.full_name = "Full name cannot contain multiple consecutive spaces";
    }
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, underscores, and dots";
    } else if (/^[._]|[._]$/.test(formData.username)) {
      newErrors.username = "Username cannot start or end with underscore or dot";
    } else if (/[._]{2,}/.test(formData.username)) {
      newErrors.username = "Username cannot have consecutive underscores or dots";
    }
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@example.com)";
    } else if (formData.email.length > 254) {
      newErrors.email = "Email address is too long";
    }
    // Phone Number validation - Now required with +91 prefix
    if (!formData.phone_number || formData.phone_number === "+91") {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+\d{12,13}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid 10-digit Indian phone number after +91";
    } else if (formData.phone_number.length !== 13) { // +91 + 10 digits = 13 characters
      newErrors.phone_number = "Phone number must be exactly 10 digits after +91";
    }
    // College/Company validation
    if (!formData.college_company.trim()) {
      newErrors.college_company = "College/Company is required";
    } else if (formData.college_company.length < 2) {
      newErrors.college_company = "College/Company name must be at least 2 characters long";
    } else if (formData.college_company.length > 200) {
      newErrors.college_company = "College/Company name must be less than 200 characters";
    } else if (!/^[A-Za-z0-9\s&.,'-]+$/.test(formData.college_company)) {
      newErrors.college_company = "College/Company name can only contain letters, numbers, spaces, and basic punctuation (&.,'-)";
    }
    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 10) {
      newErrors.address = "Address must be at least 10 characters long";
    } else if (formData.address.length > 500) {
      newErrors.address = "Address must be less than 500 characters";
    } else if (!/^[A-Za-z0-9\s,.#\-'()]+$/.test(formData.address)) {
      newErrors.address = "Address contains invalid characters";
    }
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
    } else {
      // Check for complexity
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
      if (!hasUpper) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!hasLower) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!hasNumber) {
        newErrors.password = "Password must contain at least one number";
      } else if (!hasSpecial) {
        newErrors.password = "Password must contain at least one special character";
      }
    }
    // Confirm Password validation
    if (!formData.password2) {
      newErrors.password2 = "Please confirm your password";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleClose = () => {
    navigate("/");
    if (onClose) onClose();
  };
  // Handle initial registration and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      // Prepare data for backend
      const submitData = {
        full_name: formData.full_name.trim().replace(/\s+/g, ' '),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number || "",
        college_company: formData.college_company.trim(),
        address: formData.address.trim(),
        role: "customer",
        password: formData.password,
        password2: formData.password2,
      };
      // Call registration init endpoint to send OTP
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/init/",
        submitData,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      // Set email for OTP verification
      setEmail(formData.email);
      // Move to OTP verification step
      setStep(2);
      setTimeLeft(60); // Reset timer
    } catch (error) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            formattedErrors[key] = serverErrors[key].join(", ");
          } else if (typeof serverErrors[key] === 'string') {
            formattedErrors[key] = serverErrors[key];
          } else {
            formattedErrors[key] = "Invalid field";
          }
        });
        setErrors(formattedErrors);
        const errorMessages = Object.values(formattedErrors).join("\n");
        alert(`❌ Registration failed!\n${errorMessages}`);
      } else if (error.request) {
        alert("❌ Network error: Could not connect to server. Please check your connection.");
      } else {
        alert("❌ Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  // Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/verify/",
        {
          email: email,
          otp_code: otp
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      // Move to success step
      setStep(3);
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          setOtpError(error.response.data.error);
        } else if (error.response.data.message) {
          setOtpError(error.response.data.message);
        } else {
          setOtpError("OTP verification failed. Please try again.");
        }
      } else if (error.request) {
        setOtpError("Network error. Please check your connection.");
      } else {
        setOtpError("Something went wrong. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    setCanResend(false);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/register/resend-otp/",
        { email: email },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      // Reset timer
      setTimeLeft(60);
      setOtpError("");
      // Allow resend after 30 seconds
      setTimeout(() => {
        setCanResend(true);
      }, 30000);
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
      setCanResend(true);
    }
  };
  // Handle back to registration form
  const handleBackToForm = () => {
    setStep(1);
    setOtp("");
    setOtpError("");
    setTimeLeft(60);
  };
  // Handle login navigation
  const handleLogin = () => {
    handleClose();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate("/login");
    }
  };
  // Render based on current step
  const renderStep = () => {
    switch (step) {
      case 1: // Registration Form
        return (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Fill in your details below (<span className="text-red-500">*</span> indicates required field)
              </p>
            </div>
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                placeholder="e.g., John Doe"
                value={formData.full_name}
                onChange={handleChange}
                className={getInputClassName("full_name")}
                required
                aria-describedby={errors.full_name ? "full_name-error" : undefined}
              />
              {errors.full_name && (
                <p id="full_name-error" className="text-red-500 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>
            {/* Username */}
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="e.g., john_doe123"
                value={formData.username}
                onChange={handleChange}
                className={getInputClassName("username")}
                required
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName("email")}
                required
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            {/* Phone Number - Now required with +91 prefix */}
            <div className="space-y-1">
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone_number"
                type="text"
                name="phone_number"
                placeholder="+91XXXXXXXXXX"
                value={formData.phone_number}
                onChange={handleChange}
                className={getInputClassName("phone_number")}
                required
                aria-describedby={errors.phone_number ? "phone_number-error" : "phone_number-hint"}
              />
              <p id="phone_number-hint" className="text-xs text-gray-500 mt-1">
                Enter 10-digit Indian mobile number (automatically prefixed with +91)
              </p>
              {errors.phone_number && (
                <p id="phone_number-error" className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>
            {/* College/Company */}
            <div className="space-y-1">
              <label htmlFor="college_company" className="block text-sm font-medium text-gray-700">
                College / Company <span className="text-red-500">*</span>
              </label>
              <input
                id="college_company"
                type="text"
                name="college_company"
                placeholder="Enter your college or company name"
                value={formData.college_company}
                onChange={handleChange}
                className={getInputClassName("college_company")}
                required
                aria-describedby={errors.college_company ? "college_company-error" : undefined}
              />
              {errors.college_company && (
                <p id="college_company-error" className="text-red-500 text-sm mt-1">{errors.college_company}</p>
              )}
            </div>
            {/* Address */}
            <div className="space-y-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
                className={getInputClassName("address")}
                rows="3"
                required
                aria-describedby={errors.address ? "address-error" : "address-hint"}
              />
              <p id="address-hint" className="text-xs text-gray-500 mt-1">
                Street address, city, state, postal code
              </p>
              {errors.address && (
                <p id="address-error" className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            {/* Password */}
            <PasswordInput
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              error={errors.password}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onChange={handleChange}
              passwordStrength={passwordStrength}
              showStrength={true}
            />
            <p className="text-xs text-gray-500 -mt-2">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
            {/* Confirm Password */}
            <PasswordInput
              name="password2"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.password2}
              error={errors.password2}
              showPassword={showConfirmPassword}
              onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={handleChange}
              passwordStrength=""
              showStrength={false}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-60 mt-6"
            >
              {loading ? "Sending OTP..." : "Register"}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <span
                className="text-blue-600 hover:underline cursor-pointer font-medium"
                onClick={() => {
                  handleClose();
                  if (onSwitchToLogin) onSwitchToLogin();
                }}
              >
                Login
              </span>
            </p>
          </form>
        );
      case 2: // OTP Verification
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit OTP to <span className="font-semibold">{email}</span>
              </p>
              <button
                onClick={handleBackToForm}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                ← Back to registration form
              </button>
            </div>
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <OTPInput
                value={otp}
                onChange={setOtp}
                onResend={handleResendOTP}
                timeLeft={timeLeft}
                canResend={canResend}
              />
              {otpError && (
                <p className="text-red-500 text-sm text-center">{otpError}</p>
              )}
              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-60"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center">
              Didn't receive the code? Check your spam folder or request a new one.
            </p>
          </div>
        );
      case 3: // Success Message
        return (
          <SuccessMessage 
            email={email} 
            onLogin={handleLogin}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          ✖
        </button>
        {renderStep()}
      </div>
    </div>
  );
}
export default Register;