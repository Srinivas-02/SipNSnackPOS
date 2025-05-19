import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MenuOverlay from '../components/MenuOverlay';
import useMenuStore from '../store/menu';
import useOrdersStore from '../store/orders';
import { useBluetoothStore } from '../store/bluetoothStore';
import useLocationStore from '../store/location';
import { RootStackParamList } from '../types/navigation';
import { printOrderReceipt } from '../services/BluetoothService';
import api from '../common/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Add this at the very top of the file to fix the linter error for the icon import
// @ts-ignore

declare module 'react-native-vector-icons/MaterialCommunityIcons';

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  location_id: number;
}

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const connectedDevice = useBluetoothStore(state => state.connectedDevice);
  const categories = useMenuStore((state) => state.categories);
  const activeLocationId = useLocationStore((state) => state.activeLocationId);
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const setCategories = useMenuStore((state) => state.setCategories);
  const setMenuItems = useMenuStore((state) => state.setMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get cart and order functions from store
  const {
    currentCart: cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    placeOrder,
    isLoading: orderLoading,
  } = useOrdersStore();

  // Check if we have an active location selected
  useEffect(() => {
    if (!activeLocationId) {
      navigation.navigate('StaffLogin');
    } else {
      // Fetch menu data for the active location
      fetchMenuDataForLocation();
    }
  }, [activeLocationId, navigation]);

  // Fetch menu data specific to the active location
  const fetchMenuDataForLocation = async () => {
    if (!activeLocationId) {return;}

    try {
      setLoading(true);

      // Fetch categories for this location
      const categoriesResponse = await api.get(`/menu/categories/?location_id=${activeLocationId}`);
      setCategories(categoriesResponse.data);

      // Fetch menu items for this location
      const menuItemsResponse = await api.get(`/menu/menu-items/?location_id=${activeLocationId}`);
      setMenuItems(menuItemsResponse.data);
    } catch (error) {
      console.error('Error fetching menu data for location:', error);
      Alert.alert('Error', 'Failed to load menu data for this location');
    } finally {
      setLoading(false);
    }
  };

  // Find menu items for the selected category
  const filteredItems =
    categories.find((cat) => cat.name === selectedCategory)?.menu_items || [];

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Check if a printer is connected
  useEffect(() => {
    if (!connectedDevice) {
      Alert.alert(
        'No Printer Connected',
        'Please connect a printer to continue',
        [
          {
            text: 'Connect Printer',
            onPress: () => {
              navigation.navigate('PrinterSettings');
            },
          },
          {
            text: 'Continue Anyway',
            style: 'cancel',
          },
        ]
      );
    }
  }, [connectedDevice, navigation]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  const handleRemoveFromCart = (itemId: number) => {
    removeFromCart(itemId);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Use the active location ID for placing orders
      const location_id = activeLocationId;

      if (!location_id) {
        Alert.alert('Error', 'No active location selected');
        setLoading(false);
        return;
      }

      // Call the placeOrder function from the store
      const result = await placeOrder(location_id);

      if (result) {
        // Print receipt if a printer is connected
        if (connectedDevice) {
          try {
            console.log('Attempting to print receipt with device:', connectedDevice);

            // Map cart items to format needed for printing
            const items = cartItems.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            }));

            console.log('Printing receipt for order:', result);

            // Allow a little time for the Bluetooth connection to stabilize
            // We'll use a timeout to handle this asynchronously
            setTimeout(async () => {
              try {
                // Attempt to print receipt after delay
                console.log('Executing delayed print job');
                const printResult = await printOrderReceipt(
                  result.order_id.toString(),
                  items,
                  result.total_amount
                );
                console.log(printResult);
                if (printResult) {
                  console.log('Receipt printed successfully');
                } else {
                  console.error('Print function returned false');
                  Alert.alert(
                    'Print Failed',
                    'Unable to print receipt. The printer may be disconnected or out of paper.',
                    [
                      {
                        text: 'Retry',
                        onPress: async () => {
                          // Retry printing
                          await printOrderReceipt(
                            result.order_id.toString(),
                            items,
                            result.total_amount
                          );
                        },
                      },
                      {text: 'OK'},
                    ]
                  );
                }
              } catch (delayedPrintError) {
                console.error('Delayed printing failed:', delayedPrintError);
                Alert.alert('Print Error', 'Failed to print receipt after delay.');
              }
            }, 1000); // 1 second delay to ensure connection is stable
          } catch (printError) {
            console.error('Error printing receipt:', printError);
            Alert.alert(
              'Print Error',
              'Failed to print receipt. Please check printer connection.',
              [
                {
                  text: 'Retry',
                  onPress: async () => {
                    try {
                      const items = cartItems.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                      }));

                      await printOrderReceipt(
                        result.order_id.toString(),
                        items,
                        result.total_amount
                      );
                    } catch (retryError) {
                      console.error('Retry printing failed:', retryError);
                    }
                  },
                },
                {text: 'OK'},
              ]
            );
          }
        } else {
          console.log('No printer connected, skipping receipt printing');
          Alert.alert(
            'No Printer Connected',
            'Connect a printer in Settings to print receipts',
            [
              {
                text: 'Go to Printer Settings',
                onPress: () => navigation.navigate('PrinterSettings'),
              },
              {text: 'Skip', style: 'cancel'},
            ]
          );
        }

        // Show success message with order number
        Alert.alert(
          'Order Placed!',
          `Order #${result.order_id} has been placed successfully.\nTotal: Rs ${result.total_amount}`,
          [
            {
              text: 'View Receipt',
              onPress: () => {
                // In a real app, you'd navigate to a receipt screen or open a webview
                const itemsList = result.order_items.map(
                  (item: any) => `${item.quantity}x Item #${item.menu_item_id} (Rs ${item.price})`
                ).join('\n');

                Alert.alert(
                  'Receipt',
                  `Order #${result.order_id}\n\nItems:\n${itemsList}\n\nTotal: Rs ${result.total_amount}`
                );
              },
            },
            {text: 'OK'},
          ]
        );
      } else {
        throw new Error('Order failed to be created');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Order Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Display current location in header
  const locationName = activeLocation ? activeLocation.name : 'No Location Selected';

  return (
    <SafeAreaView style={styles.container}>
      <MenuOverlay isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Menu Bar */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          style={styles.categoriesBar}
          contentContainerStyle={styles.categoriesBarContent}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items Area */}
      <View style={styles.menuContainer}>
        {loading || orderLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : filteredItems.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
            No items available for this category.
          </Text>
        ) : (
          <FlatList
            data={getGridData(filteredItems, 3)}
            numColumns={3}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) =>
              item ? (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleAddToCart(item)}
                >
                  <View style={styles.menuItemImagePlaceholder}>
                    <Icon name="image-outline" size={36} color="#bbb" />
                  </View>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemPrice}>Rs {item.price}</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.menuItem, { backgroundColor: 'transparent', elevation: 0 }]} />
              )
            }
          />
        )}
      </View>

      {/* Floating Cart */}
      <View style={styles.cart}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cartTitle}>Current Order</Text>
          <TouchableOpacity onPress={() => clearCart()}>
            <Icon name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.cartItems}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Text>
                {item.name} x {item.quantity}
              </Text>
              <View style={styles.cartItemActions}>
                <TouchableOpacity onPress={() => handleAddToCart(item)}>
                  <Icon name="plus-circle" size={22} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)}>
                  <Icon name="minus-circle" size={22} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => clearCart()}>
                  <Icon name="delete" size={22} color="#E53935" />
                </TouchableOpacity>
                <Text style={{ marginLeft: 10 }}>Rs {item.price * item.quantity}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.cartFooter}>
          <Text style={styles.total}>Total: Rs {calculateTotal()}</Text>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={cartItems.length === 0}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 100,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    paddingLeft: 15,
    height: 70,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: undefined,
    aspectRatio: 1,
  },
  menuButton: {
    padding: 15,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  categoriesContainer: {
    height: 65,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesBar: {
    height: '100%',
  },
  categoriesBarContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    height: '90%',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  menuItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cart: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 300,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  cartItems: {
    maxHeight: 280,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeButton: {
    padding: 5,
  },
  cartFooter: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

function getGridData<T>(data: T[], numColumns: number): (T | null)[] {
  const rows = Math.ceil(data.length / numColumns);
  const filled: (T | null)[] = [...data];
  while (filled.length < rows * numColumns) {
    filled.push(null);
  }
  return filled;
}

export default Home;
