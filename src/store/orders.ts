import { create } from 'zustand';
import api from '../common/api';

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item__name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_number: string;
  order_date: string;
  total_amount: number;
  location_name: string;
}

export interface OrderDetails extends Order {
  location: {
    id: number;
    name: string;
  };
  items: OrderItem[];
  processed_by?: {
    id: number;
    name: string;
  };
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  location_id: number;
  quantity: number;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: OrderDetails | null;
  isLoading: boolean;
  error: string | null;
  currentCart: CartItem[];
  
  // Actions
  fetchOrders: (locationId?: number) => Promise<void>;
  getOrderDetails: (orderId: number) => Promise<OrderDetails | null>;
  placeOrder: (locationId: number) => Promise<any>;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
}

const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  currentCart: [],
  
  fetchOrders: async (locationId?: number) => {
    try {
      set({ isLoading: true, error: null });
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (locationId) {
        queryParams.append('location_id', locationId.toString());
      }
      
      const response = await api.get(`/orders/history/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ 
        error: 'Failed to load orders. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  getOrderDetails: async (orderId: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`/orders/history/?order_id=${orderId}`);
      const orderDetails = response.data as OrderDetails;
      
      set({ 
        selectedOrder: orderDetails, 
        isLoading: false 
      });
      
      return orderDetails;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      set({ 
        error: 'Failed to load order details. Please try again.', 
        isLoading: false 
      });
      return null;
    }
  },
  
  placeOrder: async (locationId: number) => {
    const { currentCart } = get();
    
    if (currentCart.length === 0) {
      set({ error: 'Your cart is empty' });
      return null;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // Prepare the order data
      const orderItems = currentCart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));
      
      const orderData = {
        location_id: locationId,
        items: orderItems
      };
      
      // Call the API to create the order
      const response = await api.post('/orders/create-order/', orderData);
      
      // Clear the cart after successful order
      if (response.status === 201) {
        set({ currentCart: [], isLoading: false });
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error);
      set({ 
        error: 'Failed to place order. Please try again.', 
        isLoading: false 
      });
      return null;
    }
  },
  
  addToCart: (item) => {
    set((state) => {
      const existingItem = state.currentCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return {
          currentCart: state.currentCart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        };
      }
      return {
        currentCart: [...state.currentCart, { ...item, quantity: 1 }]
      };
    });
  },
  
  removeFromCart: (itemId) => {
    set((state) => {
      const existingItem = state.currentCart.find((item) => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return {
          currentCart: state.currentCart.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        };
      }
      return {
        currentCart: state.currentCart.filter((item) => item.id !== itemId)
      };
    });
  },
  
  clearCart: () => {
    set({ currentCart: [] });
  },
  
  updateItemQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or less
      set((state) => ({
        currentCart: state.currentCart.filter((item) => item.id !== itemId)
      }));
    } else {
      // Update the quantity
      set((state) => ({
        currentCart: state.currentCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      }));
    }
  }
}));

export default useOrdersStore; 