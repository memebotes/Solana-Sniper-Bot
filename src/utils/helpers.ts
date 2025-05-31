/**
 * Format number with appropriate suffix (K, M, B)
 */
export const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  
  if (num < 0.00001) {
    return num.toExponential(2);
  }
  
  if (num < 1) {
    return num.toFixed(6);
  }
  
  if (num < 1000) {
    return num.toFixed(2);
  }
  
  const abbreviations = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(num) / 3);
  
  if (tier >= abbreviations.length) {
    return num.toExponential(2);
  }
  
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  return scaled.toFixed(2) + abbreviations[tier];
};

/**
 * Format timestamp to readable time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return `${diffSecs}s ago`;
  }
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  return date.toLocaleDateString();
};

/**
 * Generate random value within range
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Calculate ping/latency in ms (simulated)
 */
export const calculatePing = (): number => {
  // Simulate variable network latency
  const baseLatency = 35; // Base latency in ms
  const variability = 30; // Random variability range
  
  return Math.floor(baseLatency + Math.random() * variability);
};