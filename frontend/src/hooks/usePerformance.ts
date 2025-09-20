import { useEffect, useRef, useCallback } from 'react';
import { performanceService } from '../services/performance';

interface UsePerformanceOptions {
  trackRenders?: boolean;
  trackUserActions?: boolean;
  componentName?: string;
}

/**
 * Hook for tracking component performance
 */
export const usePerformance = (options: UsePerformanceOptions = {}) => {
  const {
    trackRenders = true,
    trackUserActions = true,
    componentName = 'Unknown'
  } = options;

  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(Date.now());

  // Track component mount
  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    if (trackRenders) {
      performanceService.trackRender(`${componentName}_mount`, mountDuration);
    }
  }, [componentName, trackRenders]);

  // Track render performance
  const trackRender = useCallback((renderName: string = 'render') => {
    if (trackRenders) {
      const renderDuration = Date.now() - renderStartTime.current;
      performanceService.trackRender(`${componentName}_${renderName}`, renderDuration);
    }
  }, [componentName, trackRenders]);

  // Start render timing
  const startRender = useCallback(() => {
    renderStartTime.current = Date.now();
  }, []);

  // Track user action
  const trackAction = useCallback((action: string, duration?: number) => {
    if (trackUserActions) {
      const actionDuration = duration || Date.now() - renderStartTime.current;
      performanceService.trackUserAction(`${componentName}_${action}`, actionDuration);
    }
  }, [componentName, trackUserActions]);

  // Track API call performance
  const trackAPI = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    performanceService.trackAPI(endpoint, method, duration, status);
  }, []);

  return {
    trackRender,
    startRender,
    trackAction,
    trackAPI
  };
};

/**
 * Hook for tracking API performance
 */
export const useAPIPerformance = () => {
  const trackAPI = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    performanceService.trackAPI(endpoint, method, duration, status);
  }, []);

  const getPerformanceStats = useCallback(() => {
    return performanceService.getAPIPerformance();
  }, []);

  const getPerformanceSummary = useCallback(() => {
    return performanceService.getPerformanceSummary();
  }, []);

  return {
    trackAPI,
    getPerformanceStats,
    getPerformanceSummary
  };
};

/**
 * Hook for tracking user interactions
 */
export const useUserInteraction = (componentName: string) => {
  const trackClick = useCallback((action: string, duration?: number) => {
    performanceService.trackUserAction(`${componentName}_click_${action}`, duration || 0);
  }, [componentName]);

  const trackHover = useCallback((action: string, duration?: number) => {
    performanceService.trackUserAction(`${componentName}_hover_${action}`, duration || 0);
  }, [componentName]);

  const trackScroll = useCallback((duration?: number) => {
    performanceService.trackUserAction(`${componentName}_scroll`, duration || 0);
  }, [componentName]);

  const trackFormSubmit = useCallback((formName: string, duration?: number) => {
    performanceService.trackUserAction(`${componentName}_form_submit_${formName}`, duration || 0);
  }, [componentName]);

  return {
    trackClick,
    trackHover,
    trackScroll,
    trackFormSubmit
  };
};

export default usePerformance;
