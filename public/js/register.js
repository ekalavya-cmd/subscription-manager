// Registration functionality for Subscription Manager
// Enhanced with smooth navigation transitions

(function () {
  "use strict";

  // Create the register application module
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
    $scope.usernameError = "";
    $scope.passwordError = "";
    $scope.confirmPasswordError = "";
    $scope.termsError = "";
    $scope.success = "";
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
     * Initialize the register controller
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
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        if (usernameInput) {
          usernameInput.addEventListener("blur", function () {
            logger.logUserAction("username-input-blur", this, {
              hasValue: !!this.value,
              isValid: $scope.isValidUsername(this.value),
            });
          });

          usernameInput.addEventListener("input", function () {
            $scope.$apply(function () {
              $scope.validateUsername();
            });
          });
        }

        if (passwordInput) {
          passwordInput.addEventListener("blur", function () {
            logger.logUserAction("password-input-blur", this, {
              hasValue: !!this.value,
              length: this.value ? this.value.length : 0,
            });
          });

          passwordInput.addEventListener("input", function () {
            $scope.$apply(function () {
              $scope.validatePassword();
              $scope.validateConfirmPassword(); // Re-validate confirm password when password changes
            });
          });
        }

        if (confirmPasswordInput) {
          confirmPasswordInput.addEventListener("blur", function () {
            logger.logUserAction("confirm-password-input-blur", this, {
              hasValue: !!this.value,
              matches: this.value === $scope.credentials.password,
            });
          });

          confirmPasswordInput.addEventListener("input", function () {
            $scope.$apply(function () {
              $scope.validateConfirmPassword();
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
        const firstPaintTime =
          performance
            .getEntriesByType("paint")
            .find((entry) => entry.name === "first-contentful-paint")
            ?.startTime || 0;

        logger.info(
          `Performance metrics - Page load: ${pageLoadTime}ms, DOM ready: ${domContentLoadedTime}ms, First paint: ${Math.round(
            firstPaintTime
          )}ms`
        );
      }
    }

    /**
     * Validate username format and requirements
     * @param {string} username - The username to validate
     * @returns {boolean} - True if username is valid
     */
    $scope.isValidUsername = function (username) {
      if (!username) return false;
      // Only allow letters, numbers, and underscores
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      return (
        usernameRegex.test(username) &&
        username.length >= 3 &&
        username.length <= 20
      );
    };

    /**
     * Validate username field
     */
    $scope.validateUsername = function () {
      $scope.usernameError = "";

      if (!$scope.credentials.username) {
        return; // Don't show error for empty field during typing
      }

      if ($scope.credentials.username.length < 3) {
        $scope.usernameError = "Username must be at least 3 characters";
      } else if ($scope.credentials.username.length > 20) {
        $scope.usernameError = "Username cannot exceed 20 characters";
      } else if (!$scope.isValidUsername($scope.credentials.username)) {
        $scope.usernameError =
          "Username can only contain letters, numbers, and underscores";
      }
    };

    /**
     * Validate password field
     */
    $scope.validatePassword = function () {
      $scope.passwordError = "";

      if (!$scope.credentials.password) {
        return; // Don't show error for empty field during typing
      }

      if ($scope.credentials.password.length < 6) {
        $scope.passwordError = "Password must be at least 6 characters";
      } else if ($scope.credentials.password.length > 128) {
        $scope.passwordError = "Password is too long";
      } else if (!/(?=.*[a-zA-Z])/.test($scope.credentials.password)) {
        $scope.passwordError = "Password must contain at least one letter";
      }
    };

    /**
     * Validate confirm password field
     */
    $scope.validateConfirmPassword = function () {
      $scope.confirmPasswordError = "";

      if (!$scope.credentials.confirmPassword) {
        return; // Don't show error for empty field during typing
      }

      if ($scope.credentials.confirmPassword !== $scope.credentials.password) {
        $scope.confirmPasswordError = "Passwords do not match";
      }
    };

    /**
     * Validate terms and conditions
     */
    $scope.validateTerms = function () {
      $scope.termsError = "";

      if (!$scope.credentials.agreeTerms) {
        $scope.termsError = "You must agree to the terms and conditions";
      }
    };

    /**
     * Get password strength class for progress bar
     */
    $scope.getPasswordStrengthClass = function () {
      const strength = calculatePasswordStrength($scope.credentials.password);
      switch (strength) {
        case 1:
          return "bg-danger";
        case 2:
          return "bg-warning";
        case 3:
          return "bg-info";
        case 4:
          return "bg-success";
        default:
          return "bg-secondary";
      }
    };

    /**
     * Get password strength width for progress bar
     */
    $scope.getPasswordStrengthWidth = function () {
      const strength = calculatePasswordStrength($scope.credentials.password);
      return strength * 25 + "%";
    };

    /**
     * Get password strength text
     */
    $scope.getPasswordStrengthText = function () {
      const strength = calculatePasswordStrength($scope.credentials.password);
      switch (strength) {
        case 1:
          return "Weak";
        case 2:
          return "Fair";
        case 3:
          return "Good";
        case 4:
          return "Strong";
        default:
          return "";
      }
    };

    /**
     * Calculate password strength (1-4)
     */
    function calculatePasswordStrength(password) {
      if (!password) return 0;

      let strength = 0;

      // Length check
      if (password.length >= 8) strength++;

      // Contains lowercase
      if (/[a-z]/.test(password)) strength++;

      // Contains uppercase
      if (/[A-Z]/.test(password)) strength++;

      // Contains numbers or special characters
      if (/[\d\W]/.test(password)) strength++;

      return strength;
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

        if (nextField === "password") {
          const passwordField = document.getElementById("password");
          if (passwordField) {
            passwordField.focus();
          }
        } else if (nextField === "confirmPassword") {
          const confirmPasswordField =
            document.getElementById("confirmPassword");
          if (confirmPasswordField) {
            confirmPasswordField.focus();
          }
        } else if (nextField === "submit") {
          $scope.register();
        }
      }
    };

    /**
     * Validate all fields for form submission
     */
    function validateAllFields() {
      // Clear previous errors
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
      } else if (!$scope.isValidUsername($scope.credentials.username)) {
        $scope.usernameError =
          "Username can only contain letters, numbers, and underscores";
        isValid = false;
      }

      // Password validation
      if (!$scope.credentials.password) {
        $scope.passwordError = "Password is required";
        isValid = false;
      } else if ($scope.credentials.password.length < 6) {
        $scope.passwordError = "Password must be at least 6 characters";
        isValid = false;
      } else if ($scope.credentials.password.length > 128) {
        $scope.passwordError = "Password is too long";
        isValid = false;
      } else if (!/(?=.*[a-zA-Z])/.test($scope.credentials.password)) {
        $scope.passwordError = "Password must contain at least one letter";
        isValid = false;
      }

      // Confirm password validation
      if (!$scope.credentials.confirmPassword) {
        $scope.confirmPasswordError = "Please confirm your password";
        isValid = false;
      } else if (
        $scope.credentials.confirmPassword !== $scope.credentials.password
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

      $scope.isLoading = true;
      $scope.success = "";

      // Validate all fields
      const isValid = validateAllFields();

      if (!isValid) {
        $scope.isLoading = false;
        logger.logFormValidation(
          "register-form",
          false,
          [
            $scope.usernameError,
            $scope.passwordError,
            $scope.confirmPasswordError,
            $scope.termsError,
          ].filter(Boolean)
        );

        // Auto-hide field errors after 5 seconds
        $timeout(function () {
          $scope.usernameError = "";
          $scope.passwordError = "";
          $scope.confirmPasswordError = "";
          $scope.termsError = "";
        }, 5000);
        return;
      }

      // Log successful form validation
      logger.logFormValidation("register-form", true);

      // Make registration request
      const startTime = Date.now();
      const registrationData = {
        username: $scope.credentials.username.trim(),
        password: $scope.credentials.password,
      };

      $http
        .post("/api/register", registrationData)
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

      $scope.success = "Account created successfully! You can now sign in.";
      $scope.isLoading = false;

      // Clear form
      $scope.credentials = {};

      // Clear success message after 5 seconds and redirect
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
      if (status === 400) {
        if (error.data?.message?.toLowerCase().includes("username")) {
          $scope.usernameError = "Username already exists";
        } else if (error.data?.message?.toLowerCase().includes("password")) {
          $scope.passwordError = "Invalid password format";
        } else {
          $scope.usernameError = "Registration failed - please try again";
        }
      } else if (status === 429) {
        $scope.usernameError = "Too many attempts. Try again later";
      } else if (status === 0) {
        $scope.usernameError = "Connection error. Check internet";
      } else {
        $scope.usernameError = "Registration failed. Please try again";
      }

      $scope.isLoading = false;

      // Auto-hide field errors after 5 seconds
      $timeout(function () {
        $scope.usernameError = "";
        $scope.passwordError = "";
        $scope.confirmPasswordError = "";
        $scope.termsError = "";
      }, 5000);

      // Focus username field for retry
      $timeout(function () {
        const usernameField = document.getElementById("username");
        if (usernameField) {
          usernameField.focus();
          usernameField.select();
        }
      }, 100);
    }

    /**
     * Clear all form data and reset validation state
     */
    $scope.clearForm = function () {
      $scope.credentials = {};
      $scope.usernameError = "";
      $scope.passwordError = "";
      $scope.confirmPasswordError = "";
      $scope.termsError = "";
      $scope.success = "";
      $scope.showPassword = false;
      $scope.showConfirmPassword = false;

      logger.logUserAction("clear-register-form");

      $timeout(function () {
        document.getElementById("username")?.focus();
      }, 0);
    };

    // Handle form reset on Escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !$scope.isLoading) {
        $scope.$apply(function () {
          $scope.clearForm();
        });
      }
    });

    /**
     * Navigate to login page with faster transition
     */
    $scope.navigateToLogin = function (event) {
      event.preventDefault();

      logger.logUserAction("navigate-to-login");

      // Add faster fade out effect
      const authCard = document.querySelector(".auth-card");
      if (authCard) {
        authCard.style.transition = "opacity 0.1s ease, transform 0.1s ease";
        authCard.style.opacity = "0";
        authCard.style.transform = "translateY(-5px)";

        $timeout(function () {
          $window.location.href = "/";
        }, 100);
      } else {
        $window.location.href = "/";
      }
    };
  }
})();
