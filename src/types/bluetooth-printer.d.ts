// Type definitions for react-native-bluetooth-escpos-printer
declare module 'react-native-bluetooth-escpos-printer' {
  export const BluetoothManager: {
    EVENT_DEVICE_ALREADY_PAIRED: string;
    EVENT_DEVICE_FOUND: string;
    EVENT_CONNECTION_LOST: string;
    EVENT_UNABLE_CONNECT: string;
    EVENT_CONNECTED: string;
    EVENT_BLUETOOTH_NOT_SUPPORT: string;

    isBluetoothEnabled(): Promise<boolean>;
    enableBluetooth(): Promise<any[]>;
    disableBluetooth(): Promise<boolean>;
    scanDevices(): Promise<string>;
    connect(address: string): Promise<any>;
    disconnect(address: string): Promise<any>;
  };

  export const BluetoothTscPrinter: {
    DIRECTION: {
      FORWARD: number;
      BACKWARD: number;
    };
    FONTMUL: {
      MUL_1: number;
      MUL_2: number;
      MUL_3: number;
      MUL_4: number;
      MUL_5: number;
      MUL_6: number;
      MUL_7: number;
      MUL_8: number;
      MUL_9: number;
      MUL_10: number;
    };
    FONTTYPE: {
      FONT_1: string;
      FONT_2: string;
      FONT_3: string;
      FONT_4: string;
      FONT_5: string;
      FONT_6: string;
      FONT_7: string;
      FONT_8: string;
      SIMPLIFIED_CHINESE: string;
      TRADITIONAL_CHINESE: string;
      KOREAN: string;
    };
    ROTATION: {
      ROTATION_0: number;
      ROTATION_90: number;
      ROTATION_180: number;
      ROTATION_270: number;
    };
    TEAR: {
      ON: string;
      OFF: string;
    };

    printLabel(options: any): Promise<any>;
  };

  export const BluetoothEscposPrinter: {
    printText(text: string, options?: any): Promise<any>;
    printColumn(columnWidths: number[],
                columnAligns: number[],
                columnTexts: string[],
                options?: any): Promise<any>;
    printBarCode(code: string, type: number, width: number, height: number, position: number, cut: number): Promise<any>;
    printQRCode(code: string, version: number, level: string, width: number, position: number, cut: number): Promise<any>;
    printPic(base64: string, options?: any): Promise<any>;
  };
}
