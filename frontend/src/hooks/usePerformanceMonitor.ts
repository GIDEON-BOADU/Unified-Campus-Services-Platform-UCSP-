import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  logMetrics: boolean;
  reportInterval: number; // in milliseconds
}

export function usePerformanceMonitor(
  componentName: string,
  config: PerformanceConfig = {
    enableMonitoring: true,
    logMetrics: process.env.NODE_ENV === 'development',
    reportInterval: 30000 // 30 seconds
  }
) {
  const startTimeRef = useRef<number>(0);
  const renderStartTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    componentRenderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  // Track component render time
  const startRender = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTimeRef.current > 0) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      metricsRef.current.componentRenderTime = renderTime;
      
      if (config.logMetrics) {
        console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName, config.logMetrics]);

  // Track API response time
  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;
      
      metricsRef.current.apiResponseTime = responseTime;
      
      if (config.logMetrics) {
        console.log(`[Performance] ${apiName} API call: ${responseTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      if (config.logMetrics) {
        console.log(`[Performance] ${apiName} API call failed: ${responseTime.toFixed(2)}ms`);
      }
      
      throw error;
    }
  }, [config.logMetrics]);

  // Track memory usage
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }, []);

  // Track cache hit rate
  const updateCacheHitRate = useCallback((hits: number, total: number) => {
    metricsRef.current.cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
  }, []);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      pageLoadTime: 0,
      componentRenderTime: 0,
      apiResponseTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0
    };
  }, []);

  // Report metrics periodically
  useEffect(() => {
    if (!config.enableMonitoring) return;

    const interval = setInterval(() => {
      updateMemoryUsage();
      
      if (config.logMetrics) {
        const metrics = getMetrics();
        console.log(`[Performance] ${componentName} metrics:`, metrics);
      }
    }, config.reportInterval);

    return () => clearInterval(interval);
  }, [componentName, config, updateMemoryUsage, getMetrics]);

  // Track page load time
  useEffect(() => {
    if (!config.enableMonitoring) return;

    startTimeRef.current = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTimeRef.current;
      metricsRef.current.pageLoadTime = loadTime;
      
      if (config.logMetrics) {
        console.log(`[Performance] ${componentName} page load time: ${loadTime.toFixed(2)}ms`);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [componentName, config]);

  return {
    startRender,
    endRender,
    trackApiCall,
    updateMemoryUsage,
    updateCacheHitRate,
    getMetrics,
    resetMetrics
  };
}

// Hook for measuring specific operations
export function useOperationTimer(operationName: string) {
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTimeRef.current > 0) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`[Timer] ${operationName}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }, [operationName]);

  return { start, end };
}

// Hook for measuring component mount/unmount times
export function useComponentLifecycle(componentName: string) {
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    console.log(`[Lifecycle] ${componentName} mounted`);

    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTimeRef.current;
      console.log(`[Lifecycle] ${componentName} unmounted after ${lifespan.toFixed(2)}ms`);
    };
  }, [componentName]);
}
