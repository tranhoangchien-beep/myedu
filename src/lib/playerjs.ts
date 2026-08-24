/**
 * Player.js Standard Protocol Helper (http://playerjs.io)
 * Enables two-way communication between MyEdu host and Streamtape / HTML5 embedded players.
 */

export interface PlayerJSEventData {
  event: 'ready' | 'play' | 'pause' | 'timeupdate' | 'ended' | 'error';
  value?: {
    seconds?: number;
    duration?: number;
    [key: string]: any;
  } | number | null;
}

export type PlayerJSListener = (data: PlayerJSEventData) => void;

export class PlayerJSController {
  private iframe: HTMLIFrameElement | null = null;
  private listeners: Set<PlayerJSListener> = new Set();
  private isReady: boolean = false;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor(iframeElement?: HTMLIFrameElement | null) {
    if (iframeElement) {
      this.attach(iframeElement);
    }
  }

  public attach(iframeElement: HTMLIFrameElement) {
    this.detach();
    this.iframe = iframeElement;
    this.isReady = false;

    this.messageHandler = (event: MessageEvent) => {
      try {
        let data: any = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (data && (data.context === 'player.js' || data.event)) {
          if (data.event === 'ready') {
            this.isReady = true;
            this.send('addEventListener', 'timeupdate');
            this.send('addEventListener', 'ended');
            this.send('addEventListener', 'play');
            this.send('addEventListener', 'pause');
            this.send('getDuration');
          }

          this.listeners.forEach((listener) => listener(data));
        }
      } catch {
        // Ignore non-JSON postMessage payloads from other third-party extensions
      }
    };

    window.addEventListener('message', this.messageHandler);

    // Send ready ping
    this.send('addEventListener', 'ready');
    this.send('addEventListener', 'timeupdate');
    this.send('addEventListener', 'ended');
  }

  public detach() {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.iframe = null;
    this.isReady = false;
    this.listeners.clear();
  }

  public on(listener: PlayerJSListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public send(method: string, value: any = null) {
    if (!this.iframe || !this.iframe.contentWindow) return;
    try {
      const payload = JSON.stringify({
        context: 'player.js',
        version: '0.0.11',
        method,
        value,
      });
      this.iframe.contentWindow.postMessage(payload, '*');
    } catch (e) {
      console.warn('[Player.js] Send message failed:', e);
    }
  }

  public play() {
    this.send('play');
  }

  public pause() {
    this.send('pause');
  }

  public togglePlay(isPlaying: boolean) {
    if (isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    this.send('setCurrentTime', seconds);
  }

  public seekRelative(deltaSeconds: number, currentSeconds: number) {
    const target = Math.max(0, currentSeconds + deltaSeconds);
    this.seek(target);
  }

  public getDuration() {
    this.send('getDuration');
  }
}
