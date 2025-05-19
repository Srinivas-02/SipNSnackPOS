import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, globalStyles } from '../common/styles';

interface MenuOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isVisible, onClose }) => {
  const menuItems = [
    { id: 1, title: 'Location', icon: '📍' },
    { id: 2, title: 'Settings', icon: '⚙️' },
    { id: 3, title: 'My Orders', icon: '📋' },
    { id: 4, title: 'Help & Support', icon: '❓' },
    { id: 5, title: 'Log Out', icon: '🚪' },
  ];

  return (
    <>
      {isVisible && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} />
          <View style={styles.menu}>
            <View style={styles.header}>
              <Text style={[globalStyles.heading, styles.headerText]}>Menu</Text>
            </View>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={[globalStyles.text, styles.menuItemText]}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    flexDirection: 'row',
  },
  closeArea: {
    flex: 1,
  },
  menu: {
    width: 280,
    backgroundColor: colors.card,
    height: '100%',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
  },
});

export default MenuOverlay;
