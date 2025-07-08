import React, { useState, useEffect } from "react";
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
        {activeTab === "about" && renderAboutTab()}
        {activeTab === "testing" && renderTestingTab()}
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
