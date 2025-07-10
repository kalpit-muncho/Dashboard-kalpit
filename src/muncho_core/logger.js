import { getAnalytics, logEvent as firebaseLogEvent, setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { getApp } from 'firebase/app';

let analytics = null;

export const initializeAnalytics = () => {
  try {
    const app = getApp();
    analytics = getAnalytics(app);
    
    // Enable debug mode in development
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      setAnalyticsCollectionEnabled(analytics, true);
      window.localStorage.setItem('debug', '*');
      
      // Add debug listener
      window.gtag = function() {
        console.debug('Analytics Event:', ...arguments);
      };
    }
    
    return analytics;
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
    return null;
  }
};

export const logEvent = async (eventName, params = {}) => {
  if (!analytics) {
    analytics = initializeAnalytics();
  }
  
  try {
    if (analytics) {
      // Validate event name
      if (!eventName || typeof eventName !== 'string') {
        throw new Error('Invalid event name');
      }

      await firebaseLogEvent(analytics, eventName, params);
      
      if (import.meta.env.VITE_ENVIRONMENT === 'development') {
        console.debug(`Analytics Event Sent: ${eventName}`, params);
      }
    }
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

export const logError = (message, error) => {
  console.error(message, error);
  try {
    if (analytics) {
      firebaseLogEvent(analytics, 'error_occurred', {
        error_message: message,
        error_stack: error?.stack || 'No stack available',
        error_name: error?.name || 'Unknown error'
      });
    }
  } catch (loggingError) {
    console.error('Failed to log error to analytics:', loggingError);
  }
};