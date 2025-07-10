import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  clarityEvents,
  initScrollTracking,
  initTimeTracking,
} from "./clarityEvents";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [activeTab, setActiveTab] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [errorCount, setErrorCount] = useState(0);
  const [featureUsage, setFeatureUsage] = useState({});

  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    highScore: 0,
    targetPosition: { x: 50, y: 50 },
    gameLevel: 1,
    targetsHit: 0,
    totalTargets: 0,
  });

  // Separate refs for timers to avoid closure issues
  const gameTimerRef = useRef(null);
  const moveTimerRef = useRef(null);

  // User identification state
  const [userInfo, setUserInfo] = useState({
    isIdentified: false,
    userId: null,
    userData: {},
  });

  // Multi-step form state
  const [multiStepForm, setMultiStepForm] = useState({
    step: 1,
    totalSteps: 4,
    data: {
      firstName: "",
      lastName: "",
      phone: "",
      age: "",
      occupation: "",
      company: "",
      experience: "",
      salary: "",
    },
    errors: {},
    isSubmitting: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Track form field interactions using utility
    clarityEvents.formFieldInteraction(
      name,
      e.target.type,
      value.length > 0,
      value.length
    );
  };

  // Multi-step form input handler
  const handleMultiStepInputChange = (e) => {
    const { name, value } = e.target;

    setMultiStepForm((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value,
      },
      errors: {
        ...prev.errors,
        [name]: "", // Clear error when user starts typing
      },
    }));

    // Track form field interactions
    clarityEvents.formFieldInteraction(
      name,
      e.target.type,
      value.length > 0,
      value.length
    );

    // Note: Error validation for age field "9" is now handled in nextStep() function
    // to simulate real application behavior where validation occurs on form submission/navigation
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Track form submission using utility
    const fieldsCompleted = Object.values(formData).filter(
      (val) => val.length > 0
    ).length;
    const totalFields = Object.keys(formData).length;

    clarityEvents.formSubmission("contact_form", fieldsCompleted, totalFields, {
      has_name: formData.name.length > 0,
      has_email: formData.email.length > 0,
      has_message: formData.message.length > 0,
    });

    // Track feature usage
    clarityEvents.featureUsage("contact_form", "submitted", {
      completion_rate: (fieldsCompleted / totalFields) * 100,
      fields_filled: fieldsCompleted,
    });

    alert("Form submitted! Check Clarity dashboard for interaction tracking.");
    setFormData({ name: "", email: "", message: "" });
  };

  // Multi-step form navigation
  const nextStep = () => {
    if (multiStepForm.step < multiStepForm.totalSteps) {
      const nextStepNum = multiStepForm.step + 1;

      // Validate current step before proceeding
      if (multiStepForm.step === 2) {
        // Validate age field on step 2
        if (multiStepForm.data.age === "9") {
          // Set error state
          setMultiStepForm((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              age: "Error: Age cannot be 9. Please enter a valid age.",
            },
          }));

          // Track form validation error
          clarityEvents.formValidationError(
            "age",
            "Age cannot be 9. Please enter a valid age.",
            "multi_step_form",
            multiStepForm.step,
            multiStepForm.data.age,
            "step_navigation"
          );

          // Track user frustration
          clarityEvents.rageClick("form_field", activeTab, 1);

          // Show error alert like in a real application
          alert(
            "Validation Error: Age cannot be 9. Please enter a valid age before proceeding."
          );
          return; // Prevent navigation
        }
      }

      // Track step navigation
      clarityEvents.track("form_step_navigation", {
        from_step: multiStepForm.step,
        to_step: nextStepNum,
        form_type: "multi_step_form",
        direction: "next",
      });

      setMultiStepForm((prev) => ({
        ...prev,
        step: nextStepNum,
      }));

      // Track user journey
      clarityEvents.userJourney(`form_step_${nextStepNum}`, "multi_step_form", {
        step_number: nextStepNum,
        total_steps: multiStepForm.totalSteps,
      });
    }
  };

  const prevStep = () => {
    if (multiStepForm.step > 1) {
      const prevStepNum = multiStepForm.step - 1;

      // Track step navigation
      clarityEvents.track("form_step_navigation", {
        from_step: multiStepForm.step,
        to_step: prevStepNum,
        form_type: "multi_step_form",
        direction: "previous",
      });

      setMultiStepForm((prev) => ({
        ...prev,
        step: prevStepNum,
      }));
    }
  };

  // Multi-step form submission
  const handleMultiStepSubmit = (e) => {
    e.preventDefault();

    // Check for errors
    const hasErrors = Object.values(multiStepForm.errors).some(
      (error) => error.length > 0
    );

    if (hasErrors) {
      // Track form submission with errors
      clarityEvents.track("form_submission_error", {
        form_type: "multi_step_form",
        errors: multiStepForm.errors,
        step: multiStepForm.step,
        total_steps: multiStepForm.totalSteps,
      });

      alert("Please fix the errors before submitting!");
      return;
    }

    setMultiStepForm((prev) => ({ ...prev, isSubmitting: true }));

    // Simulate submission delay
    setTimeout(() => {
      // Track successful form submission
      const fieldsCompleted = Object.values(multiStepForm.data).filter(
        (val) => val.length > 0
      ).length;
      const totalFields = Object.keys(multiStepForm.data).length;

      clarityEvents.formSubmission(
        "multi_step_form",
        fieldsCompleted,
        totalFields,
        {
          total_steps: multiStepForm.totalSteps,
          completion_rate: (fieldsCompleted / totalFields) * 100,
          form_data: multiStepForm.data,
        }
      );

      // Track feature usage
      clarityEvents.featureUsage("multi_step_form", "completed", {
        steps_completed: multiStepForm.totalSteps,
        fields_filled: fieldsCompleted,
      });

      // Track user journey completion
      clarityEvents.userJourney("form_completed", "multi_step_form", {
        total_steps: multiStepForm.totalSteps,
        completion_time: new Date().toISOString(),
      });

      alert(
        "Multi-step form submitted successfully! Check Clarity dashboard for detailed analytics."
      );

      // Reset form
      setMultiStepForm({
        step: 1,
        totalSteps: 4,
        data: {
          firstName: "",
          lastName: "",
          phone: "",
          age: "",
          occupation: "",
          company: "",
          experience: "",
          salary: "",
        },
        errors: {},
        isSubmitting: false,
      });
    }, 2000);
  };

  const handleButtonClick = (action, buttonType = "general") => {
    console.log(`Button clicked: ${action}`);

    // Track button clicks using utility
    clarityEvents.buttonClick(action, buttonType, activeTab);

    // Track feature usage
    clarityEvents.featureUsage("button", "clicked", {
      action: action,
      type: buttonType,
      page: activeTab,
    });

    alert(`Action: ${action} - This interaction will be tracked by Clarity!`);
  };

  const handleTabChange = (newTab) => {
    // Track tab navigation using utility
    clarityEvents.tabNavigation(activeTab, newTab);

    setActiveTab(newTab);

    // Track page view for new tab
    clarityEvents.pageView(newTab);

    // Track user journey
    clarityEvents.userJourney("tab_navigation", "navigation", {
      from: activeTab,
      to: newTab,
    });
  };

  const handleModalOpen = () => {
    clarityEvents.modalOpened("info_modal", activeTab);
    setShowModal(true);
  };

  const handleModalClose = (closeMethod = "button_click") => {
    clarityEvents.modalClosed(
      "info_modal",
      closeMethod,
      new Date().toISOString()
    );
    setShowModal(false);
  };

  // Performance testing functions
  const testPageLoadTime = () => {
    const startTime = performance.now();

    // Simulate some work
    setTimeout(() => {
      const loadTime = performance.now() - startTime;
      clarityEvents.pageLoadTime(loadTime, activeTab);

      setPerformanceData((prev) => ({
        ...prev,
        pageLoadTime: loadTime,
      }));

      setTestResults((prev) => [
        ...prev,
        `Page load time: ${loadTime.toFixed(2)}ms`,
      ]);
    }, Math.random() * 2000 + 500);
  };

  // Error simulation functions
  const simulateRageClick = () => {
    let clickCount = 0;
    const maxClicks = 5;

    const rageClickInterval = setInterval(() => {
      clickCount++;
      clarityEvents.rageClick("test_button", activeTab, clickCount);

      if (clickCount >= maxClicks) {
        clearInterval(rageClickInterval);
        setErrorCount((prev) => prev + maxClicks);
        setTestResults((prev) => [
          ...prev,
          `Rage click simulated: ${maxClicks} clicks`,
        ]);
      }
    }, 100);
  };

  const simulateDeadClick = () => {
    clarityEvents.deadClick("non_interactive_element", activeTab);
    setErrorCount((prev) => prev + 1);
    setTestResults((prev) => [...prev, "Dead click simulated"]);
  };

  // Feature usage testing
  const testFeatureUsage = (feature, action) => {
    clarityEvents.featureUsage(feature, action, {
      test_mode: true,
      timestamp: new Date().toISOString(),
    });

    setFeatureUsage((prev) => ({
      ...prev,
      [feature]: action,
    }));

    setTestResults((prev) => [
      ...prev,
      `Feature usage: ${feature} - ${action}`,
    ]);
  };

  // User journey testing
  const testUserJourney = (step) => {
    clarityEvents.userJourney(step, "test_journey", {
      step_number: step,
      test_mode: true,
    });

    setTestResults((prev) => [...prev, `User journey step: ${step}`]);
  };

  // User identification functions
  const identifyUser = (userId, userData = {}) => {
    clarityEvents.identifyUser(userId, userData);

    setUserInfo({
      isIdentified: true,
      userId: userId,
      userData: userData,
    });

    setTestResults((prev) => [...prev, `User identified: ${userId}`]);

    // Track user identification in feature usage
    clarityEvents.featureUsage("user_identification", "identified", {
      user_id: userId,
      user_data: userData,
    });
  };

  const clearUserIdentification = () => {
    clarityEvents.clearUser();

    setUserInfo({
      isIdentified: false,
      userId: null,
      userData: {},
    });

    setTestResults((prev) => [...prev, "User identification cleared"]);

    // Track user identification clearing
    clarityEvents.featureUsage("user_identification", "cleared", {});
  };

  const getCurrentUserInfo = () => {
    const userId = clarityEvents.getCurrentUserId();
    const sessionId = clarityEvents.getSessionId();

    return {
      userId: userId,
      sessionId: sessionId,
      isIdentified: userInfo.isIdentified,
    };
  };

  // Game functions
  const startGame = () => {
    // Clear any existing timers
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
    }

    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      score: 0,
      timeLeft: 30,
      gameLevel: 1,
      targetsHit: 0,
      totalTargets: 0,
    }));

    // Track game start
    clarityEvents.track("game_started", {
      game_type: "target_clicker",
      initial_time: 30,
    });

    clarityEvents.featureUsage("minigame", "started", {
      game_type: "target_clicker",
    });

    // Start game timer with proper closure handling
    gameTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(gameTimerRef.current);
          endGame(prev.score);
          return { ...prev, isPlaying: false, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    // Start target movement with a small delay
    setTimeout(() => {
      scheduleNextMove();
    }, 100);
  };

  // Function to schedule the next target movement
  const scheduleNextMove = () => {
    // Clear any existing move timer to prevent overlapping
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
    }

    // Get current game state to avoid closure issues
    setGameState((prev) => {
      if (!prev.isPlaying) {
        return prev;
      }

      // Calculate movement speed based on current level
      const baseSpeed = 1500;
      const speedReduction = prev.gameLevel * 100;
      const movementSpeed = Math.max(baseSpeed - speedReduction, 300); // Minimum 300ms

      // Get container dimensions for proper positioning
      const gameArea = document.querySelector(".game-area");
      let newPosition;

      if (!gameArea) {
        // Fallback if container not found
        newPosition = {
          x: Math.random() * 70 + 15, // 15-85%
          y: Math.random() * 50 + 25, // 25-75%
        };
      } else {
        const containerRect = gameArea.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate target size to ensure it stays within bounds
        const targetSize = window.innerWidth < 768 ? 50 : 60; // Target size in pixels
        const maxX = containerWidth - targetSize;
        const maxY = containerHeight - targetSize;

        // Generate position within safe bounds
        const x = Math.random() * (maxX - targetSize) + targetSize / 2;
        const y = Math.random() * (maxY - targetSize) + targetSize / 2;

        // Convert to percentage for CSS positioning
        const xPercent = (x / containerWidth) * 100;
        const yPercent = (y / containerHeight) * 100;

        newPosition = {
          x: Math.max(5, Math.min(95, xPercent)), // Ensure 5-95% range
          y: Math.max(5, Math.min(95, yPercent)), // Ensure 5-95% range
        };

        // Debug logging
        if (window.innerWidth < 768) {
          console.log(
            "Mobile target position:",
            newPosition,
            "Container:",
            containerWidth,
            "x",
            containerHeight,
            "Level:",
            prev.gameLevel,
            "Speed:",
            movementSpeed
          );
        }
      }

      // Schedule next movement BEFORE updating state to prevent timing conflicts
      moveTimerRef.current = setTimeout(scheduleNextMove, movementSpeed);

      return {
        ...prev,
        targetPosition: newPosition,
        totalTargets: prev.totalTargets + 1,
      };
    });
  };

  const endGame = (finalScore) => {
    const newHighScore = Math.max(gameState.highScore, finalScore);

    // Clear all timers
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
      moveTimerRef.current = null;
    }

    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      highScore: newHighScore,
    }));

    // Track game completion
    clarityEvents.track("game_completed", {
      game_type: "target_clicker",
      final_score: finalScore,
      high_score: newHighScore,
      targets_hit: gameState.targetsHit,
      total_targets: gameState.totalTargets,
      accuracy:
        gameState.totalTargets > 0
          ? ((gameState.targetsHit / gameState.totalTargets) * 100).toFixed(1)
          : 0,
    });

    clarityEvents.featureUsage("minigame", "completed", {
      game_type: "target_clicker",
      score: finalScore,
      accuracy:
        gameState.totalTargets > 0
          ? ((gameState.targetsHit / gameState.totalTargets) * 100).toFixed(1)
          : 0,
    });

    setTestResults((prev) => [
      ...prev,
      `Game completed! Score: ${finalScore}, Accuracy: ${
        gameState.totalTargets > 0
          ? ((gameState.targetsHit / gameState.totalTargets) * 100).toFixed(1)
          : 0
      }%`,
    ]);
  };

  const hitTarget = () => {
    if (!gameState.isPlaying) return;

    const newScore = gameState.score + 10 * gameState.gameLevel;
    const newTargetsHit = gameState.targetsHit + 1;
    const newLevel = Math.floor(newScore / 50) + 1;

    setGameState((prev) => ({
      ...prev,
      score: newScore,
      targetsHit: newTargetsHit,
      gameLevel: newLevel,
    }));

    // Track target hit
    clarityEvents.track("game_target_hit", {
      game_type: "target_clicker",
      current_score: newScore,
      current_level: newLevel,
      target_position: gameState.targetPosition,
    });

    // Track rage click if user is clicking rapidly
    if (newTargetsHit > 5) {
      clarityEvents.rageClick("game_target", "game", newTargetsHit);
    }
  };

  // Initialize Clarity and tracking on component mount
  useEffect(() => {
    // Initialize Clarity
    clarityEvents.init();

    // Track initial page view
    clarityEvents.pageView(activeTab);

    // Initialize auto-tracking features
    initScrollTracking(activeTab);
    initTimeTracking(activeTab);

    // Track user journey start
    clarityEvents.userJourney("app_loaded", "initial_load", {
      initial_tab: activeTab,
    });

    // Test initial feature usage
    testFeatureUsage("app", "initialized");

    // Handle window resize for mobile orientation changes
    const handleResize = () => {
      if (gameState.isPlaying) {
        // Clear existing timer and schedule new movement with updated container size
        if (moveTimerRef.current) {
          clearTimeout(moveTimerRef.current);
        }
        scheduleNextMove();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gameState.isPlaying]);

  // Cleanup effect for game timers
  useEffect(() => {
    return () => {
      // Cleanup timers when component unmounts
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
    };
  }, []);

  const renderHomeTab = () => (
    <div className="tab-content">
      <h2>Welcome to Clarity Testing Demo</h2>
      <p>This is a demo app to test Microsoft Clarity tracking capabilities.</p>

      <div className="button-group">
        <button
          className="demo-button primary"
          onClick={() => handleButtonClick("Primary Action", "primary")}
        >
          Primary Action
        </button>
        <button
          className="demo-button secondary"
          onClick={() => handleButtonClick("Secondary Action", "secondary")}
        >
          Secondary Action
        </button>
        <button
          className="demo-button danger"
          onClick={() => handleButtonClick("Danger Action", "danger")}
        >
          Danger Action
        </button>
      </div>

      <div className="test-section">
        <h3>Quick Event Tests</h3>
        <div className="test-buttons">
          <button
            className="test-button"
            onClick={() => testFeatureUsage("quick_test", "button_click")}
          >
            Test Feature Usage
          </button>
          <button
            className="test-button"
            onClick={() => testUserJourney("home_interaction")}
          >
            Test User Journey
          </button>
          <button className="test-button" onClick={testPageLoadTime}>
            Test Page Load Time
          </button>
        </div>
      </div>
    </div>
  );

  const renderFormTab = () => (
    <div className="tab-content">
      <h2>Contact Form</h2>
      <p>Fill out this form to test form interactions with Clarity.</p>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="submit-button"
          onClick={() => {
            const fieldsFilled = Object.values(formData).filter(
              (val) => val.length > 0
            ).length;
            clarityEvents.formSubmitButtonClick("contact_form", fieldsFilled);
          }}
        >
          Submit Form
        </button>
      </form>

      <div className="test-section">
        <h3>Form Testing</h3>
        <div className="test-buttons">
          <button
            className="test-button"
            onClick={() => testFeatureUsage("form", "field_interaction")}
          >
            Test Form Field Tracking
          </button>
          <button
            className="test-button"
            onClick={() => testUserJourney("form_completion")}
          >
            Test Form Journey
          </button>
        </div>
      </div>
    </div>
  );

  const renderMultiStepFormTab = () => (
    <div className="tab-content">
      <h2>Multi-Step Form with Error Testing</h2>
      <p>
        Test form analytics, step navigation, and error handling with Clarity.
      </p>

      <div className="form-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${
                (multiStepForm.step / multiStepForm.totalSteps) * 100
              }%`,
            }}
          ></div>
        </div>
        <p>
          Step {multiStepForm.step} of {multiStepForm.totalSteps}
        </p>
      </div>

      <form onSubmit={handleMultiStepSubmit} className="multi-step-form">
        {multiStepForm.step === 1 && (
          <div className="form-step">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={multiStepForm.data.firstName}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={multiStepForm.data.lastName}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
          </div>
        )}

        {multiStepForm.step === 2 && (
          <div className="form-step">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={multiStepForm.data.phone}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={multiStepForm.data.age}
                onChange={handleMultiStepInputChange}
                required
              />
              <small className="form-hint">
                💡 Hint: Enter "9" and click Next to test validation error
              </small>
              {multiStepForm.errors.age && (
                <div className="error-message">{multiStepForm.errors.age}</div>
              )}
            </div>
          </div>
        )}

        {multiStepForm.step === 3 && (
          <div className="form-step">
            <h3>Professional Information</h3>
            <div className="form-group">
              <label htmlFor="occupation">Occupation:</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={multiStepForm.data.occupation}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company:</label>
              <input
                type="text"
                id="company"
                name="company"
                value={multiStepForm.data.company}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
          </div>
        )}

        {multiStepForm.step === 4 && (
          <div className="form-step">
            <h3>Additional Details</h3>
            <div className="form-group">
              <label htmlFor="experience">Years of Experience:</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={multiStepForm.data.experience}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="salary">Expected Salary:</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={multiStepForm.data.salary}
                onChange={handleMultiStepInputChange}
                required
              />
            </div>
          </div>
        )}

        <div className="form-navigation">
          {multiStepForm.step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="nav-button prev"
            >
              Previous
            </button>
          )}
          {multiStepForm.step < multiStepForm.totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="nav-button next"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="submit-button"
              disabled={multiStepForm.isSubmitting}
            >
              {multiStepForm.isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          )}
        </div>
      </form>

      <div className="test-section">
        <h3>Multi-Step Form Testing</h3>
        <div className="test-buttons">
          <button
            className="test-button"
            onClick={() =>
              testFeatureUsage("multi_step_form", "step_navigation")
            }
          >
            Test Step Navigation
          </button>
          <button
            className="test-button"
            onClick={() => testUserJourney("multi_step_form_started")}
          >
            Test Form Journey
          </button>
        </div>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="tab-content">
      <h2>About This Demo</h2>
      <p>
        This React application is designed to test Microsoft Clarity's tracking
        capabilities.
      </p>
      <div className="info-cards">
        <div className="info-card">
          <h3>Session Recording</h3>
          <p>
            Clarity will record user interactions, mouse movements, and page
            navigation.
          </p>
        </div>
        <div className="info-card">
          <h3>Heatmaps</h3>
          <p>
            Generate heatmaps showing where users click, scroll, and interact
            most.
          </p>
        </div>
        <div className="info-card">
          <h3>User Behavior</h3>
          <p>
            Track form completions, button clicks, and user journey patterns.
          </p>
        </div>
      </div>
      <button className="demo-button primary" onClick={handleModalOpen}>
        Open Modal
      </button>
    </div>
  );

  const renderTestingTab = () => (
    <div className="tab-content">
      <h2>Advanced Testing</h2>
      <p>Test all Clarity events and features comprehensively.</p>

      <div className="test-sections">
        <div className="test-section">
          <h3>Performance Testing</h3>
          <div className="test-buttons">
            <button className="test-button" onClick={testPageLoadTime}>
              Test Page Load Time
            </button>
            <button
              className="test-button"
              onClick={() => testFeatureUsage("performance", "test_executed")}
            >
              Test Performance Feature
            </button>
          </div>
          {performanceData.pageLoadTime && (
            <div className="test-result">
              Last load time: {performanceData.pageLoadTime.toFixed(2)}ms
            </div>
          )}
        </div>

        <div className="test-section">
          <h3>Error Simulation</h3>
          <div className="test-buttons">
            <button className="test-button danger" onClick={simulateRageClick}>
              Simulate Rage Click
            </button>
            <button className="test-button danger" onClick={simulateDeadClick}>
              Simulate Dead Click
            </button>
          </div>
          {errorCount > 0 && (
            <div className="test-result">Errors simulated: {errorCount}</div>
          )}
        </div>

        <div className="test-section">
          <h3>Feature Usage Testing</h3>
          <div className="test-buttons">
            <button
              className="test-button"
              onClick={() => testFeatureUsage("advanced_feature", "activated")}
            >
              Test Advanced Feature
            </button>
            <button
              className="test-button"
              onClick={() => testFeatureUsage("analytics", "viewed")}
            >
              Test Analytics Feature
            </button>
            <button
              className="test-button"
              onClick={() => testFeatureUsage("settings", "modified")}
            >
              Test Settings Feature
            </button>
          </div>
        </div>

        <div className="test-section">
          <h3>User Journey Testing</h3>
          <div className="test-buttons">
            <button
              className="test-button"
              onClick={() => testUserJourney("step_1")}
            >
              Journey Step 1
            </button>
            <button
              className="test-button"
              onClick={() => testUserJourney("step_2")}
            >
              Journey Step 2
            </button>
            <button
              className="test-button"
              onClick={() => testUserJourney("step_3")}
            >
              Journey Step 3
            </button>
            <button
              className="test-button"
              onClick={() => testUserJourney("completed")}
            >
              Journey Completed
            </button>
          </div>
        </div>

        <div className="test-section">
          <h3>Scroll Testing</h3>
          <p>Scroll down to test scroll depth tracking (25%, 50%, 75%, 100%)</p>
          <div className="scroll-test-content">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="scroll-item">
                Scroll section {i + 1} - This will help test scroll depth
                tracking
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameTab = () => (
    <div className="tab-content">
      <h2>🎮 Target Clicker Minigame</h2>
      <p>Test Clarity tracking with this fun target-clicking game!</p>

      <div className="game-container">
        <div className="game-info">
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{gameState.score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{gameState.timeLeft}s</span>
            </div>
            <div className="stat">
              <span className="stat-label">Level:</span>
              <span className="stat-value">{gameState.gameLevel}</span>
            </div>
            <div className="stat">
              <span className="stat-label">High Score:</span>
              <span className="stat-value">{gameState.highScore}</span>
            </div>
          </div>

          {!gameState.isPlaying ? (
            <div className="game-controls">
              <button className="demo-button primary" onClick={startGame}>
                {gameState.highScore > 0 ? "Play Again" : "Start Game"}
              </button>
              {gameState.highScore > 0 && (
                <div className="game-results">
                  <p>Last Game Results:</p>
                  <p>Score: {gameState.score}</p>
                  <p>Targets Hit: {gameState.targetsHit}</p>
                  <p>
                    Accuracy:{" "}
                    {gameState.totalTargets > 0
                      ? (
                          (gameState.targetsHit / gameState.totalTargets) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="game-instructions">
              <p>🎯 Click the moving target to score points!</p>
              <p>⚡ Targets move faster as you level up!</p>
              <p>⏱️ You have 30 seconds to get the highest score!</p>
            </div>
          )}
        </div>

        <div className="game-area">
          {gameState.isPlaying && (
            <div
              className="game-target"
              style={{
                left: `${gameState.targetPosition.x}%`,
                top: `${gameState.targetPosition.y}%`,
              }}
              onClick={hitTarget}
            >
              🎯
            </div>
          )}
        </div>
      </div>

      <div className="test-section">
        <h3>Game Testing</h3>
        <div className="test-buttons">
          <button
            className="test-button"
            onClick={() => testFeatureUsage("game", "manual_test")}
          >
            Test Game Feature
          </button>
          <button
            className="test-button"
            onClick={() => testUserJourney("game_interaction")}
          >
            Test Game Journey
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserTab = () => {
    const currentUserInfo = getCurrentUserInfo();

    return (
      <div className="tab-content">
        <h2>👤 User Identification</h2>
        <p>Test Microsoft Clarity user identification and session tracking.</p>

        <div className="user-info-section">
          <h3>Current User Status</h3>
          <div className="user-status">
            <div className="status-item">
              <strong>User ID:</strong>{" "}
              {currentUserInfo.userId || "Not identified"}
            </div>
            <div className="status-item">
              <strong>Session ID:</strong>{" "}
              {currentUserInfo.sessionId || "Not available"}
            </div>
            <div className="status-item">
              <strong>Status:</strong>{" "}
              {userInfo.isIdentified ? "✅ Identified" : "❌ Anonymous"}
            </div>
          </div>
        </div>

        <div className="user-actions-section">
          <h3>User Identification Actions</h3>

          <div className="identification-form">
            <div className="form-group">
              <label htmlFor="userId">User ID:</label>
              <input
                type="text"
                id="userId"
                placeholder="Enter user ID (e.g., user123, john_doe)"
                defaultValue=""
              />
            </div>
            <div className="form-group">
              <label htmlFor="userEmail">Email (optional):</label>
              <input
                type="email"
                id="userEmail"
                placeholder="user@example.com"
                defaultValue=""
              />
            </div>
            <div className="form-group">
              <label htmlFor="userRole">Role (optional):</label>
              <select id="userRole" defaultValue="">
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="tester">Tester</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <div className="button-group">
              <button
                className="demo-button primary"
                onClick={() => {
                  const userId = document.getElementById("userId").value;
                  const email = document.getElementById("userEmail").value;
                  const role = document.getElementById("userRole").value;

                  if (userId.trim()) {
                    const userData = {};
                    if (email) userData.email = email;
                    if (role) userData.role = role;

                    identifyUser(userId, userData);
                  } else {
                    alert("Please enter a User ID");
                  }
                }}
              >
                Identify User
              </button>

              <button
                className="demo-button danger"
                onClick={clearUserIdentification}
              >
                Clear Identification
              </button>
            </div>
          </div>
        </div>

        <div className="test-section">
          <h3>Quick Identification Tests</h3>
          <div className="test-buttons">
            <button
              className="test-button"
              onClick={() =>
                identifyUser("test_user_001", {
                  role: "tester",
                  email: "test@example.com",
                })
              }
            >
              Test User 1
            </button>
            <button
              className="test-button"
              onClick={() =>
                identifyUser("admin_user_002", {
                  role: "admin",
                  email: "admin@example.com",
                })
              }
            >
              Test Admin
            </button>
            <button
              className="test-button"
              onClick={() =>
                identifyUser("developer_003", {
                  role: "developer",
                  email: "dev@example.com",
                })
              }
            >
              Test Developer
            </button>
            <button
              className="test-button"
              onClick={() =>
                testFeatureUsage("user_identification", "status_check")
              }
            >
              Check Status
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>Microsoft Clarity Identify API Implementation</h3>
          <div className="info-cards">
            <div className="info-card">
              <h4>🔍 Official Clarity API</h4>
              <p>
                Using the correct Clarity Identify API:{" "}
                <code>
                  clarity("identify", "custom-id", "session-id", "page-id",
                  "friendly-name")
                </code>
              </p>
            </div>
            <div className="info-card">
              <h4>👤 Custom User ID</h4>
              <p>
                Your custom ID (email, user ID, etc.) is hashed by Clarity for
                privacy and used for cross-device tracking.
              </p>
            </div>
            <div className="info-card">
              <h4>📊 Cross-Session Tracking</h4>
              <p>
                Custom IDs persist across sessions, devices, and browsers,
                unlike Clarity's auto-generated anonymous IDs.
              </p>
            </div>
          </div>
        </div>

        <div className="code-example-section">
          <h3>API Usage Examples</h3>
          <div className="code-examples">
            <div className="code-example">
              <h4>Identify by Email (Recommended)</h4>
              <pre>
                <code>{`// Best for cross-device tracking
clarityEvents.identifyUserByEmail("user@example.com", {
  name: "John Doe",
  role: "admin"
});`}</code>
              </pre>
            </div>
            <div className="code-example">
              <h4>Identify by User ID</h4>
              <pre>
                <code>{`// Use internal user ID
clarityEvents.identifyUserById("user_12345", {
  email: "user@example.com",
  plan: "premium"
});`}</code>
              </pre>
            </div>
            <div className="code-example">
              <h4>Clear Identification</h4>
              <pre>
                <code>{`// Clear user identification
clarityEvents.clearUser();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsTab = () => (
    <div className="tab-content">
      <h2>Test Results</h2>
      <p>View all test events and their results.</p>

      <div className="results-section">
        <h3>Event Log</h3>
        <div className="results-list">
          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <div key={index} className="result-item">
                {result}
              </div>
            ))
          ) : (
            <p>No test results yet. Start testing to see events here!</p>
          )}
        </div>

        <button className="test-button" onClick={() => setTestResults([])}>
          Clear Results
        </button>
      </div>

      <div className="results-section">
        <h3>Feature Usage Summary</h3>
        <div className="feature-summary">
          {Object.keys(featureUsage).length > 0 ? (
            Object.entries(featureUsage).map(([feature, action]) => (
              <div key={feature} className="feature-item">
                <strong>{feature}:</strong> {action}
              </div>
            ))
          ) : (
            <p>No feature usage tracked yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Microsoft Clarity Testing Demo</h1>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "home" ? "active" : ""}`}
            onClick={() => handleTabChange("home")}
          >
            Home
          </button>
          <button
            className={`nav-tab ${activeTab === "form" ? "active" : ""}`}
            onClick={() => handleTabChange("form")}
          >
            Contact Form
          </button>
          <button
            className={`nav-tab ${activeTab === "multistep" ? "active" : ""}`}
            onClick={() => handleTabChange("multistep")}
          >
            Multi-Step Form
          </button>
          <button
            className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => handleTabChange("about")}
          >
            About
          </button>
          <button
            className={`nav-tab ${activeTab === "testing" ? "active" : ""}`}
            onClick={() => handleTabChange("testing")}
          >
            Advanced Testing
          </button>
          <button
            className={`nav-tab ${activeTab === "game" ? "active" : ""}`}
            onClick={() => handleTabChange("game")}
          >
            🎮 Game
          </button>
          <button
            className={`nav-tab ${activeTab === "user" ? "active" : ""}`}
            onClick={() => handleTabChange("user")}
          >
            👤 User ID
          </button>
          <button
            className={`nav-tab ${activeTab === "results" ? "active" : ""}`}
            onClick={() => handleTabChange("results")}
          >
            Test Results
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "form" && renderFormTab()}
        {activeTab === "multistep" && renderMultiStepFormTab()}
        {activeTab === "about" && renderAboutTab()}
        {activeTab === "testing" && renderTestingTab()}
        {activeTab === "game" && renderGameTab()}
        {activeTab === "user" && renderUserTab()}
        {activeTab === "results" && renderResultsTab()}
      </main>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => handleModalClose("overlay_click")}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Modal Dialog</h3>
            <p>This modal interaction will be tracked by Clarity!</p>
            <button
              className="demo-button primary"
              onClick={() => handleModalClose("button_click")}
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
