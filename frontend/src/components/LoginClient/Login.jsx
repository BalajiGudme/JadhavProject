import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  
  // OTP Verification States
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  // New Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      // Check if user is admin
      if (response.data.user.role === "admin") {
        setError("Admin users must login through the admin portal.");
        setLoading(false);
        return;
      }

      // Save tokens + user info for non-admin users
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect regular users to home page
      navigate("/");

      // Close modal after login
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else if (err.response.status === 400) {
          if (err.response.data.detail) {
            setError(err.response.data.detail);
          } else if (err.response.data.email) {
            setError(err.response.data.email[0]);
          } else if (err.response.data.password) {
            setError(err.response.data.password[0]);
          } else if (typeof err.response.data === 'string') {
            setError(err.response.data);
          } else if (err.response.data.non_field_errors) {
            setError(err.response.data.non_field_errors[0]);
          } else {
            setError("Please check your input and try again.");
          }
        } else if (err.response.status === 403) {
          setError("Account not active. Please contact administrator.");
        } else if (err.response.status === 404) {
          setError("Service not found. Please check the server.");
        } else if (err.response.status >= 500) {
          const backendMessage = err.response?.data?.detail || 
                                err.response?.data?.message || 
                                err.response?.data?.error ||
                                err.response?.data?.non_field_errors?.[0];
          
          if (backendMessage) {
            setError(backendMessage);
          } else {
            setError("Server error. Please try again later.");
          }
        } else {
          setError(`Login failed: ${err.response.status}`);
        }
      } else if (err.request) {
        if (err.code === 'ECONNABORTED') {
          setError("Request timeout. Please try again.");
        } else {
          setError("No response from server. Check your connection and make sure the backend is running.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setForgotPasswordSuccess(false);
    setForgotPasswordLoading(true);
    
    // Reset OTP related states
    setOtp("");
    setShowOtpInput(false);
    setShowNewPasswordInput(false);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/password-reset/request/",
        {
          email: forgotPasswordEmail,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      // Only show OTP input if request was successful
      setForgotPasswordSuccess(true);
      setForgotPasswordMessage(response.data.detail || "OTP sent successfully! Check your email.");
      setShowOtpInput(true);
      
    } catch (err) {
      // Clear any previous OTP state on error
      setOtp("");
      setShowOtpInput(false);
      setShowNewPasswordInput(false);
      setForgotPasswordSuccess(false);
      
      if (err.response?.data) {
        // Handle specific error messages from backend
        const errorMessage = err.response.data.detail || 
                            err.response.data.email?.[0] ||
                            err.response.data.non_field_errors?.[0] ||
                            "Failed to send OTP. Please try again.";
        setForgotPasswordMessage(errorMessage);
      } else if (err.request) {
        setForgotPasswordMessage("Network error. Please check your connection.");
      } else {
        setForgotPasswordMessage("Failed to send OTP. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setForgotPasswordLoading(true);

    // Validate OTP
    if (!otp || otp.length < 4) {
      setForgotPasswordMessage("Please enter a valid OTP.");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/password-reset/verify-otp/",
        {
          email: forgotPasswordEmail,
          otp: otp.trim(), // Remove any whitespace
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        setForgotPasswordSuccess(true);
        setForgotPasswordMessage("OTP verified successfully! Now set your new password.");
        setShowOtpInput(false);
        setShowNewPasswordInput(true);
      }
      
    } catch (err) {
      setForgotPasswordSuccess(false);
      
      if (err.response?.data) {
        const errorMessage = err.response.data.detail || 
                            err.response.data.otp?.[0] ||
                            err.response.data.non_field_errors?.[0] ||
                            "Invalid OTP. Please try again.";
        setForgotPasswordMessage(errorMessage);
        
        // If OTP is invalid/expired, clear it
        setOtp("");
      } else if (err.request) {
        setForgotPasswordMessage("Network error. Please check your connection.");
      } else {
        setForgotPasswordMessage("Failed to verify OTP. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setResetPasswordLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setForgotPasswordMessage("Passwords do not match.");
      setResetPasswordLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setForgotPasswordMessage("Password must be at least 6 characters long.");
      setResetPasswordLoading(false);
      return;
    }

    // Validate OTP is still there
    if (!otp) {
      setForgotPasswordMessage("OTP is missing. Please restart the password reset process.");
      setResetPasswordLoading(false);
      return;
    }

    const payload = {
      email: forgotPasswordEmail,
      otp: otp.trim(),
      new_password: newPassword,
      confirm_password: confirmPassword,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/password-reset/confirm/",
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      setForgotPasswordSuccess(true);
      setForgotPasswordMessage("Password reset successfully! You can now login with your new password.");
      
      // Reset all states and go back to login after delay
      setTimeout(() => {
        handleBackToLogin();
      }, 3000);
      
    } catch (err) {
      setForgotPasswordSuccess(false);
      
      if (err.response?.data) {
        const backendMessage = err.response.data.detail || 
                              err.response.data.new_password?.[0] ||
                              err.response.data.non_field_errors?.[0] ||
                              err.response.data.otp?.[0] ||
                              "Failed to reset password. Please try again.";
        setForgotPasswordMessage(backendMessage);
        
        // If OTP is invalid, go back to OTP input
        if (err.response.data.non_field_errors?.[0]?.includes("OTP") || 
            err.response.data.otp) {
          setTimeout(() => {
            setShowNewPasswordInput(false);
            setShowOtpInput(true);
            setOtp("");
          }, 2000);
        }
      } else if (err.request) {
        setForgotPasswordMessage("Network error. Please check your connection.");
      } else {
        setForgotPasswordMessage("Failed to reset password. Please try again.");
      }
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };

  const handleSwitchToForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordEmail(email); // Pre-fill with login email
    setShowOtpInput(false);
    setShowNewPasswordInput(false);
    setForgotPasswordMessage("");
    setForgotPasswordSuccess(false);
    setOtp(""); // Clear any old OTP
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOtpInput(false);
    setShowNewPasswordInput(false);
    setForgotPasswordMessage("");
    setForgotPasswordSuccess(false);
    setForgotPasswordEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResendOtp = () => {
    // Reset to forgot password form with email prefilled
    setShowOtpInput(false);
    setShowNewPasswordInput(false);
    setForgotPasswordMessage("");
    setOtp("");
    // Trigger forgot password again
    handleForgotPassword(new Event('submit'));
  };

  const handleAdminLoginRedirect = () => {
    // Call the onClose prop if it exists
    onClose && onClose();
    navigate("/admin-login");
  };

  // New Password Form
  if (showForgotPassword && showNewPasswordInput) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md relative p-6 shadow-lg animate-fade-in">
          <button
            onClick={handleClose}
            disabled={resetPasswordLoading}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✖
          </button>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-blue-700">Set New Password</h2>

            {forgotPasswordMessage && (
              <div className={`p-3 rounded-lg text-center font-medium ${
                forgotPasswordSuccess
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={resetPasswordLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
                minLength="6"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPasswordLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={resetPasswordLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                resetPasswordLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
              }`}
            >
              {resetPasswordLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Back to{" "}
              <span
                onClick={handleBackToLogin}
                disabled={resetPasswordLoading}
                className={`text-blue-600 cursor-pointer ${
                  resetPasswordLoading ? 'opacity-50 pointer-events-none' : 'hover:underline'
                }`}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // OTP Verification Form
  if (showForgotPassword && showOtpInput) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md relative p-6 shadow-lg animate-fade-in">
          <button
            onClick={handleClose}
            disabled={forgotPasswordLoading}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✖
          </button>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-blue-700">Verify OTP</h2>

            {forgotPasswordMessage && (
              <div className={`p-3 rounded-lg text-center font-medium ${
                forgotPasswordSuccess
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))} // Remove spaces
                disabled={forgotPasswordLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-center text-lg font-mono"
                required
                maxLength="6"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to {forgotPasswordEmail}
              </p>
            </div>

            <button
              type="submit"
              disabled={forgotPasswordLoading || otp.length < 4}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                forgotPasswordLoading || otp.length < 4
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
              }`}
            >
              {forgotPasswordLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying OTP...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive OTP?{" "}
                <span
                  onClick={handleResendOtp}
                  disabled={forgotPasswordLoading}
                  className={`text-blue-600 cursor-pointer ${
                    forgotPasswordLoading ? 'opacity-50 pointer-events-none' : 'hover:underline'
                  }`}
                >
                  Resend OTP
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Back to{" "}
                <span
                  onClick={handleBackToLogin}
                  disabled={forgotPasswordLoading}
                  className={`text-blue-600 cursor-pointer ${
                    forgotPasswordLoading ? 'opacity-50 pointer-events-none' : 'hover:underline'
                  }`}
                >
                  Login
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Forgot Password Form (Initial)
  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md relative p-6 shadow-lg animate-fade-in">
          <button
            onClick={handleClose}
            disabled={forgotPasswordLoading}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✖
          </button>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-blue-700">Reset Password</h2>

            {forgotPasswordMessage && (
              <div className={`p-3 rounded-lg text-center font-medium ${
                forgotPasswordSuccess
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="forgotEmail" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="forgotEmail"
                type="email"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={forgotPasswordLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotPasswordLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                forgotPasswordLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
              }`}
            >
              {forgotPasswordLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Send OTP'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <span
                onClick={handleBackToLogin}
                disabled={forgotPasswordLoading}
                className={`text-blue-600 cursor-pointer ${
                  forgotPasswordLoading ? 'opacity-50 pointer-events-none' : 'hover:underline'
                }`}
              >
                Back to Login
              </span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Main Login Form
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md relative p-6 shadow-lg animate-fade-in">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          ✖
        </button>

        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-blue-700">User Login</h2>

          {error && (
            <div className={`p-3 rounded-lg text-center font-medium ${
              error.toLowerCase().includes("awaiting") || error.toLowerCase().includes("active") || error.toLowerCase().includes("admin")
                ? "bg-orange-50 text-orange-700 border border-orange-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="text-right">
            <span
              onClick={handleSwitchToForgotPassword}
              disabled={loading}
              className={`text-sm text-blue-600 cursor-pointer ${
                loading ? 'opacity-50 pointer-events-none' : 'hover:underline'
              }`}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login as User'
            )}
          </button>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={handleSwitchToRegister}
                disabled={loading}
                className={`text-blue-600 cursor-pointer ${
                  loading ? 'opacity-50 pointer-events-none' : 'hover:underline'
                }`}
              >
                Register
              </span>
            </p>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">Are you an administrator?</p>
              <button
                type="button"
                onClick={handleAdminLoginRedirect}
                className="w-full py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
              >
                Go to Admin Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;