import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  chunks: string[];
}

interface PerformanceInfo {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export const BundleAnalyzer: React.FC = () => {
  const [bundleInfo, setBundleInfo] = useState<BundleInfo[]>([]);
  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      analyzeBundle();
      analyzePerformance();
    }
  }, []);

  const analyzeBundle = () => {
    // This would typically come from webpack-bundle-analyzer or similar
    // For now, we'll simulate some data
    const mockBundleInfo: BundleInfo[] = [
      {
        name: 'main',
        size: 1024 * 1024 * 2.5, // 2.5MB
        gzippedSize: 1024 * 1024 * 0.8, // 800KB
        chunks: ['vendor', 'app']
      },
      {
        name: 'vendor',
        size: 1024 * 1024 * 1.8, // 1.8MB
        gzippedSize: 1024 * 1024 * 0.6, // 600KB
        chunks: ['react', 'react-dom', 'lucide-react']
      },
      {
        name: 'pages',
        size: 1024 * 512, // 512KB
        gzippedSize: 1024 * 200, // 200KB
        chunks: ['HomePage', 'Dashboard', 'AdminDashboard']
      }
    ];
    setBundleInfo(mockBundleInfo);
  };

  const analyzePerformance = () => {
    // Get actual page load time from Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    
    // Get memory usage (Chrome only)
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
    
    // Calculate render time (time since DOM content loaded)
    const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
    
    // Simulate cache hit rate (in real app, this would come from actual cache metrics)
    const cacheHitRate = 85;

    const perfInfo: PerformanceInfo = {
      loadTime: Math.max(loadTime, 0),
      renderTime: Math.max(renderTime, 0),
      memoryUsage: Math.max(memoryUsage, 0),
      cacheHitRate
    };
    setPerformanceInfo(perfInfo);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSizeColor = (size: number, gzippedSize: number) => {
    const ratio = gzippedSize / size;
    if (ratio < 0.3) return 'text-green-600';
    if (ratio < 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value === 0) return 'text-gray-500'; // No data available
    return value <= threshold ? 'text-green-600' : 'text-red-600';
  };

  if (!import.meta.env.DEV || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <BarChart3 className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bundle Analyzer</h3>
          <div className="flex gap-2">
            <button
              onClick={analyzeBundle}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Bundle Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Bundle Sizes</h4>
          <div className="space-y-2">
            {bundleInfo.map((bundle, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{bundle.name}</div>
                  <div className="text-xs text-gray-500">
                    {bundle.chunks.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getSizeColor(bundle.size, bundle.gzippedSize)}`}>
                    {formatBytes(bundle.gzippedSize)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBytes(bundle.size)} raw
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Information */}
        {performanceInfo && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Load Time</span>
                <span className={`text-sm font-medium ${getPerformanceColor(performanceInfo.loadTime, 2000)}`}>
                  {performanceInfo.loadTime > 0 ? `${performanceInfo.loadTime.toFixed(0)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className={`text-sm font-medium ${getPerformanceColor(performanceInfo.memoryUsage, 50)}`}>
                  {performanceInfo.memoryUsage > 0 ? `${performanceInfo.memoryUsage.toFixed(1)}MB` : 'N/A (Chrome only)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Render Time</span>
                <span className={`text-sm font-medium ${getPerformanceColor(performanceInfo.renderTime, 1000)}`}>
                  {performanceInfo.renderTime > 0 ? `${performanceInfo.renderTime.toFixed(0)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <span className={`text-sm font-medium ${getPerformanceColor(100 - performanceInfo.cacheHitRate, 20)}`}>
                  {performanceInfo.cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
          <div className="space-y-1 text-xs">
            {bundleInfo.some(b => b.gzippedSize > 1024 * 1024) && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Consider code splitting for large bundles
              </div>
            )}
            {performanceInfo && performanceInfo.loadTime > 3000 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Load time is too high - optimize assets and reduce bundle size
              </div>
            )}
            {performanceInfo && performanceInfo.renderTime > 1000 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Consider optimizing component rendering
              </div>
            )}
            {performanceInfo && performanceInfo.cacheHitRate < 80 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Improve caching strategy
              </div>
            )}
            {performanceInfo && performanceInfo.memoryUsage > 100 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                High memory usage detected
              </div>
            )}
            {bundleInfo.every(b => b.gzippedSize < 1024 * 1024) && 
             performanceInfo && 
             performanceInfo.loadTime <= 2000 && 
             performanceInfo.cacheHitRate > 80 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Performance looks good!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
