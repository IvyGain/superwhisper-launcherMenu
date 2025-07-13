export interface Mode {
  name: string;
  key: string;
  path: string;
  type?: string;
  icon?: string;
  emoji?: string;
  category?: string;
  description?: string;
  lastUsed?: Date;
  fileName?: string;
}

export interface Settings {
  shortcuts: {
    launcher: string;
  };
  theme: 'system' | 'light' | 'dark';
  modesOrder?: string[];
  icons?: Record<string, string>;
}

export interface IpcChannels {
  'get-modes': () => Mode[];
  'launch-mode': (modeKey: string) => void;
  'update-settings': (settings: Partial<Settings>) => void;
  'get-settings': () => Settings;
  'show-open-dialog': () => any;
  'open-external': (url: string) => void;
  'get-app-version': () => string;
}

declare global {
  interface Window {
    electronAPI: {
      getModes: () => Promise<Mode[]>;
      launchMode: (modePath: string) => Promise<void>;
      updateSettings: (settings: Partial<Settings>) => Promise<void>;
      getSettings: () => Promise<Settings>;
      onModesUpdate: (
        callback: (event: any, modes: Mode[]) => void
      ) => () => void;
      showOpenDialog: () => Promise<any>;
      openExternal: (url: string) => Promise<void>;
      getAppVersion: () => Promise<string>;
    };
  }
}
