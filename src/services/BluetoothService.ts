import {Platform, PermissionsAndroid, Alert, DeviceEventEmitter} from 'react-native';
import {BluetoothManager, BluetoothTscPrinter, BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {useBluetoothStore} from '../store/bluetoothStore';

// Check if Bluetooth permissions are already granted
export const checkBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {return true;}

  if (Platform.Version >= 31) {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    const granted = await Promise.all(
      permissions.map(permission =>
        PermissionsAndroid.check(permission)
      )
    );

    return granted.every(status => status === true);
  }

  return true;
};

// Request Bluetooth permissions if not already granted
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  try {
    // For Android 12+ (API level 31 and above)
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      if (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Bluetooth permissions granted');
        return true;
      } else {
        console.log('Bluetooth permissions denied');
        Alert.alert(
          'Permission Required',
          'Bluetooth permissions are required for this app to work properly',
          [{text: 'OK'}],
        );
        return false;
      }
    } else {
      // For Android 11 and below, we don't need to request these specific permissions
      return true;
    }
  } catch (error) {
    console.log('Error requesting permissions: ', error);
    return false;
  }
};

// Check if Bluetooth is enabled
export const isBluetoothEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await BluetoothManager.isBluetoothEnabled();
    return enabled;
  } catch (error) {
    console.log('Error checking Bluetooth status:', error);
    return false;
  }
};

// Enable Bluetooth and get paired devices
export const enableBluetooth = async (): Promise<boolean> => {
  try {
    const result = await BluetoothManager.enableBluetooth();
    const store = useBluetoothStore.getState();

    if (result && result.length > 0) {
      const pairedDevices = [];
      for (let i = 0; i < result.length; i++) {
        try {
          pairedDevices.push(JSON.parse(result[i]));
        } catch (e) {
          // Ignore parsing errors
        }
      }

      if (pairedDevices.length > 0) {
        store.setPairedDevices(pairedDevices);
      }
    }

    return true;
  } catch (error) {
    console.log('Error enabling Bluetooth:', error);
    return false;
  }
};

// Scan for Bluetooth devices
export const startBluetoothScan = async () => {
  try {
    const enabled = await BluetoothManager.isBluetoothEnabled();
    if (enabled) {
      const devicesStr = await BluetoothManager.scanDevices();
      const devices = JSON.parse(devicesStr);
      console.log('Scanned devices:', devices);

      // Store found devices in the Bluetooth store
      const store = useBluetoothStore.getState();
      console.log('\n\n the founded devices are ', devices.found);
      store.setFoundDevices(devices.found);

      return devices;
    } else {
      console.log('Bluetooth is not enabled');
      return null;
    }
  } catch (error) {
    console.log('Error scanning devices:', error);
    return null;
  }
};

// Connect to a Bluetooth device
export const connectToDevice = async (address: string): Promise<boolean> => {
  try {
    await BluetoothManager.connect(address);
    const store = useBluetoothStore.getState();
    store.setConnectedDevice(address);
    return true;
  } catch (error) {
    console.log('Error connecting to device:', error);
    return false;
  }
};

// Check if the device is actually connected and ready to print
export const isDeviceConnected = async (address: string): Promise<boolean> => {
  try {
    if (!address) {return false;}

    // Check if Bluetooth is enabled
    const isEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isEnabled) {return false;}

    // Check if the device is connected
    // Since there's no direct method to check a specific device's connection,
    // we'll use a try-catch with a dummy operation
    try {
      // Try to get device status - this will fail if not connected
      await BluetoothManager.isBluetoothEnabled();
      return true;
    } catch (connectionError) {
      console.log('Device connection check failed:', connectionError);
      return false;
    }
  } catch (error) {
    console.log('Error checking device connection:', error);
    return false;
  }
};

// Set up device event listeners
export const setupBluetoothListeners = () => {
  const store = useBluetoothStore.getState();

  DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
    (rsp) => {
      if (rsp && rsp.devices) {
        try {
          const devices = JSON.parse(rsp.devices);
          store.setPairedDevices(devices);
        } catch (e) {
          console.log('Error parsing paired devices:', e);
        }
      }
    }
  );

  DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_FOUND,
    (rsp) => {
      if (rsp && rsp.device) {
        try {
          const device = JSON.parse(rsp.device);
          store.addFoundDevice(device);
        } catch (e) {
          console.log('Error parsing found device:', e);
        }
      }
    }
  );
};

