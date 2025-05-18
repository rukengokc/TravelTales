// screens/DeleteRoutesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Platform
} from 'react-native';
import axios from 'axios';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function DeleteRoutesScreen() {
  const [routes, setRoutes] = useState([]);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/routes/all`);
      setRoutes(res.data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/routes/${id}`);
              fetchRoutes();
            } catch (err) {
              Alert.alert("Error", "Failed to delete route");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Routes</Text>
      <FlatList
        data={routes}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.routeItem}>
            <Text style={styles.routeTitle}>{item.title || 'Untitled Route'}</Text>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No routes available.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },
  routeTitle: { fontSize: 16 },
  deleteText: { color: '#f44336', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});
