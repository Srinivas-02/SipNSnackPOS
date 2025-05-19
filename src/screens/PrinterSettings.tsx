import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useBluetoothStore } from '../store/bluetoothStore';
import {
  isBluetoothEnabled,
  enableBluetooth,
  startBluetoothScan,
  connectToDevice,
  printTestLabel,
} from '../services/BluetoothService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from '../common/styles';

const PrinterSettings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scanning, setScanning] = useState(false);
  const {
    pairedDevices,
    foundDevices,
    connectedDevice,
    setIsScanning,
    setConnectedDevice,
  } = useBluetoothStore();

  const checkBluetoothStatus = useCallback(async () => {
    const enabled = await isBluetoothEnabled();
    if (!enabled) {
      Alert.alert(
        'Bluetooth Disabled',
        'Please enable Bluetooth to scan for printers',
        [
          {
            text: 'Enable Bluetooth',
            onPress: handleEnableBluetooth,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  }, []);

  useEffect(() => {
    checkBluetoothStatus();
  }, [checkBluetoothStatus]);

  const handleEnableBluetooth = async () => {
    try {
      const result = await enableBluetooth();
      if (!result) {
        Alert.alert('Error', 'Failed to enable Bluetooth');
      }
    } catch (error) {
      console.log('Error enabling Bluetooth:', error);
      Alert.alert('Error', 'Failed to enable Bluetooth');
    }
  };

  const handleScanDevices = async () => {
    try {
      setScanning(true);
      setIsScanning(true);
      console.log('Starting Bluetooth scan...');
      const devices = await startBluetoothScan();
      console.log('Scan completed. Found devices:', devices);
      console.log('Store foundDevices:', foundDevices);
    } catch (error) {
      console.log('Error scanning for devices:', error);
      Alert.alert('Error', 'Failed to scan for devices');
    } finally {
      setScanning(false);
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (address: string) => {
    try {
      const result = await connectToDevice(address);
      if (result) {
        Alert.alert('Success', 'Connected to printer successfully');
        setConnectedDevice(address);
      } else {
        Alert.alert('Error', 'Failed to connect to printer');
      }
    } catch (error) {
      console.log('Error connecting to device:', error);
      Alert.alert('Error', 'Failed to connect to printer');
    }
  };

  const handleTestPrint = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No printer connected');
      return;
    }

    try {
      const result = await printTestLabel();
      if (result) {
        Alert.alert('Success', 'Test print successful');
      } else {
        Alert.alert('Error', 'Failed to print test label');
      }
    } catch (error) {
      console.log('Error printing test label:', error);
      Alert.alert('Error', 'Failed to print test label');
    }
  };

  const renderDeviceItem = ({ item, isPaired = false }: { item: any, isPaired?: boolean }) => {
    const isConnected = connectedDevice === item.address;

    return (
      <TouchableOpacity
        style={[styles.deviceItem, isConnected && styles.connectedDevice]}
        onPress={() => handleConnectDevice(item.address)}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceAddress}>{item.address}</Text>
          {isPaired && <Text style={styles.pairedLabel}>Paired</Text>}
        </View>
        {isConnected && (
          <View style={styles.connectedIndicator}>
            <Icon name="check-circle" size={24} color={colors.success} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[globalStyles.heading, styles.title]}>Printer Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScanDevices}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Scan for Devices</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !connectedDevice && styles.disabledButton]}
            onPress={handleTestPrint}
            disabled={!connectedDevice}
          >
            <Text style={styles.actionButtonText}>Test Print</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.devicesContainer}>
          {/* Paired Devices Section */}
          {pairedDevices && pairedDevices.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={[globalStyles.heading, styles.sectionTitle]}>Paired Devices</Text>
              <FlatList
                data={pairedDevices}
                renderItem={({ item }) => renderDeviceItem({ item, isPaired: true })}
                keyExtractor={(item) => item.address}
                contentContainerStyle={styles.devicesList}
              />
            </View>
          )}

          {/* Found Devices Section - Always display the heading */}
          <View style={styles.sectionContainer}>
            <Text style={[globalStyles.heading, styles.sectionTitle]}>Found Devices</Text>
            {foundDevices && foundDevices.length > 0 ? (
              <FlatList
                data={foundDevices}
                renderItem={({ item }) => renderDeviceItem({ item })}
                keyExtractor={(item) => item.address}
                contentContainerStyle={styles.devicesList}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptySubtext}>No new devices found</Text>
                <Text style={styles.emptySubtext}>Tap "Scan for Devices" to search</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  devicesContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  devicesList: {
    paddingBottom: 8,
  },
  deviceItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectedDevice: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pairedLabel: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PrinterSettings;