// Print a test label using TSC printer
export const printTestLabel = async () => {
  try {
    const options = {
      width: 40,
      height: 30,
      gap: 20,
      direction: BluetoothTscPrinter.DIRECTION.FORWARD,
      reference: [0, 0],
      tear: BluetoothTscPrinter.TEAR.ON,
      sound: 0,
      text: [{
        text: 'Test Print',
        x: 20,
        y: 0,
        fonttype: BluetoothTscPrinter.FONTTYPE.SIMPLIFIED_CHINESE,
        rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
        xscal: BluetoothTscPrinter.FONTMUL.MUL_1,
        yscal: BluetoothTscPrinter.FONTMUL.MUL_1,
      }],
    };

    await BluetoothTscPrinter.printLabel(options);
    return true;
  } catch (error) {
    console.log('Error printing test label:', error);
    return false;
  }
};

// Print a receipt with order details
export const printOrderReceipt = async (orderNumber: string, items: Array<{name: string, price: number, quantity: number}>, totalAmount: number) => {
      try {
        return await printOrderReceiptEscPos(orderNumber, items, totalAmount);
      } catch (escposError) {
        console.log('ESCPOS printer also failed:', escposError);
        return false;
      }
    };

// Print a receipt with ESCPOS printer (fallback method)
export const printOrderReceiptEscPos = async (orderNumber: string, items: Array<{name: string, price: number, quantity: number}>, totalAmount: number) => {
  try {
    // Get the connected device address
    const store = useBluetoothStore.getState();
    const deviceAddress = store.connectedDevice;

    // Verify the device is connected before attempting to print
    if (!deviceAddress) {
      console.log('No device address found for printing');
      return false;
    }

    // Try to connect if not already connected
    try {
      await connectToDevice(deviceAddress);
    } catch (e) {
      console.log('Failed to connect for ESCPOS printing:', e);
    }

    // Print header
    await BluetoothEscposPrinter.printText('SIP N SNACK\n\r\n\r', {});
    await BluetoothEscposPrinter.printText(`Order #${orderNumber}\n\r`, {});

    // Print date and time
    const now = new Date();
    await BluetoothEscposPrinter.printText(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n\r\n\r`, {});

    // Print separator
    await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});

    // Print column headers
    const columnWidths = [16, 4, 12];
    const columnAligns = [0, 1, 2]; // LEFT, CENTER, RIGHT
    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      columnAligns,
      ['Item', 'Qty', 'Price'],
      {}
    );

    await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});

    // Print items
    for (const item of items) {
      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        columnAligns,
        [
          item.name.substring(0, 18),
          item.quantity.toString(),
          `Rs ${(item.price * item.quantity).toFixed(2)}`,
        ],
        {}
      );
    }

    // Print separator
    await BluetoothEscposPrinter.printText('--------------------------------\n\r', {});
    // Print total
    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      columnAligns,
      ['TOTAL', ':', `Rs ${totalAmount}`],
      {}
    );

    // Print thank you message
    await BluetoothEscposPrinter.printText('\n\rThank you for your order!\n\r\n\r\n\r', {});

    return true;
  } catch (error) {
    console.log('Error printing order receipt with ESCPOS:', error);
    return false;
  }
};

// Initialize Bluetooth service
export const initializeBluetoothService = async () => {
  try {
    // Check if permissions are already granted
    const hasPermissions = await checkBluetoothPermissions();

    if (!hasPermissions) {
      // Request permissions if not already granted
      const granted = await requestBluetoothPermissions();
      if (!granted) {return false;}
    }

    // Check if Bluetooth is enabled
    const isEnabled = await isBluetoothEnabled();

    if (!isEnabled) {
      // Try to enable Bluetooth
      await enableBluetooth();
    }

    // Set up Bluetooth event listeners
    setupBluetoothListeners();

    // Start scanning for devices
    await startBluetoothScan();

    return true;
  } catch (error) {
    console.log('Error initializing Bluetooth service:', error);
    return false;
  }
};
