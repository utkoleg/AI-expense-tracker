import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.utkoleg.receiptly',
  appName: 'Receiptly',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  }
};

export default config;