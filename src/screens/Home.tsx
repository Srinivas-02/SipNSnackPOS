import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import MenuOverlay from '../components/MenuOverlay';
import useMenuStore from '../store/menu';
import useOrdersStore, { CartItem } from '../store/orders';
import api from '../common/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Add this at the very top of the file to fix the linter error for the icon import
// @ts-ignore
// eslint-disable-next-line
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
  const categories = useMenuStore((state) => state.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Get cart and order functions from store
  const { 
    currentCart: cartItems, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    placeOrder, 
    isLoading: orderLoading 
  } = useOrdersStore();
  
  // Find menu items for the selected category
  const filteredItems =
    categories.find((cat) => cat.name === selectedCategory)?.menu_items || [];
  
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);
  
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
      
      // Get the current location ID from the first menu item
      const location_id = cartItems[0].location_id;
      
      // Call the placeOrder function from the store
      const result = await placeOrder(location_id);
      
      if (result) {
        // Show success message with order number
        Alert.alert(
          'Order Placed!', 
          `Order #${result.order_number} has been placed successfully.\nTotal: ₹${result.total_amount}`,
          [
            { 
              text: 'View Receipt',
              onPress: () => {
                // In a real app, you'd navigate to a receipt screen or open a webview
                const itemsList = result.order_items.map(
                  (item: any) => `${item.quantity}x Item #${item.menu_item_id} (₹${item.price})`
                ).join('\n');
                
                Alert.alert(
                  'Receipt', 
                  `Order #${result.order_number}\n\nItems:\n${itemsList}\n\nTotal: ₹${result.total_amount}`
                );
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        throw new Error('Order failed to be created');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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
                  <Text style={styles.menuItemPrice}>₹{item.price}</Text>
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
                <Text style={{ marginLeft: 10 }}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.cartFooter}>
          <Text style={styles.total}>Total: ₹{calculateTotal()}</Text>
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
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
