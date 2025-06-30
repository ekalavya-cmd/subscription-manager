// Client-side logging utility for debugging
class ClientLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.logLevel = localStorage.getItem("logLevel") || "info";
    this.startTime = Date.now();

    // Override console methods to capture logs
    this.setupConsoleCapture();

    // Send logs to server periodically
    this.setupPeriodicSync();

    // Handle page unload
    this.setupUnloadHandler();

    // CSS validation on load
    this.validateCSS();
  }

  setupConsoleCapture() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      this.log("info", args.join(" "));
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.log("error", args.join(" "));
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.log("warn", args.join(" "));
      originalWarn.apply(console, args);
    };

    console.info = (...args) => {
      this.log("info", args.join(" "));
      originalInfo.apply(console, args);
    };

    // Capture unhandled errors
    window.addEventListener("error", (event) => {
      this.log(
        "error",
        `Unhandled error: ${event.error?.message || event.message}`,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        }
      );
    });

    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.log("error", `Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason,
      });
    });
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionTime: Date.now() - this.startTime,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem("clientLogs", JSON.stringify(this.logs.slice(-100)));
    } catch (e) {
      // Storage full, remove oldest logs
      this.logs = this.logs.slice(-50);
    }
  }

  info(message, meta) {
    this.log("info", message, meta);
  }

  warn(message, meta) {
    this.log("warn", message, meta);
  }

  error(message, meta) {
    this.log("error", message, meta);
  }

  debug(message, meta) {
    if (this.logLevel === "debug") {
      this.log("debug", message, meta);
    }
  }

  // CSS Validation Check
  validateCSS() {
    this.info("Starting CSS validation check");
    const issues = [];

    try {
      // Check if all CSS files loaded successfully
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        try {
          // Try to access rules to check if CSS loaded properly
          if (sheet.cssRules || sheet.rules) {
            this.debug(`CSS loaded successfully: ${sheet.href || "inline"}`);
          }
        } catch (e) {
          issues.push(
            `Failed to load CSS: ${sheet.href || "inline"} - ${e.message}`
          );
        }
      }

      // Check for common CSS property issues
      this.validateCommonCSSIssues(issues);

      // Check for Bootstrap classes
      this.validateBootstrapClasses(issues);

      if (issues.length > 0) {
        this.warn("CSS validation issues detected", {
          issues,
          totalIssues: issues.length,
        });

        // Show debug info if in debug mode
        if (localStorage.getItem("debugMode") === "true") {
          this.showCSSDebugInfo(issues);
        }
      } else {
        this.info("CSS validation passed - no issues detected");
      }
    } catch (error) {
      this.error("CSS validation failed", { error: error.message });
    }
  }

  validateCommonCSSIssues(issues) {
    // Common invalid CSS properties to check for
    const invalidProperties = [
      "end",
      "start",
      "inline-end",
      "inline-start",
      "block-start",
      "block-end",
    ];

    // Check if any elements have these properties applied incorrectly
    const allElements = document.querySelectorAll("*");

    for (const element of allElements) {
      const computedStyle = window.getComputedStyle(element);

      invalidProperties.forEach((prop) => {
        try {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== "auto" && value !== "initial") {
            issues.push(
              `Element has invalid CSS property '${prop}': ${element.tagName}.${element.className}`
            );
          }
        } catch (e) {
          // Property doesn't exist, which is good
        }
      });
    }
  }

  validateBootstrapClasses(issues) {
    // Check for Bootstrap 5 classes that might be misused
    const bootstrapClasses = [
      "position-absolute",
      "end-0",
      "top-50",
      "translate-middle-y",
    ];
    const elementsWithClasses = document.querySelectorAll(
      '[class*="position-absolute"]'
    );

    elementsWithClasses.forEach((element) => {
      const classes = element.className.split(" ");
      const hasBootstrapPositioning = classes.some((cls) =>
        bootstrapClasses.includes(cls)
      );

      if (hasBootstrapPositioning) {
        // Check if element is also using flexbox container
        const parent = element.parentElement;
        if (parent) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.display === "flex") {
            issues.push(
              `Conflicting layout: Element uses Bootstrap positioning inside flexbox container - ${element.tagName}.${element.className}`
            );
          }
        }
      }
    });
  }

  showCSSDebugInfo(issues) {
    // Create or update debug info element
    let debugInfo = document.getElementById("css-debug-info");
    if (!debugInfo) {
      debugInfo = document.createElement("div");
      debugInfo.id = "css-debug-info";
      debugInfo.className = "css-debug-info show";
      document.body.appendChild(debugInfo);
    }

    debugInfo.innerHTML = `
      <strong>CSS Issues (${issues.length}):</strong><br>
      ${issues
        .slice(0, 3)
        .map((issue) => `• ${issue.substring(0, 50)}...`)
        .join("<br>")}
      ${issues.length > 3 ? `<br>...and ${issues.length - 3} more` : ""}
      <br><small>Press Ctrl+Shift+L for full logs</small>
    `;

    // Auto-hide after 10 seconds
    setTimeout(() => {
      debugInfo.classList.remove("show");
    }, 10000);
  }

  // Performance monitoring
  markStart(name) {
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
    this.debug(`Performance mark start: ${name}`);
  }

  markEnd(name) {
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        this.info(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        this.warn(`Failed to measure performance for ${name}`);
      }
    }
  }

  // Network request logging
  logRequest(method, url, status, duration) {
    this.info(`${method} ${url} - ${status} (${duration}ms)`, {
      type: "network",
      method,
      url,
      status,
      duration,
    });
  }

  // User action logging
  logUserAction(action, element, data = {}) {
    this.info(`User action: ${action}`, {
      type: "user-action",
      action,
      element: element?.tagName || "unknown",
      elementId: element?.id,
      elementClass: element?.className,
      ...data,
    });
  }

  // Form validation logging
  logFormValidation(formId, isValid, errors = []) {
    this.info(`Form validation: ${formId} - ${isValid ? "valid" : "invalid"}`, {
      type: "form-validation",
      formId,
      isValid,
      errors,
    });
  }

  setupPeriodicSync() {
    // Send logs to server every 30 seconds
    setInterval(() => {
      this.syncLogs();
    }, 30000);
  }

  setupUnloadHandler() {
    // Send logs when page is about to unload
    window.addEventListener("beforeunload", () => {
      this.syncLogs(true);
    });
  }

  async syncLogs(isUnload = false) {
    if (this.logs.length === 0) return;

    const logsToSend = [...this.logs];

    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Don't send logs if user is not authenticated

      const response = await fetch("/api/client-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logs: logsToSend,
          isUnload,
          sessionId: this.getSessionId(),
        }),
        keepalive: isUnload, // Ensure request completes even if page is unloading
      });

      if (response.ok) {
        // Clear sent logs
        this.logs = [];
        localStorage.removeItem("clientLogs");
      }
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.warn("Failed to sync logs to server:", error);
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }

  // Get stored logs for display
  getStoredLogs() {
    try {
      const stored = localStorage.getItem("clientLogs");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem("clientLogs");
    this.info("Logs cleared by user");
  }

  // Export logs for download
  exportLogs() {
    const allLogs = [...this.getStoredLogs(), ...this.logs];
    const logText = allLogs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscription-manager-logs-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.info("Logs exported by user");
  }

  // Set log level
  setLogLevel(level) {
    this.logLevel = level;
    localStorage.setItem("logLevel", level);
    this.info(`Log level set to: ${level}`);
  }

  // Re-validate CSS manually
  revalidateCSS() {
    this.info("Manual CSS revalidation triggered");
    this.validateCSS();
  }

  // Display logs in a modal (for debugging)
  showLogsModal() {
    const allLogs = [...this.getStoredLogs(), ...this.logs];
    const logHtml = allLogs
      .slice(-50)
      .map((log) => {
        const levelClass =
          {
            error: "text-danger",
            warn: "text-warning",
            info: "text-info",
            debug: "text-secondary",
          }[log.level] || "text-dark";

        return `<div class="mb-1">
        <small class="text-muted">${new Date(
          log.timestamp
        ).toLocaleTimeString()}</small>
        <span class="badge ${levelClass}">${log.level.toUpperCase()}</span>
        <span>${log.message}</span>
      </div>`;
      })
      .join("");

    const modalHtml = `
      <div class="modal fade" id="logsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Application Logs</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <button class="btn btn-sm btn-primary me-2" onclick="logger.exportLogs()">Export Logs</button>
                <button class="btn btn-sm btn-warning me-2" onclick="logger.clearLogs(); document.getElementById('logsModal').querySelector('.modal-body div').innerHTML = 'Logs cleared.';">Clear Logs</button>
                <button class="btn btn-sm btn-info me-2" onclick="logger.revalidateCSS()">Validate CSS</button>
                <select class="form-select form-select-sm d-inline-block w-auto" onchange="logger.setLogLevel(this.value)">
                  <option value="info" ${
                    this.logLevel === "info" ? "selected" : ""
                  }>Info</option>
                  <option value="debug" ${
                    this.logLevel === "debug" ? "selected" : ""
                  }>Debug</option>
                  <option value="warn" ${
                    this.logLevel === "warn" ? "selected" : ""
                  }>Warn</option>
                  <option value="error" ${
                    this.logLevel === "error" ? "selected" : ""
                  }>Error</option>
                </select>
              </div>
              <div class="log-viewer" style="max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 0.8rem;">
                ${logHtml || '<p class="text-muted">No logs available</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("logsModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add new modal
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("logsModal"));
    modal.show();
  }
}

// Initialize logger when script loads
const logger = new ClientLogger();

// Add keyboard shortcut to show logs (Ctrl+Shift+L)
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === "L") {
    event.preventDefault();
    logger.showLogsModal();
  }
});

// Export for use in other scripts
window.logger = logger;
