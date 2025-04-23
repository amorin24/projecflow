import { useEffect, useState } from 'react';

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

const apiCache = new Map<string, CacheItem>();

const CACHE_DURATION = 5 * 60 * 1000;

export const useCachedFetch = (url: string, options?: RequestInit) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const cachedItem = apiCache.get(url);
      const now = Date.now();
      
      if (cachedItem && now < cachedItem.expiry) {
        setData(cachedItem.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        apiCache.set(url, {
          data: result,
          timestamp: now,
          expiry: now + CACHE_DURATION
        });
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options ? JSON.stringify(options) : null]);

  return { data, loading, error };
};

export const clearCache = (url?: string) => {
  if (url) {
    apiCache.delete(url);
  } else {
    apiCache.clear();
  }
};

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: { 
  src: string; 
  alt: string; 
  width?: number; 
  height?: number; 
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = document.getElementById(`image-${src}`);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [src]);

  return (
    <div 
      id={`image-${src}`}
      className={`relative ${className || ''}`}
      style={{ width, height }}
    >
      {isInView ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div 
          className="bg-gray-200 animate-pulse" 
          style={{ width: width || '100%', height: height || '100%' }}
        />
      )}
    </div>
  );
};

export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    return new Promise(resolve => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
};

export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let lastTime = 0;
  
  return (...args: Parameters<F>): ReturnType<F> | void => {
    const now = Date.now();
    
    if (now - lastTime >= waitFor) {
      lastTime = now;
      return func(...args);
    }
  };
};

export const memoize = <F extends (...args: any[]) => any>(
  func: F
): F => {
  const cache = new Map<string, ReturnType<F>>();
  
  return ((...args: Parameters<F>): ReturnType<F> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<F>;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as F;
};

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('performance' in window)) {
      return;
    }

    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstPaint = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (firstPaint) {
        setMetrics(prev => ({ ...prev, fcp: firstPaint.startTime }));
      }
    });
    
    fcpObserver.observe({ type: 'paint', buffered: true });

    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const largestPaint = entries[entries.length - 1];
      
      if (largestPaint) {
        setMetrics(prev => ({ ...prev, lcp: largestPaint.startTime }));
      }
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstInput = entries[0];
      
      if (firstInput) {
        const entry = firstInput as any;
        setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });

    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50">
      <div>FCP: {metrics.fcp.toFixed(2)}ms</div>
      <div>LCP: {metrics.lcp.toFixed(2)}ms</div>
      <div>FID: {metrics.fid.toFixed(2)}ms</div>
      <div>CLS: {metrics.cls.toFixed(4)}</div>
    </div>
  );
};

export default {
  useCachedFetch,
  clearCache,
  OptimizedImage,
  debounce,
  throttle,
  memoize,
  PerformanceMonitor
};
