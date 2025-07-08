// Microsoft Clarity Custom Events Utility
// This file contains all custom event tracking functions for better organization

export const clarityEvents = {
  // Initialize Clarity tracking
  init: () => {
    if (typeof window !== "undefined" && window.clarity) {
      console.log("Clarity is available for custom events");
      return true;
    }
    console.warn("Clarity not available");
    return false;
  },

  // Generic event tracking
  track: (eventName, eventData = {}) => {
    if (window.clarity) {
      window.clarity("event", eventName, {
        ...eventData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: window.screen
          ? `${window.screen.width}x${window.screen.height}`
          : "unknown",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      });
      console.log(`Clarity Event: ${eventName}`, eventData);
    }
  },

  // Page and navigation events
  pageView: (pageName, additionalData = {}) => {
    clarityEvents.track("page_view", {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      ...additionalData,
    });
  },

  tabNavigation: (fromTab, toTab, navigationType = "tab_click") => {
    clarityEvents.track("tab_navigation", {
      from_tab: fromTab,
      to_tab: toTab,
      navigation_type: navigationType,
    });
  },

  // Button and interaction events
  buttonClick: (action, buttonType, page, additionalData = {}) => {
    clarityEvents.track("button_click", {
      button_action: action,
      button_type: buttonType,
      page: page,
      ...additionalData,
    });
  },

  // Form events
  formFieldInteraction: (fieldName, fieldType, hasValue, valueLength) => {
    clarityEvents.track("form_field_interaction", {
      field_name: fieldName,
      field_type: fieldType,
      has_value: hasValue,
      value_length: valueLength,
    });
  },

  formSubmission: (formType, fieldsCompleted, totalFields, formData) => {
    clarityEvents.track("form_submission", {
      form_type: formType,
      fields_completed: fieldsCompleted,
      total_fields: totalFields,
      form_data: formData,
      completion_rate: (fieldsCompleted / totalFields) * 100,
    });
  },

  formSubmitButtonClick: (formType, fieldsFilled) => {
    clarityEvents.track("form_submit_button_click", {
      form_type: formType,
      fields_filled: fieldsFilled,
    });
  },

  formValidationError: (
    fieldName,
    errorMessage,
    formType,
    step,
    value,
    validationType
  ) => {
    clarityEvents.track("form_validation_error", {
      field_name: fieldName,
      error_message: errorMessage,
      form_type: formType,
      step: step,
      value: value,
      validation_type: validationType,
    });
  },

  // Modal events
  modalOpened: (modalType, triggerPage) => {
    clarityEvents.track("modal_opened", {
      modal_type: modalType,
      trigger_page: triggerPage,
    });
  },

  modalClosed: (modalType, closeMethod, timeOpen) => {
    clarityEvents.track("modal_closed", {
      modal_type: modalType,
      close_method: closeMethod,
      time_open: timeOpen,
    });
  },

  // User behavior events
  scrollDepth: (scrollPercentage, page) => {
    clarityEvents.track("scroll_depth", {
      scroll_percentage: scrollPercentage,
      page: page,
    });
  },

  timeOnPage: (timeSpent, page) => {
    clarityEvents.track("time_on_page", {
      time_spent_seconds: timeSpent,
      page: page,
    });
  },

  // Error and frustration events
  rageClick: (element, page, clickCount) => {
    clarityEvents.track("rage_click", {
      element: element,
      page: page,
      click_count: clickCount,
    });
  },

  deadClick: (element, page) => {
    clarityEvents.track("dead_click", {
      element: element,
      page: page,
    });
  },

  // Performance events
  pageLoadTime: (loadTime, page) => {
    clarityEvents.track("page_load_time", {
      load_time_ms: loadTime,
      page: page,
    });
  },

  // Custom business events
  featureUsage: (feature, action, additionalData = {}) => {
    clarityEvents.track("feature_usage", {
      feature: feature,
      action: action,
      ...additionalData,
    });
  },

  userJourney: (step, journeyType, additionalData = {}) => {
    clarityEvents.track("user_journey", {
      step: step,
      journey_type: journeyType,
      ...additionalData,
    });
  },
};

// Auto-track scroll depth
export const initScrollTracking = (pageName) => {
  let maxScroll = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      // Track at 25%, 50%, 75%, 100% milestones
      if (maxScroll >= 25 && maxScroll < 50) {
        clarityEvents.scrollDepth(25, pageName);
      } else if (maxScroll >= 50 && maxScroll < 75) {
        clarityEvents.scrollDepth(50, pageName);
      } else if (maxScroll >= 75 && maxScroll < 100) {
        clarityEvents.scrollDepth(75, pageName);
      } else if (maxScroll >= 100) {
        clarityEvents.scrollDepth(100, pageName);
      }
    }
  });
};

// Auto-track time on page
export const initTimeTracking = (pageName) => {
  const startTime = Date.now();

  window.addEventListener("beforeunload", () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    clarityEvents.timeOnPage(timeSpent, pageName);
  });
};

export default clarityEvents;
