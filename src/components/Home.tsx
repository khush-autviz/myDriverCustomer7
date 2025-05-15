import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {
  Black,
  DarkGray,
  Gold,
  Gray,
  LightGold,
  White,
} from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service'
import { useSocket } from '../context/SocketContext';
// import Geolocation from '@react-native-community/geolocation';
// import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

export default function Home() {
  const navigation: any = useNavigation();
  const [location, setLocation] = useState<any>(null);
  // console.log(location);

const socket = useSocket()

console.log("socket", socket);





  const [watchId, setWatchId] = useState<any>(null);

  // Ask for permission (Android only)
  const requestPermission = async () => {
    if (Platform.OS === 'ios') {
      return true; // iOS prompts automatically
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Get current location
  const getCurrentLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Start live location tracking
  const startTracking = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const id = Geolocation.watchPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
    setWatchId(id);
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up watcher on unmount
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: DarkGray,
          borderRadius: 15,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Ionicons
          name="search"
          size={24}
          color={Gray}
          style={{ paddingStart: 10 }}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Location')}>
          <Text
            style={{
              height: 50,
              paddingHorizontal: 10,
              color: Gray,
              paddingTop: 15,
            }}>
            Enter pick up point
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          color: LightGold,
          fontWeight: '700',
          fontSize: 20,
          marginTop: 20,
        }}>
        Categories
      </Text>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: 30,
          justifyContent: 'space-between',
        }}>
        {[
          { name: 'car-sport', label: 'Car' },
          { name: 'bicycle', label: 'Bike' },
          { name: 'people-circle', label: 'Rider' },
          { name: 'apps', label: 'More' },
        ].map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: DarkGray,
              height: 70,
              borderRadius: 8,
              width: 80,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 5,
              paddingTop: 5,
            }}>
            <Ionicons name={item.name} size={40} color={Gold} />
            <Text style={{ color: Gold }}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: '#ffdcd1',
          height: 150,
          marginTop: 30,
          borderRadius: 16,
          padding: 10,
        }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 10 }}>
          40% off Rides ends
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>soon!</Text>
        <TouchableOpacity
          style={{
            backgroundColor: Black,
            width: 100,
            padding: 5,
            marginTop: 20,
            borderRadius: 16,
          }}>
          <Text
            style={{
              color: LightGold,
              textAlign: 'center',
              fontWeight: '500',
            }}>
            Book now
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: '#d1ffbd',
          height: 150,
          marginTop: 20,
          borderRadius: 16,
          padding: 10,
        }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 10 }}>
          Future Updates
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Check now!</Text>
        <TouchableOpacity
          style={{
            backgroundColor: Black,
            width: 100,
            padding: 5,
            marginTop: 20,
            borderRadius: 16,
          }}>
          <Text
            style={{
              color: LightGold,
              textAlign: 'center',
              fontWeight: '500',
            }}>
            Click
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
});
