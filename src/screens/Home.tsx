import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import MenuOverlay from '../components/MenuOverlay';
// Types
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Mock data - In real app, this would come from an API
const MENU_CATEGORIES = [
  'Tiffins',
  'Lunch',
  'Drinks',
  'Cafe',
  'Desserts',
];
const MENU_ITEMS: MenuItem[] = [
  // Tiffins
  { id: '1', name: 'Dosa', price: 60, category: 'Tiffins' },
  { id: '2', name: 'Idli', price: 40, category: 'Tiffins' },
  { id: '3', name: 'Vada', price: 35, category: 'Tiffins' },
  { id: '4', name: 'Upma', price: 45, category: 'Tiffins' },
  { id: '5', name: 'Pongal', price: 50, category: 'Tiffins' },

  // Lunch
  { id: '6', name: 'Biryani', price: 120, category: 'Lunch' },
  { id: '7', name: 'Butter Chicken', price: 150, category: 'Lunch' },
  { id: '8', name: 'Paneer Tikka', price: 130, category: 'Lunch' },
  { id: '9', name: 'Dal Makhani', price: 100, category: 'Lunch' },
  { id: '10', name: 'Naan', price: 30, category: 'Lunch' },

  // Drinks
  { id: '11', name: 'Masala Chai', price: 25, category: 'Drinks' },
  { id: '12', name: 'Lassi', price: 40, category: 'Drinks' },
  { id: '13', name: 'Mango Shake', price: 60, category: 'Drinks' },
  { id: '14', name: 'Buttermilk', price: 20, category: 'Drinks' },
  { id: '15', name: 'Fresh Lime Soda', price: 30, category: 'Drinks' },

  // Cafe
  { id: '16', name: 'Espresso', price: 40, category: 'Cafe' },
  { id: '17', name: 'Cappuccino', price: 50, category: 'Cafe' },
  { id: '18', name: 'Latte', price: 60, category: 'Cafe' },
  { id: '19', name: 'Green Tea', price: 35, category: 'Cafe' },
  { id: '20', name: 'Hot Chocolate', price: 55, category: 'Cafe' },

  // Desserts
  { id: '21', name: 'Gulab Jamun', price: 45, category: 'Desserts' },
  { id: '22', name: 'Rasmalai', price: 50, category: 'Desserts' },
  { id: '23', name: 'Ice Cream', price: 60, category: 'Desserts' },
  { id: '24', name: 'Kheer', price: 40, category: 'Desserts' },
  { id: '25', name: 'Jalebi', price: 35, category: 'Desserts' },
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(MENU_CATEGORIES[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const filteredItems = MENU_ITEMS.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const placeOrder = async () => {
    try {
      // Here you would make an API call to your backend
      // await api.sendOrder(cartItems);
      setCartItems([]); // Clear cart after successful order
      Alert.alert('Success', 'Order placed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

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
          {MENU_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items Area */}
      <View style={styles.menuContainer}>
        <FlatList
          data={filteredItems}
          numColumns={3}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Floating Cart */}
      <View style={styles.cart}>
        <Text style={styles.cartTitle}>Current Order</Text>
        <ScrollView style={styles.cartItems}>
          {cartItems.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Text>{item.name} x {item.quantity}</Text>
              <View style={styles.cartItemActions}>
                <Text>₹{item.price * item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  <View style={{width: 24, height: 24, backgroundColor: 'red', borderRadius: 12}} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.cartFooter}>
          <Text style={styles.total}>Total: ₹{calculateTotal()}</Text>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={placeOrder}
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
});

export default Home;
