export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  notifications: boolean;
  notificationTypes: {
    email: boolean;
    platform: boolean;
  };
  readingMode: {
    fontSize: 'small' | 'medium' | 'large';
    lineSpacing: 'compact' | 'normal' | 'relaxed';
    fontFamily: 'default' | 'serif' | 'sans-serif';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    colorScheme: 'default' | 'sepia' | 'dark';
  };
  accountSettings: {
    email: string;
    name: string;
    allowDataCollection: boolean;
    avatar: string;
    status: string;
    level: number;
    points: number;
    premium: boolean;
    premiumFeatures: string[];
  };
  animations: boolean;
  autoSave: boolean;
  keyboardShortcuts: boolean;
  supportEnabled: boolean;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  privacy: {
    dataSharing: boolean;
    activityTracking: boolean;
    cookiePreferences: string[];
  };
}

export const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'pt-BR',
  notifications: true,
  notificationTypes: {
    email: true,
    platform: true,
  },
  readingMode: {
    fontSize: 'medium',
    lineSpacing: 'normal',
    fontFamily: 'default',
    textAlign: 'left',
    colorScheme: 'default',
  },
  accountSettings: {
    email: '',
    name: '',
    allowDataCollection: true,
    avatar: '',
    status: '',
    level: 1,
    points: 0,
    premium: false,
    premiumFeatures: [],
  },
  animations: true,
  autoSave: true,
  keyboardShortcuts: true,
  supportEnabled: true,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  },
  privacy: {
    dataSharing: true,
    activityTracking: true,
    cookiePreferences: ['essential'],
  },
};