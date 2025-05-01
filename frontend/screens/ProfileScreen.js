import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserDataAndRoutes = async () => {
      const id = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');
      if (id) {
        setUserId(id);
        setUsername(name);
        await fetchSharedRoutes(id);  // pass the ID directly
      }
    };
  
    if (isFocused) {
      fetchUserDataAndRoutes();
    }
  }, [isFocused]);
  
  
  const fetchSharedRoutes = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/routes`, {
        params: {
          userId: id,
          isDraft: false,
        },
      });
      setRoutes(response.data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const updateUsername = async () => {
    try {
      await axios.put(`${BASE_URL}/user/${userId}`, { username });
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating username:', err);
    }
  };

  const renderRoute = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() => navigation.navigate('RouteDetail', { routeData: item, editable: true })}
    >
      <Image source={require('../assets/route-preview.jpg')} style={styles.routeImage} />
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle}>{item.title || 'Untitled Route'}</Text>
        <Ionicons name="pencil" size={20} color="#333" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={require('../assets/default-profile.png')} style={styles.avatar} />
        {isEditingName ? (
          <TextInput
            value={username}
            onChangeText={setUsername}
            onBlur={updateUsername}
            style={styles.usernameInput}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Text style={styles.username}>{username}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.stats}>
          <Text style={styles.stat}>Followers: {followers}</Text>
          <Text style={styles.stat}>Following: {following}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Shared Routes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList data={routes} keyExtractor={(item) => item._id} renderItem={renderRoute} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  username: { fontSize: 20, fontWeight: 'bold' },
  usernameInput: {
    fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc'
  },
  stats: { flexDirection: 'row', gap: 16, marginTop: 6 },
  stat: { fontSize: 14, color: '#555' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  routeItem: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10
  },
  routeImage: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  routeInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeTitle: { fontSize: 16, fontWeight: '600' },
});
