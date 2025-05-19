import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import useLocationStore from '../store/location';

interface Location {
  id: number;
  name: string;
}

const LocationSelector = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const locations = useLocationStore((state) => state.locations);
  const setactiveLocationId = useLocationStore((state) => state.setactiveLocationId);
  const setactiveLocation = useLocationStore((state) => state.setactiveLocation);

  const selectLocation = (location: Location) => {
    setactiveLocationId(location.id);
    setactiveLocation(location.id);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Select Location</Text>
          <Text style={styles.subHeaderText}>Choose which location you want to work with</Text>
        </View>

        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.locationItem}
              onPress={() => selectLocation(item)}
            >
              <Text style={styles.locationName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  locationItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationName: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
});

export default LocationSelector; 