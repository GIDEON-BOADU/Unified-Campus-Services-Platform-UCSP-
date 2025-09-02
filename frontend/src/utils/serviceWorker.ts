// Service Worker Registration and Management
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  public async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, timestamp } = event.data;

    switch (type) {
      case 'SESSION_REFRESH_REQUEST':
        this.handleSessionRefreshRequest(timestamp);
        break;
      case 'SESSION_CHECK_REQUEST':
        this.handleSessionCheckRequest(timestamp);
        break;
      case 'FORCE_SESSION_REFRESH':
        this.handleForceSessionRefresh(timestamp);
        break;
      default:
        console.log('Unknown service worker message:', type);
    }
  }

  private handleSessionRefreshRequest(timestamp: number): void {
    // Dispatch event for session manager to handle
    window.dispatchEvent(new CustomEvent('serviceWorkerSessionRefresh', {
      detail: { timestamp }
    }));
  }

  private handleSessionCheckRequest(timestamp: number): void {
    // Dispatch event for session manager to handle
    window.dispatchEvent(new CustomEvent('serviceWorkerSessionCheck', {
      detail: { timestamp }
    }));
  }

  private handleForceSessionRefresh(timestamp: number): void {
    // Dispatch event for forced session refresh
    window.dispatchEvent(new CustomEvent('serviceWorkerForceRefresh', {
      detail: { timestamp }
    }));
  }

  private showUpdateNotification(): void {
    // Show notification to user about service worker update
    if (confirm('A new version of the app is available. Would you like to update?')) {
      this.registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  public async unregister(): Promise<boolean> {
    if (this.registration) {
      try {
        await this.registration.unregister();
        this.registration = null;
        return true;
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
        return false;
      }
    }
    return false;
  }

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance();
