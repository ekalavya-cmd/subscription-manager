// Registration functionality for Subscription Manager
// Separated from register.html for better code organization

(function () {
  "use strict";

  // Create the registration application module
  angular
    .module("registerApp", [])
    .controller("RegisterController", [
      "$scope",
      "$http",
      "$window",
      "$timeout",
      RegisterController,
    ]);

  function RegisterController($scope, $http, $window, $timeout) {
    // Initialize scope variables
    $scope.credentials = {};
    $scope.error = "";
    $scope.success = "";
    $scope.usernameError = "";
    $scope.passwordError = "";
    $scope.confirmPasswordError = "";
    $scope.termsError = "";
    $scope.isLoading = false;
    $scope.showDebug = localStorage.getItem("debugMode") === "true";
    $scope.showPassword = false;
    $scope.showConfirmPassword = false;

    // Log controller initialization
    logger.info("Register controller initialized");
    logger.markStart("register-page-load");

    // Initialize the controller
    init();

    /**
     * Initialize the registration controller
     */
    function init() {
      // Focus first input when page loads
      $timeout(function () {
        const usernameField = document.getElementById("username");
        if (usernameField) {
          usernameField.focus();
        }
        logger.markEnd("register-page-load");
      }, 100);

      // Set up event listeners
      setupEventListeners();

      // Log performance metrics when page is fully loaded
      $window.addEventListener("load", function () {
        logPerformanceMetrics();
      });

      // Log when user leaves the page
      $window.addEventListener("beforeunload", function () {
        logger.info("User leaving register page");
      });
    }

    /**
     * Set up event listeners for form interactions
     */
    function setupEventListeners() {
      $timeout(function () {
        const inputs = ["username", "password", "confirmPassword"];
        inputs.forEach(function (inputId) {
          const input = document.getElementById(inputId);
          if (input) {
            input.addEventListener("blur", function () {
              logger.logUserAction(`${inputId}-input-blur`, this, {
                hasValue: !!this.value,
                isValid: this.checkValidity(),
              });
            });

            input.addEventListener("input", function () {
              if (inputId === "password") {
                logger.debug("Password strength calculated", {
                  strength: $scope.getPasswordStrength(),
                });
              }
            });
          }
        });

        // Log terms checkbox interaction
        const termsCheckbox = document.getElementById("agreeTerms");
        if (termsCheckbox) {
          termsCheckbox.addEventListener("change", function () {
            logger.logUserAction("terms-checkbox-changed", this, {
              checked: this.checked,
            });
          });
        }
      }, 100);

      // Debug mode toggle (Ctrl+Shift+D)
      document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.shiftKey && event.key === "D") {
          event.preventDefault();
          $scope.$apply(function () {
            $scope.showDebug = !$scope.showDebug;
            localStorage.setItem("debugMode", $scope.showDebug.toString());
            logger.info("Debug mode toggled", { enabled: $scope.showDebug });
          });
        }

        // Handle form reset on Escape key
        if (event.key === "Escape" && !$scope.isLoading) {
          $scope.$apply(function () {
            $scope.clearForm();
          });
        }
      });
    }

    /**
     * Log performance metrics
     */
    function logPerformanceMetrics() {
      logger.info("Register page fully loaded");

      if (performance.timing) {
        const timing = performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoadedTime =
          timing.domContentLoadedEventEnd - timing.navigationStart;

        logger.info(
          `Performance metrics - Page load: ${pageLoadTime}ms, DOM ready: ${domContentLoadedTime}ms`
        );
      }
    }

    /**
     * Toggle password visibility
     */
    $scope.togglePasswordVisibility = function () {
      $scope.showPassword = !$scope.showPassword;
      logger.logUserAction("toggle-password-visibility", null, {
        visible: $scope.showPassword,
      });

      // Maintain focus on password field
      $timeout(function () {
        document.getElementById("password")?.focus();
      }, 0);
    };

    /**
     * Toggle confirm password visibility
     */
    $scope.toggleConfirmPasswordVisibility = function () {
      $scope.showConfirmPassword = !$scope.showConfirmPassword;
      logger.logUserAction("toggle-confirm-password-visibility", null, {
        visible: $scope.showConfirmPassword,
      });

      // Maintain focus on confirm password field
      $timeout(function () {
        document.getElementById("confirmPassword")?.focus();
      }, 0);
    };

    /**
     * Handle keyboard navigation between form fields
     * @param {Event} event - The keyboard event
     * @param {string} nextField - The next field to focus
     */
    $scope.moveToNextField = function (event, nextField) {
      if (event.keyCode === 13) {
        // Enter key
        event.preventDefault();
        logger.logUserAction("enter-key-pressed", event.target, {
          currentField: event.target.id,
          nextField: nextField,
        });

        switch (nextField) {
          case "password":
            document.getElementById("password")?.focus();
            break;
          case "confirmPassword":
            document.getElementById("confirmPassword")?.focus();
            break;
          case "submit":
            if ($scope.isFormValid()) {
              $scope.register();
            } else {
              // Focus on first invalid field
              const firstInvalidField = document.querySelector(
                ".form-control.is-invalid, .form-control:invalid"
              );
              if (firstInvalidField) {
                firstInvalidField.focus();
              }
            }
            break;
        }
      }
    };

    /**
     * Check if the form is valid
     * @returns {boolean} - True if form is valid
     */
    $scope.isFormValid = function () {
      return (
        $scope.credentials.username &&
        $scope.credentials.password &&
        $scope.credentials.confirmPassword &&
        $scope.credentials.agreeTerms &&
        $scope.isValidUsername($scope.credentials.username) &&
        $scope.credentials.password.length >= 6 &&
        $scope.credentials.password === $scope.credentials.confirmPassword
      );
    };

    /**
     * Validate username format and requirements
     * @param {string} username - The username to validate
     * @returns {boolean} - True if username is valid
     */
    $scope.isValidUsername = function (username) {
      if (!username) return false;
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      return (
        usernameRegex.test(username) &&
        username.length >= 3 &&
        username.length <= 20
      );
    };

    /**
     * Calculate password strength
     * @returns {number} - Password strength percentage (0-100)
     */
    $scope.getPasswordStrength = function () {
      const password = $scope.credentials.password || "";
      let strength = 0;

      // Length checks
      if (password.length >= 6) strength += 20;
      if (password.length >= 10) strength += 20;

      // Character type checks
      if (/[a-z]/.test(password)) strength += 20;
      if (/[A-Z]/.test(password)) strength += 20;
      if (/[0-9]/.test(password)) strength += 10;
      if (/[^A-Za-z0-9]/.test(password)) strength += 10;

      return Math.min(strength, 100);
    };

    /**
     * Get password strength width for progress bar
     * @returns {string} - Width percentage
     */
    $scope.getPasswordStrengthWidth = function () {
      return $scope.getPasswordStrength() + "%";
    };

    /**
     * Get password strength CSS class
     * @returns {string} - Bootstrap CSS class
     */
    $scope.getPasswordStrengthClass = function () {
      const strength = $scope.getPasswordStrength();
      if (strength < 30) return "bg-danger";
      if (strength < 60) return "bg-warning";
      if (strength < 80) return "bg-info";
      return "bg-success";
    };

    /**
     * Get password strength text description
     * @returns {string} - Strength description
     */
    $scope.getPasswordStrengthText = function () {
      const strength = $scope.getPasswordStrength();
      if (!$scope.credentials.password) return "";
      if (strength < 30) return "Weak password";
      if (strength < 60) return "Fair password";
      if (strength < 80) return "Good password";
      return "Strong password";
    };

    /**
     * Validate individual fields and set field-specific errors
     */
    function validateFields() {
      // Clear all previous errors
      $scope.usernameError = "";
      $scope.passwordError = "";
      $scope.confirmPasswordError = "";
      $scope.termsError = "";

      let isValid = true;

      // Username validation
      if (!$scope.credentials.username) {
        $scope.usernameError = "Username is required";
        isValid = false;
      } else if ($scope.credentials.username.length < 3) {
        $scope.usernameError = "Username must be at least 3 characters";
        isValid = false;
      } else if ($scope.credentials.username.length > 20) {
        $scope.usernameError = "Username cannot exceed 20 characters";
        isValid = false;
      } else if (!/^[a-zA-Z0-9_]+$/.test($scope.credentials.username)) {
        $scope.usernameError = "Only letters, numbers, and underscores allowed";
        isValid = false;
      }

      // Enhanced password validation
      if (!$scope.credentials.password) {
        $scope.passwordError = "Password is required";
        isValid = false;
      } else if ($scope.credentials.password.length < 6) {
        $scope.passwordError = "Password must be at least 6 characters";
        isValid = false;
      } else if ($scope.credentials.password.length > 128) {
        $scope.passwordError = "Password is too long (max 128 characters)";
        isValid = false;
      } else if (!/(?=.*[a-zA-Z])/.test($scope.credentials.password)) {
        $scope.passwordError = "Password must contain at least one letter";
        isValid = false;
      } else if (
        !/(?=.*\d)/.test($scope.credentials.password) &&
        !/(?=.*[!@#$%^&*])/.test($scope.credentials.password)
      ) {
        $scope.passwordError =
          "Password must contain a number or special character";
        isValid = false;
      } else if (/(.)\1{2,}/.test($scope.credentials.password)) {
        $scope.passwordError = "Password cannot have repeated characters";
        isValid = false;
      } else if (
        $scope.credentials.username &&
        $scope.credentials.password
          .toLowerCase()
          .includes($scope.credentials.username.toLowerCase())
      ) {
        $scope.passwordError = "Password cannot contain username";
        isValid = false;
      }

      // Confirm password validation
      if (!$scope.credentials.confirmPassword) {
        $scope.confirmPasswordError = "Please confirm your password";
        isValid = false;
      } else if (
        $scope.credentials.password !== $scope.credentials.confirmPassword
      ) {
        $scope.confirmPasswordError = "Passwords do not match";
        isValid = false;
      }

      // Terms validation
      if (!$scope.credentials.agreeTerms) {
        $scope.termsError = "You must agree to the terms and conditions";
        isValid = false;
      }

      return isValid;
    }

    /**
     * Handle registration form submission
     */
    $scope.register = function () {
      logger.info("Registration attempt started", {
        username: $scope.credentials.username,
        timestamp: new Date().toISOString(),
      });
      logger.markStart("register-request");

      // Clear previous messages
      $scope.error = "";
      $scope.success = "";
      $scope.isLoading = true;

      // Validate form inputs
      const isValid = validateFields();

      if (!isValid) {
        $scope.isLoading = false;
        const errorFields = [
          $scope.usernameError,
          $scope.passwordError,
          $scope.confirmPasswordError,
          $scope.termsError,
        ].filter(Boolean);

        logger.logFormValidation("register-form", false, errorFields);

        // Auto-hide field errors after 7 seconds
        $timeout(function () {
          $scope.usernameError = "";
          $scope.passwordError = "";
          $scope.confirmPasswordError = "";
          $scope.termsError = "";
        }, 7000);
        return;
      }

      // Log successful form validation
      logger.logFormValidation("register-form", true);

      // Make registration request
      const startTime = Date.now();
      const registerData = {
        username: $scope.credentials.username.trim(),
        password: $scope.credentials.password,
      };

      $http
        .post("/api/register", registerData)
        .then(function (response) {
          handleRegistrationSuccess(response, Date.now() - startTime);
        })
        .catch(function (error) {
          handleRegistrationError(error, Date.now() - startTime);
        });
    };

    /**
     * Handle successful registration response
     * @param {Object} response - The HTTP response
     * @param {number} duration - Request duration in milliseconds
     */
    function handleRegistrationSuccess(response, duration) {
      logger.markEnd("register-request");
      logger.logRequest("POST", "/api/register", 200, duration);
      logger.info("Registration successful", {
        username: $scope.credentials.username,
        duration: duration,
      });

      $scope.success =
        "Account created successfully! Redirecting to login page...";
      $scope.isLoading = false;

      // Clear form data for security
      $scope.credentials = { agreeTerms: false };

      // Auto-hide success message and redirect after 3 seconds
      $timeout(function () {
        $scope.success = "";
        $window.location.href = "/";
      }, 3000);
    }

    /**
     * Handle registration error response
     * @param {Object} error - The HTTP error response
     * @param {number} duration - Request duration in milliseconds
     */
    function handleRegistrationError(error, duration) {
      const status = error.status || 0;

      logger.markEnd("register-request");
      logger.logRequest("POST", "/api/register", status, duration);
      logger.error("Registration failed", {
        username: $scope.credentials.username,
        error: error.data?.message || "Unknown error",
        status: status,
        duration: duration,
      });

      // Set appropriate field errors based on response
      if (
        status === 400 &&
        error.data?.message?.toLowerCase().includes("already exists")
      ) {
        $scope.usernameError = "Username already taken";
      } else if (
        status === 400 &&
        error.data?.message?.toLowerCase().includes("username")
      ) {
        $scope.usernameError = "Invalid username format";
      } else if (
        status === 400 &&
        error.data?.message?.toLowerCase().includes("password")
      ) {
        $scope.passwordError = "Password does not meet requirements";
      } else if (status === 429) {
        $scope.usernameError = "Too many attempts. Try again later";
      } else if (status === 0) {
        $scope.passwordError = "Connection error. Check internet";
      } else {
        $scope.passwordError = "Registration failed. Please try again";
      }

      $scope.isLoading = false;

      // Auto-hide field errors after 7 seconds
      $timeout(function () {
        $scope.usernameError = "";
        $scope.passwordError = "";
        $scope.confirmPasswordError = "";
        $scope.termsError = "";
      }, 7000);

      // Clear sensitive fields on error for security
      $scope.credentials.password = "";
      $scope.credentials.confirmPassword = "";

      // Focus username field for retry
      $timeout(function () {
        const usernameField = document.getElementById("username");
        if (usernameField) {
          usernameField.focus();
          if (
            status === 400 &&
            error.data?.message?.includes("already exists")
          ) {
            usernameField.select(); // Select username for easy replacement
          }
        }
      }, 100);
    }

    /**
     * Clear all form data and reset validation state
     */
    $scope.clearForm = function () {
      $scope.credentials = {};
      $scope.error = "";
      $scope.success = "";
      $scope.showPassword = false;
      $scope.showConfirmPassword = false;

      logger.logUserAction("clear-registration-form");

      $timeout(function () {
        document.getElementById("username")?.focus();
      }, 0);
    };

    /**
     * Check password match in real-time
     * @returns {boolean} - True if passwords match
     */
    $scope.passwordsMatch = function () {
      if (!$scope.credentials.password || !$scope.credentials.confirmPassword) {
        return null; // No validation yet
      }
      return $scope.credentials.password === $scope.credentials.confirmPassword;
    };

    /**
     * Get real-time validation class for confirm password field
     * @returns {string} - CSS class for validation state
     */
    $scope.getConfirmPasswordClass = function () {
      const passwordsMatch = $scope.passwordsMatch();
      if (passwordsMatch === null) return "";
      return passwordsMatch ? "is-valid" : "is-invalid";
    };

    /**
     * Generate password suggestions
     * @returns {Array} - Array of password suggestions
     */
    $scope.generatePasswordSuggestions = function () {
      const suggestions = [
        "Use a mix of uppercase and lowercase letters",
        "Include numbers for better security",
        "Add special characters like !@#$%",
        "Make it at least 8 characters long",
        "Avoid common words or patterns",
      ];

      const password = $scope.credentials.password || "";
      const applicableSuggestions = [];

      if (!/[A-Z]/.test(password)) applicableSuggestions.push(suggestions[0]);
      if (!/[0-9]/.test(password)) applicableSuggestions.push(suggestions[1]);
      if (!/[^A-Za-z0-9]/.test(password))
        applicableSuggestions.push(suggestions[2]);
      if (password.length < 8) applicableSuggestions.push(suggestions[3]);

      return applicableSuggestions;
    };

    /**
     * Check if username is available (debounced)
     */
    let usernameCheckTimeout;
    $scope.checkUsernameAvailability = function () {
      if (usernameCheckTimeout) {
        $timeout.cancel(usernameCheckTimeout);
      }

      if (
        !$scope.credentials.username ||
        !$scope.isValidUsername($scope.credentials.username)
      ) {
        return;
      }

      usernameCheckTimeout = $timeout(function () {
        // This could be implemented as an API call to check username availability
        logger.debug("Username availability check", {
          username: $scope.credentials.username,
        });
      }, 500); // 500ms debounce
    };

    // Watch for username changes to trigger availability check
    $scope.$watch("credentials.username", function (newValue) {
      if (newValue) {
        $scope.checkUsernameAvailability();
      }
    });
  }
})();
