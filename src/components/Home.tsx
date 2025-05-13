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
  console.log(location);

  useEffect(() => {
    // fetchLocation();
    // getInitialLocation()
    // getCurrentLocation()
  }, []);


  // const getInitialLocation = async () => {
  //   try {
  //     Geolocation.getCurrentPosition(
  //       (position) => {
  //         console.log(position.coords, 'position');
  //         setLocation({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //           latitudeDelta: 0.01,
  //           longitudeDelta: 0.01,
  //         });
  //       },
  //       (error) => {
  //         console.log('Error occurred: ', error);
  
  //         if (error.code === 1) {
  //           console.log('Permission denied');
  //           Alert.alert(
  //             'Permission Denied',
  //             'Enable location services to see your live location.'
  //           );
  //         } else if (error.code === 2) {
  //           console.log('Position unavailable');
  //           Alert.alert('Error', 'Location unavailable.');
  //         } else if (error.code === 3) {
  //           console.log('Request timed out');
  //           Alert.alert('Timeout', 'Location request timed out. Try again.');
  //         } else {
  //           Alert.alert('Error', error.message);
  //         }
  //       },
  //       {
  //         enableHighAccuracy: false,
  //         timeout: 10000,
  //         maximumAge: 10000,
  //       }
  //     );
  //   } catch (err) {
  //     console.error('An unexpected error occurred:', err);
  //   }
  // };
  

  // const requestLocationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: 'Location Permission',
  //         message: 'App needs access to your location.',
  //         buttonPositive: 'OK',
  //       }
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   }
  //   return true;
  // };

  // const promptEnableGPS = async () => {
  //   try {
  //     await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
  //       interval: 10000,
  //     });
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // };

  // const fetchLocation = async () => {
  //   const hasPermission = await requestLocationPermission();
  //   if (!hasPermission) {
  //     Alert.alert('Permission Denied', 'Location permission is required.');
  //     return;
  //   }

  //   const gpsEnabled = await promptEnableGPS();
  //   if (!gpsEnabled) {
  //     Alert.alert(
  //       'Enable Location Services',
  //       'Please enable GPS manually in settings to continue.',
  //       [
  //         { text: 'Cancel', style: 'cancel' },
  //         { text: 'Open Settings', onPress: () => Linking.openSettings() },
  //       ]
  //     );
  //     return;
  //   }

  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       setLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         latitudeDelta: 0.01,
  //         longitudeDelta: 0.01,
  //       });
  //     },
  //     (error) => {
  //       console.error('Location error:', error.message);
  //       Alert.alert('Error', 'Failed to get location: ' + error.message);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 15000,
  //       maximumAge: 10000,
  //     }
  //   );
  // };


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
