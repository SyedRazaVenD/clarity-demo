# Microsoft Clarity Testing Demo

This React application is designed to test Microsoft Clarity's tracking capabilities including session recording, heatmaps, and user behavior analytics.

## Features for Testing

- **Interactive Navigation**: Tab-based navigation to test page transitions
- **Form Interactions**: Contact form with validation to test form completion tracking
- **Button Interactions**: Various styled buttons to test click tracking
- **Modal Dialogs**: Popup modals to test overlay interactions
- **Responsive Design**: Mobile-friendly layout for cross-device testing

## Setup Instructions

### 1. Get Your Clarity Project ID

1. Go to [Microsoft Clarity Dashboard](https://clarity.microsoft.com/)
2. Create a new project or use an existing one
3. Copy your Project ID from the setup instructions

### 2. Configure Clarity Tracking

1. Open `src/index.js`
2. Replace `YOUR_CLARITY_PROJECT_ID` with your actual Clarity Project ID:

```javascript
})(window, document, "clarity", "script", "YOUR_ACTUAL_PROJECT_ID");
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Testing Scenarios

### Basic Testing
1. **Session Recording Test**
   - Navigate between different tabs (Home, Contact Form, About, Advanced Testing, Test Results)
   - Click various buttons and interact with form elements
   - Open and close the modal dialog
   - Scroll through the content
   - Check your Clarity dashboard for session recordings

2. **Heatmap Testing**
   - Click on different buttons multiple times
   - Interact with form fields
   - Navigate through tabs
   - View heatmaps in Clarity dashboard showing click patterns

3. **Form Analytics**
   - Fill out the contact form
   - Submit the form
   - Check Clarity dashboard for form completion tracking

### Advanced Testing (New Features)

4. **Performance Testing**
   - Go to "Advanced Testing" tab
   - Click "Test Page Load Time" to simulate performance metrics
   - Test performance feature usage tracking

5. **Error Simulation**
   - Click "Simulate Rage Click" to test rage click detection
   - Click "Simulate Dead Click" to test dead click tracking
   - Monitor error count in the interface

6. **Feature Usage Testing**
   - Test various feature usage scenarios:
     - Advanced features
     - Analytics features
     - Settings modifications
   - View feature usage summary in "Test Results" tab

7. **User Journey Testing**
   - Complete multi-step user journey:
     - Journey Step 1, 2, 3
     - Journey completion
   - Track complete user flow patterns

8. **Scroll Depth Testing**
   - Go to "Advanced Testing" tab
   - Scroll through the scroll test content
   - Test automatic scroll depth tracking (25%, 50%, 75%, 100%)

9. **Real-time Event Monitoring**
   - Go to "Test Results" tab
   - View live event log of all tracked events
   - Monitor feature usage summary
   - Clear results to start fresh testing

### Comprehensive User Journey Analysis
1. Perform a complete user journey:
   - Start on Home tab and test quick events
   - Navigate to Contact Form and test form interactions
   - Go to Advanced Testing and test all features
   - Check Test Results to see all tracked events
   - Navigate to About tab and test modal interactions
2. Analyze the complete user journey in Clarity dashboard

## What Clarity Will Track

### Basic Tracking (Automatic)
- **Mouse movements and clicks**
- **Scroll behavior**
- **Form interactions and completions**
- **Page navigation**
- **Time spent on each section**
- **User frustration signals (rage clicks, dead clicks)**
- **Session recordings with playback**

### Custom Events (Implemented)
- **Page Views**: Track when users visit different sections
- **Tab Navigation**: Monitor navigation between tabs
- **Button Clicks**: Track specific button interactions with context
- **Form Field Interactions**: Monitor individual field usage
- **Form Submissions**: Track form completion with detailed analytics
- **Modal Interactions**: Track modal open/close events
- **Scroll Depth**: Monitor how far users scroll on pages
- **Time on Page**: Track time spent on each section
- **User Journey**: Track complete user flows
- **Feature Usage**: Monitor specific feature interactions

## Dashboard Features to Test

1. **Session Recordings**: Watch actual user sessions
2. **Heatmaps**: Click, scroll, and move heatmaps
3. **User Behavior**: Form analytics and conversion funnels
4. **Performance**: Page load times and user experience metrics
5. **Insights**: AI-powered insights about user behavior

## Troubleshooting

### Clarity Not Tracking
- Ensure your Project ID is correctly set in `src/index.js`
- Check browser console for any JavaScript errors
- Verify the Clarity script is loading (check Network tab in DevTools)
- Wait 5-10 minutes for data to appear in dashboard

### No Session Recordings
- Make sure you're interacting with the page for at least 30 seconds
- Check if ad blockers are blocking Clarity scripts
- Verify you're using a supported browser

## Additional Testing Tips

1. **Test on Different Devices**: Use mobile, tablet, and desktop
2. **Test Different Browsers**: Chrome, Firefox, Safari, Edge
3. **Test Network Conditions**: Use slow 3G in DevTools
4. **Test Accessibility**: Use keyboard navigation and screen readers
5. **Test Edge Cases**: Rapid clicking, form validation errors

## Custom Events Implementation

The app includes comprehensive custom event tracking:

### Event Types Tracked
1. **Navigation Events**
   - `page_view`: When users visit different sections
   - `tab_navigation`: Movement between tabs

2. **Interaction Events**
   - `button_click`: All button interactions with context
   - `form_field_interaction`: Individual field usage
   - `form_submission`: Complete form analytics
   - `modal_opened/closed`: Modal interaction tracking

3. **Behavior Events**
   - `scroll_depth`: How far users scroll (25%, 50%, 75%, 100%)
   - `time_on_page`: Time spent on each section
   - `user_journey`: Complete user flow tracking

### Viewing Custom Events
1. Go to Clarity Dashboard
2. Navigate to "Insights" section
3. Look for custom events in the analytics
4. Filter by event type to see specific interactions

### Adding New Events
Use the `clarityEvents` utility in `src/clarityEvents.js`:
```javascript
import { clarityEvents } from './clarityEvents';

// Track custom event
clarityEvents.track('custom_event', {
  action: 'user_action',
  context: 'page_context'
});
```

## Customization

You can modify the app to test specific scenarios:

- Add more complex forms
- Implement multi-step processes
- Add e-commerce elements (product listings, cart)
- Create user authentication flows
- Add dynamic content loading

## Support

For issues with Microsoft Clarity:
- [Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Clarity Community](https://techcommunity.microsoft.com/t5/microsoft-clarity/bd-p/MicrosoftClarity)
- [Clarity Support](https://support.microsoft.com/en-us/help/4468236/microsoft-clarity-faq)
