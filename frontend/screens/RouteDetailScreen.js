// screens/RouteDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Dimensions, TouchableOpacity, Alert,
  ScrollView, Image, Platform
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

export default function RouteDetailScreen({ route, navigation }) {
  const { routeData, editable } = route.params;

  // full object from server
  const [fullRoute, setFullRoute] = useState(null);
  const [title, setTitle] = useState(routeData.title || '');
  const [description, setDescription] = useState(routeData.description || '');
  const [points, setPoints] = useState(routeData.routePoints || []);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setCurrentUserId);
    fetchFullRoute();
  }, []);

  async function fetchFullRoute() {
    try {
      const res = await axios.get(`${BASE_URL}/routes/${routeData._id}`);
      setFullRoute(res.data);
      // sync edited fields if they changed
      setTitle(res.data.title || '');
      setDescription(res.data.description || '');
      setPoints(res.data.routePoints || []);
    } catch (err) {
      console.error('Failed to load route', err);
    }
  }

  const initialRegion = {
    latitude: points[0]?.latitude || 41.015137,
    longitude: points[0]?.longitude || 28.979530,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  const saveChanges = async () => {
    try {
      await axios.put(`${BASE_URL}/routes/${routeData._id}`, {
        title, description, routePoints: points,
      });
      Alert.alert('Saved!');
      fetchFullRoute();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save failed', err.message);
    }
  };

  const toggleLike = async () => {
    await axios.post(`${BASE_URL}/routes/${routeData._id}/like`, { userId: currentUserId });
    fetchFullRoute();
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
            const res = await axios.post(
              `${BASE_URL}/routes/${routeData._id}/comment`,
              { userId: currentUserId, text: newComment.trim() }
            );
            // merge new comment into state
            setFullRoute(fr => ({
              ...fr,
              comments: [...(fr.comments||[]), res.data]
            }));
            setNewComment('');
          } catch (err) {
            Alert.alert("Comment failed", err.message);
          }
  };

  const deleteComment = async (commentId) => {
    await axios.delete(`${BASE_URL}/routes/${routeData._id}/comment/${commentId}`);
    fetchFullRoute();
  };

  if (!fullRoute) {
    return (
      <View style={styles.loader}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const { likes = [], comments = [] } = fullRoute;
  const ownerId = fullRoute.user?._id || fullRoute.userId;
  const isOwner = currentUserId === ownerId;

  return (
    <ScrollView style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {points.map((pt,i)=><Marker key={i} coordinate={pt}/>)}
        <Polyline coordinates={points} strokeColor="#f00" strokeWidth={3}/>
      </MapView>

      <View style={styles.form}>
        {editable ? (
          <>
            <TextInput style={styles.input} value={title}
              onChangeText={setTitle} placeholder="Title"/>
            <TextInput style={styles.input} value={description}
              onChangeText={setDescription} placeholder="Description"/>
            <TouchableOpacity style={styles.button}
              onPress={()=>setPoints(p=>p.slice(0,-1))}>
              <Text style={styles.buttonText}>Remove Last Point</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}
              onPress={saveChanges}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </>
        )}

        {/* ————— Likes (always show) ————— */}
        <View style={styles.likesRow}>
          <TouchableOpacity onPress={toggleLike}>
            <Ionicons
              name={likes.includes(currentUserId) ? 'heart' : 'heart-outline'}
              size={28}
              color="red"
            />
          </TouchableOpacity>
          <Text style={styles.likesCount}>{likes.length} likes</Text>
        </View>

        {/* ————— Comments list ————— */}
        <Text style={styles.commentHeader}>Comments</Text>
        {comments.map(c => (
          <View key={c._id} style={styles.commentRow}>
            <Image
              source={c.user.profileImage
                ? { uri: c.user.profileImage }
                : require('../assets/default-profile.png')}
              style={styles.commentAvatar}
            />
            <View style={styles.commentText}>
              <Text style={styles.commentUser}>{c.user.username}</Text>
              <Text>{c.text}</Text>
            </View>
            {(c.user._id === currentUserId || currentUserId === ownerId) && (
              <TouchableOpacity onPress={()=>deleteComment(c._id)}>
                <Ionicons name="trash" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* ————— New comment (only if editable) ————— */}
        {currentUserId && (
          <View style={styles.newCommentRow}>
            <TextInput
              style={styles.newCommentInput}
              placeholder="Write a comment…"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={submitComment}>
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex:1,justifyContent:'center',alignItems:'center' },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  form: { padding:16, backgroundColor:'#fff' },
  input: {
    borderWidth:1, borderColor:'#ccc', padding:10,
    borderRadius:6, marginBottom:10,
  },
  title: { fontSize:20,fontWeight:'bold',marginBottom:8 },
  description: { fontSize:16, color:'#555', marginBottom:12 },
  button: {
    backgroundColor:'#f44336',padding:12,borderRadius:6,
    alignItems:'center',marginBottom:10
  },
  saveButton: {
    backgroundColor:'#4CAF50',padding:12,
    borderRadius:6,alignItems:'center'
  },
  buttonText: { color:'#fff',fontWeight:'bold' },

  // likes
  likesRow: { flexDirection:'row', alignItems:'center',
    marginTop:12, marginBottom:12 },
  likesCount: { marginLeft:8 },

  // comments
  commentHeader: { fontWeight:'bold', marginBottom:6 },
  commentRow: {
    flexDirection:'row', alignItems:'center',
    marginBottom:8
  },
  commentAvatar: {
    width:30,height:30,borderRadius:15,marginRight:8
  },
  commentText: { flex:1 },
  commentUser: { fontWeight:'600' },

  // new comment
  newCommentRow: {
    flexDirection:'row', alignItems:'center',
    marginTop:12
  },
  newCommentInput: {
    flex:1,borderWidth:1,borderColor:'#ccc',
    padding:8,borderRadius:6,
  },
  postText: {
    marginLeft:8, color:'#007AFF', fontWeight:'600'
  },
});
