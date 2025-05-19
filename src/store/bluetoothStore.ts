import {create} from 'zustand';

// Device state interface
export interface DeviceState {
  name: string;
  address: string;
}

// Bluetooth store state interface
interface BluetoothStoreState {
  permissionsGranted: boolean;
  foundDevices: DeviceState[];
  pairedDevices: DeviceState[];
  connectedDevice: string | null;
  isScanning: boolean;

  // Actions
  setPermissionsGranted: (granted: boolean) => void;
  setFoundDevices: (devices: DeviceState[]) => void;
  addFoundDevice: (device: DeviceState) => void;
  setPairedDevices: (devices: DeviceState[]) => void;
  setConnectedDevice: (address: string | null) => void;
  setIsScanning: (scanning: boolean) => void;
  clearDevices: () => void;
}

// Create the Bluetooth store
export const useBluetoothStore = create<BluetoothStoreState>()((set) => ({
  permissionsGranted: false,
  foundDevices: [],
  pairedDevices: [],
  connectedDevice: null,
  isScanning: false,

  // Set permissions granted state
  setPermissionsGranted: (granted) => set({permissionsGranted: granted}),

  // Set found devices
  setFoundDevices: (devices) => set({foundDevices: devices}),

  // Add a single found device, avoiding duplicates
  addFoundDevice: (device) =>
    set((state) => {
      // Check if device already exists
      const exists = state.foundDevices.some(d => d.address === device.address);
      if (exists) {return state;}

      // Add new device
      return {
        foundDevices: [...state.foundDevices, device],
      };
    }),

  // Set paired devices
  setPairedDevices: (devices) => set({pairedDevices: devices}),

  // Set connected device
  setConnectedDevice: (address) => set({connectedDevice: address}),

  // Set scanning state
  setIsScanning: (scanning) => set({isScanning: scanning}),

  // Clear all devices
  clearDevices: () => set({
    foundDevices: [],
    pairedDevices: [],
  }),
}));
