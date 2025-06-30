// Login functionality for Subscription Manager
// Separated from index.html for better code organization

(function () {
  "use strict";

  // Create the login application module
  angular
    .module("loginApp", [])
    .controller("LoginController", [
      "$scope",
      "$http",
      "$window",
      "$timeout",
      LoginController,
    ]);

  function LoginController($scope, $http, $window, $timeout) {
    // Initialize scope variables
    $scope.credentials = {};
    $scope.usernameError = "";
    $scope.passwordError = "";
    $scope.success = "";
    $scope.isLoading = false;
    $scope.showDebug = localStorage.getItem("debugMode") === "true";
    $scope.showPassword = false;

    // Log controller initialization
    logger.info("Login controller initialized");
    logger.markStart("page-load");

    // Initialize the controller
    init();

    /**
     * Initialize the login controller
     */
    function init() {
      // Focus first input when page loads
      $timeout(function () {
        const usernameField = document.getElementById("username");
        if (usernameField) {
          usernameField.focus();
        }
        logger.markEnd("page-load");
      }, 100);

      // Set up event listeners
      setupEventListeners();

      // Log performance metrics when page is fully loaded
      $window.addEventListener("load", function () {
        logPerformanceMetrics();
      });

      // Log when user leaves the page
      $window.addEventListener("beforeunload", function () {
        logger.info("User leaving login page");
      });
    }

    /**
     * Set up event listeners for form interactions
     */
    function setupEventListeners() {
      $timeout(function () {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        if (usernameInput) {
          usernameInput.addEventListener("blur", function () {
            logger.logUserAction("username-input-blur", this, {
              hasValue: !!this.value,
              isValid: $scope.isValidUsername(this.value),
            });
          });

          usernameInput.addEventListener("input", function () {
            // Real-time validation feedback
            $scope.$apply(function () {
              $scope.showValidation = true;
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
      logger.info("Login page fully loaded");

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
        } else if (nextField === "submit") {
          $scope.login();
        }
      }
    };

    /**
     * Validate username field
     */
    $scope.validateUsername = function () {
      $scope.usernameError = "";

      if (!$scope.credentials.username) {
        return; // Don't show error for empty field on blur
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
        return; // Don't show error for empty field on blur
      }

      if ($scope.credentials.password.length < 6) {
        $scope.passwordError = "Password must be at least 6 characters";
      } else if ($scope.credentials.password.length > 128) {
        $scope.passwordError = "Password is too long";
      }
    };

    /**
     * Navigate to register page with faster transition
     */
    $scope.navigateToRegister = function (event) {
      event.preventDefault();

      logger.logUserAction("navigate-to-register");

      // Add faster fade out effect
      const authCard = document.querySelector(".auth-card");
      if (authCard) {
        authCard.style.transition = "opacity 0.1s ease, transform 0.1s ease";
        authCard.style.opacity = "0";
        authCard.style.transform = "translateY(-5px)";

        $timeout(function () {
          $window.location.href = "/register";
        }, 100);
      } else {
        $window.location.href = "/register";
      }
    };

    /**
     * Validate individual fields for form submission
     */
    function validateFieldsForSubmission() {
      $scope.usernameError = "";
      $scope.passwordError = "";

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
      }

      return isValid;
    }

    /**
     * Handle login form submission
     */
    $scope.login = function () {
      logger.info("Login attempt started", {
        username: $scope.credentials.username,
        timestamp: new Date().toISOString(),
      });
      logger.markStart("login-request");

      // Clear previous errors
      $scope.usernameError = "";
      $scope.passwordError = "";
      $scope.isLoading = true;

      // Validate form inputs
      const isValid = validateFieldsForSubmission();

      if (!isValid) {
        $scope.isLoading = false;
        logger.logFormValidation(
          "login-form",
          false,
          [$scope.usernameError, $scope.passwordError].filter(Boolean)
        );

        // Auto-hide field errors after 5 seconds
        $timeout(function () {
          $scope.usernameError = "";
          $scope.passwordError = "";
        }, 5000);
        return;
      }

      // Log successful form validation
      logger.logFormValidation("login-form", true);

      // Make login request
      const startTime = Date.now();
      const loginData = {
        username: $scope.credentials.username.trim(),
        password: $scope.credentials.password,
      };

      $http
        .post("/api/index", loginData)
        .then(function (response) {
          handleLoginSuccess(response, Date.now() - startTime);
        })
        .catch(function (error) {
          handleLoginError(error, Date.now() - startTime);
        });
    };

    /**
     * Handle successful login response
     * @param {Object} response - The HTTP response
     * @param {number} duration - Request duration in milliseconds
     */
    function handleLoginSuccess(response, duration) {
      logger.markEnd("login-request");
      logger.logRequest("POST", "/api/index", 200, duration);
      logger.info("Login successful", {
        username: $scope.credentials.username,
        originalUsername: response.data.username,
        displayName: response.data.displayName,
        duration: duration,
      });

      // Store authentication token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", response.data.username);
      localStorage.setItem("displayName", response.data.displayName);

      // Show success feedback briefly before redirect
      $scope.isLoading = false;

      // Redirect to main application
      $timeout(function () {
        $window.location.href = "/app";
      }, 100);
    }

    /**
     * Handle login error response
     * @param {Object} error - The HTTP error response
     * @param {number} duration - Request duration in milliseconds
     */
    function handleLoginError(error, duration) {
      const status = error.status || 0;

      logger.markEnd("login-request");
      logger.logRequest("POST", "/api/index", status, duration);
      logger.error("Login failed", {
        username: $scope.credentials.username,
        error: error.data?.message || "Unknown error",
        status: status,
        duration: duration,
      });

      // Set error message for display at top of form (like success message)
      if (status === 400 || status === 401) {
        $scope.success = ""; // Clear any success message
        $scope.success =
          "Invalid credentials. Please check your username and password.";
      } else if (status === 429) {
        $scope.success = "Too many login attempts. Please try again later.";
      } else if (status === 0) {
        $scope.success =
          "Connection error. Please check your internet connection.";
      } else {
        $scope.success = "Login failed. Please try again.";
      }

      $scope.isLoading = false;

      // Auto-hide error message after 5 seconds
      $timeout(function () {
        $scope.success = "";
      }, 5000);

      // Don't clear password or focus username on error - keep user's input
      logger.info("Login failed - keeping user input for retry");
    }

    /**
     * Clear all form data and reset validation state
     */
    $scope.clearForm = function () {
      $scope.credentials = {};
      $scope.usernameError = "";
      $scope.passwordError = "";
      $scope.success = "";
      $scope.showPassword = false;

      logger.logUserAction("clear-login-form");

      $timeout(function () {
        document.getElementById("username")?.focus();
      }, 0);
    };

    /**
     * Handle form reset on Escape key
     */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !$scope.isLoading) {
        $scope.$apply(function () {
          $scope.clearForm();
        });
      }
    });
  }
})();
