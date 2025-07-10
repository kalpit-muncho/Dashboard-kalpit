import packageJson from '../../package.json';
import { v4 as uuidv4 } from 'uuid';

// Helper function to detect platform
const getPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'unknown';
};

// Helper function to get browser info
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

// Helper function to get or create unique ID
const getUniqueId = () => {
  let uniqueId = localStorage.getItem('device_unique_id');
  
  if (!uniqueId) {
    uniqueId = uuidv4();
    localStorage.setItem('device_unique_id', uniqueId);
  }
  
  return uniqueId;
};

const getAppVersion = () => {
  return import.meta.env.VITE_APP_VERSION || packageJson.version || 'unknown';
};

export const getDeviceInfo = () => ({
  platform: getPlatform(),
  browser: getBrowserInfo(),
  version: getAppVersion(),
  model: navigator.userAgent,
  uniqueId: getUniqueId(),
  screenResolution: `${screen.width}x${screen.height}`,
  language: navigator.language,
  cookieEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine,
  userAgent: navigator.userAgent
});