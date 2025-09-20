import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Zap, Clock, Database, AlertTriangle } from 'lucide-react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface PerformanceData {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: number;
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });

  const { getMetrics } = usePerformanceMonitor('PerformanceMonitor', {
    enableMonitoring: true,
    logMetrics: true,
    reportInterval: 5000,
  });

  useEffect(() => {
    const updatePerformanceData = () => {
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      const metrics = getMetrics();

      setPerformanceData(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRenderTime: metrics.componentRenderTime,
        averageRenderTime: (prev.averageRenderTime + metrics.componentRenderTime) / 2,
        memoryUsage,
        apiCalls: metrics.apiResponseTime > 0 ? prev.apiCalls + 1 : prev.apiCalls,
        cacheHits: metrics.cacheHitRate > 0 ? prev.cacheHits + 1 : prev.cacheHits,
        cacheMisses: metrics.cacheHitRate === 0 ? prev.cacheMisses + 1 : prev.cacheMisses,
      }));
    };

    updatePerformanceData();
  }, [getMetrics]);

  const performanceScore = useMemo(() => {
    let score = 100;
    
    // Deduct points for slow renders
    if (performanceData.averageRenderTime > 16) score -= 20;
    if (performanceData.averageRenderTime > 32) score -= 30;
    
    // Deduct points for high memory usage
    if (performanceData.memoryUsage > 50) score -= 15;
    if (performanceData.memoryUsage > 100) score -= 25;
    
    // Deduct points for low cache hit rate
    const totalCache = performanceData.cacheHits + performanceData.cacheMisses;
    if (totalCache > 0) {
      const hitRate = performanceData.cacheHits / totalCache;
      if (hitRate < 0.5) score -= 10;
      if (hitRate < 0.3) score -= 20;
    }
    
    return Math.max(0, score);
  }, [performanceData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Zap className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Performance Monitor"
      >
        <Activity className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Performance Score */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performance Score</span>
            {getScoreIcon(performanceScore)}
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
            {performanceScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {performanceScore >= 80 ? 'Excellent' : 
             performanceScore >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>

        {/* Render Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Render Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Render Count</span>
              <span className="text-sm font-medium">{performanceData.renderCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Render</span>
              <span className="text-sm font-medium">{performanceData.lastRenderTime.toFixed(2)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Render</span>
              <span className="text-sm font-medium">{performanceData.averageRenderTime.toFixed(2)}ms</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Memory Usage</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Used Memory</span>
            <span className="text-sm font-medium">{performanceData.memoryUsage.toFixed(1)}MB</span>
          </div>
        </div>

        {/* API Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">API Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Calls</span>
              <span className="text-sm font-medium">{performanceData.apiCalls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Hits</span>
              <span className="text-sm font-medium text-green-600">{performanceData.cacheHits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Misses</span>
              <span className="text-sm font-medium text-red-600">{performanceData.cacheMisses}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
          <div className="space-y-1 text-xs">
            {performanceData.averageRenderTime > 16 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Consider optimizing component renders
              </div>
            )}
            {performanceData.memoryUsage > 50 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                High memory usage detected
              </div>
            )}
            {performanceData.cacheHits + performanceData.cacheMisses > 0 && 
             performanceData.cacheHits / (performanceData.cacheHits + performanceData.cacheMisses) < 0.5 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Improve caching strategy
              </div>
            )}
            {performanceScore >= 80 && (
              <div className="flex items-center gap-1 text-green-600">
                <Zap className="h-3 w-3" />
                Performance looks great!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
