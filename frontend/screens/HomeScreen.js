import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { EventRegister } from 'react-native-event-listeners';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCJcfV07R7UMQknmmYqNctfYvAgLssam7g';

function isValidCoord(p) {
  return (
    typeof p.latitude === 'number' &&
    typeof p.longitude === 'number' &&
    !isNaN(p.latitude) &&
    !isNaN(p.longitude)
  );
}

function makeStaticMapUrl(points) {
  const validPoints = points.filter(isValidCoord);
  if (!validPoints.length) return null;

  const markerParams = validPoints
    .map(p => `markers=color:red|${p.latitude},${p.longitude}`)
    .join('&');
  const pathParam =
    'path=color:0x0000ff|weight:3|' +
    validPoints.map(p => `${p.latitude},${p.longitude}`).join('|');

  const size = `${Dimensions.get('window').width.toFixed(0)}x180`;
  const raw = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&${markerParams}&${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
  console.log('🧭 StaticMap URL:', raw);
  return encodeURI(raw);
}

export default function HomeScreen({ navigation }) {
  const [routes, setRoutes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // fetch + reset filtered
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/feed`);
      setRoutes(res.data);
      setFiltered(res.data);            // ← reset filtered to full list
    } catch (err) {
      console.error('❌ Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // refresh any time a route is saved/updated elsewhere
    const sub = EventRegister.addEventListener('routeUpdated', fetchFeed);
    return () => EventRegister.removeEventListener(sub);
  }, []);

  const onSearch = (text) => {
    setSearch(text);
    const lc = text.toLowerCase();
    setFiltered(routes.filter(r =>
      (r.title || '').toLowerCase().includes(lc) ||
      (r.user?.username || '').toLowerCase().includes(lc) || 
      (r.placeNames || []).some(p => p.toLowerCase().includes(lc))
    ));
  };
  

  const renderRoute = ({ item }) => {
    const url = makeStaticMapUrl(item.routePoints);
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Main', {
              screen: 'Profile',
              params: { userId: item.user._id }
            })
          }
        >
          <Text style={styles.username}>{item.user.username}</Text>
        </TouchableOpacity>

        {url ? (
          <Image
            source={{ uri: url }}
            style={styles.image}
            onError={e => console.error('Image load error', e.nativeEvent.error)}
          />
        ) : (
          <View style={[styles.image, styles.emptyImage]}>
            <Text>No points</Text>
          </View>
        )}
        <Text style={styles.title}>{item.title || 'Untitled Route'}</Text>
        {(item.placeNames || []).map((place, i) => (
          <Text key={i} style={styles.placeName}>{place}</Text>
        ))}
        <TouchableOpacity
          onPress={() => navigation.navigate('RouteDetail', { routeData: item })}
        >
          <Text style={styles.viewDetails}>View Details →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or location…"
        value={search}
        onChangeText={onSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={r => r._id}
        renderItem={renderRoute}
        ListEmptyComponent={<Text style={styles.emptyText}>No routes found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ddd'
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4
  },
  placeName: {
    fontSize: 13,
    color: '#555'
  },
  viewDetails: {
    marginTop: 6,
    color: '#007AFF'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999'
  }
});
