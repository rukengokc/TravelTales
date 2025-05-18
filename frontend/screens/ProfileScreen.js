// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, FlatList, ActivityIndicator, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { EventRegister } from 'react-native-event-listeners';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

export default function ProfileScreen({ navigation, route }) {
  const isFocused = useIsFocused();

  const [meId, setMeId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // 👈 new state for role

  const isOwn = meId === viewId;

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get(`${BASE_URL}/user/${viewId}`);
      setProfile(userRes.data);

      const routeRes = await axios.get(`${BASE_URL}/routes`, {
        params: { userId: viewId, isDraft: false }
      });
      setRoutes(routeRes.data);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      const storedRole = await AsyncStorage.getItem('role'); // 👈 get role
      const viewId = route.params?.userId || storedId;
      setMeId(storedId);
      setViewId(viewId);
      setRole(storedRole); // 👈 store role in state
    };
    init();
  }, [route.params]);

  useEffect(() => {
    if (viewId) fetchData();
  }, [viewId, isFocused]);

  const handleFollowToggle = async () => {
    const isFollowing = profile.followers.includes(meId);
    const endpoint = isFollowing ? 'unfollow' : 'follow';
    await axios.post(`${BASE_URL}/users/${profile._id}/${endpoint}`, {
      userId: meId
    });
    fetchData();
  };

  const renderRoute = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() =>
        navigation.navigate('RouteDetail', {
          routeData: item,
          editable: isOwn
        })
      }
    >
      <Image
        source={require('../assets/route-preview.jpg')}
        style={styles.routeImage}
      />
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle}>{item.title || 'Untitled Route'}</Text>
        {isOwn && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('RouteDetail', {
                routeData: item,
                editable: true
              })
            }
          >
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading || !profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isFollowing = profile.followers.includes(meId);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={
            profile.profileImage
              ? { uri: profile.profileImage }
              : require('../assets/default-profile.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.username}>{profile.username}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Followers: {profile.followers.length}</Text>
          <Text style={styles.stat}>Following: {profile.following.length}</Text>
        </View>

        {isOwn ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { userId: meId })}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleFollowToggle}
          >
            <Text style={styles.editText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
        )}

        {/* ADMIN ONLY BUTTONS */}
        {role === 'admin' && (
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('ManageUsers')}
            >
              <Text style={styles.editText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('DeleteRoutes')}
            >
              <Text style={styles.editText}>Delete Routes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        {isOwn ? 'My Routes' : `${profile.username}’s Routes`}
      </Text>

      <FlatList
        data={routes}
        keyExtractor={r => r._id}
        renderItem={renderRoute}
        ListEmptyComponent={
          <Text style={styles.empty}>No routes to show.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#fff' },
  loader:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader:{
    alignItems: 'center', paddingVertical: 24,
    borderBottomWidth: 1, borderColor: '#eee'
  },
  avatar:      { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  username:    { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  stats:       { flexDirection: 'row', marginVertical: 6 },
  stat:        { marginHorizontal: 12, color: '#555' },
  editButton:  {
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#007AFF', borderRadius: 4
  },
  editText:    { color: '#007AFF' },
  sectionTitle:{ fontSize: 18, fontWeight: 'bold', margin: 16 },
  routeItem:   {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#f7f7f7', borderRadius: 8, overflow: 'hidden'
  },
  routeImage:  { width: 60, height: 60 },
  routeInfo:   {
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10
  },
  routeTitle:  { fontSize: 16, fontWeight: '600' },
  empty:       { textAlign: 'center', color: '#999', marginTop: 40 }
});
