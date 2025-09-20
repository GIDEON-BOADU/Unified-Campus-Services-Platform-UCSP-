/**
 * Performance monitoring service
 * Tracks API response times, bundle size, and user interactions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'api' | 'render' | 'bundle' | 'user';
}

interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: APIMetric[] = [];
  private readonly MAX_METRICS = 1000;

  /**
   * Track API performance
   */
  trackAPI(endpoint: string, method: string, duration: number, status: number): void {
    const metric: APIMetric = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    };

    this.apiMetrics.push(metric);

    // Keep only recent metrics
    if (this.apiMetrics.length > this.MAX_METRICS) {
      this.apiMetrics = this.apiMetrics.slice(-this.MAX_METRICS);
    }

    // Log slow API calls
    if (duration > 3000) {
      console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, duration: number): void {
    this.addMetric({
      name: `render_${componentName}`,
      value: duration,
      timestamp: Date.now(),
      type: 'render'
    });
  }

  /**
   * Track bundle size
   */
  trackBundleSize(size: number): void {
    this.addMetric({
      name: 'bundle_size',
      value: size,
      timestamp: Date.now(),
      type: 'bundle'
    });
  }

  /**
   * Track user interaction
   */
  trackUserAction(action: string, duration: number): void {
    this.addMetric({
      name: `user_${action}`,
      value: duration,
      timestamp: Date.now(),
      type: 'user'
    });
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get API performance statistics
   */
  getAPIPerformance(): {
    averageResponseTime: number;
    slowestEndpoints: Array<{ endpoint: string; avgDuration: number }>;
    errorRate: number;
    totalRequests: number;
  } {
    if (this.apiMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        slowestEndpoints: [],
        errorRate: 0,
        totalRequests: 0
      };
    }

    const totalDuration = this.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageResponseTime = totalDuration / this.apiMetrics.length;

    // Group by endpoint
    const endpointStats = new Map<string, { totalDuration: number; count: number }>();
    this.apiMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { totalDuration: 0, count: 0 };
      endpointStats.set(key, {
        totalDuration: existing.totalDuration + metric.duration,
        count: existing.count + 1
      });
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.totalDuration / stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    const errorCount = this.apiMetrics.filter(metric => metric.status >= 400).length;
    const errorRate = (errorCount / this.apiMetrics.length) * 100;

    return {
      averageResponseTime,
      slowestEndpoints,
      errorRate,
      totalRequests: this.apiMetrics.length
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalMetrics: number;
    apiMetrics: number;
    averageAPITime: number;
    slowestAPI: string | null;
  } {
    const apiPerf = this.getAPIPerformance();
    const slowestAPI = apiPerf.slowestEndpoints[0]?.endpoint || null;

    return {
      totalMetrics: this.metrics.length,
      apiMetrics: this.apiMetrics.length,
      averageAPITime: apiPerf.averageResponseTime,
      slowestAPI
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.apiMetrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): { metrics: PerformanceMetric[]; apiMetrics: APIMetric[] } {
    return {
      metrics: [...this.metrics],
      apiMetrics: [...this.apiMetrics]
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Track page load performance
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    performanceService.trackUserAction('page_load', loadTime);
  });
}

export default performanceService;
