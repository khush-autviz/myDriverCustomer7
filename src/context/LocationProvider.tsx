import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import Geolocation, {
  GeoCoordinates,
  GeoPosition,
} from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';

type Location = GeoCoordinates | null;

interface LocationContextType {
  location: Location;
  getCurrentLocation: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  openLocationSettings: () => void;
}

export const LocationContext = createContext<any>(undefined);

interface Props {
  children: ReactNode;
}

export const LocationProvider: React.FC<Props> = ({children}) => {
  const [location, setLocation] = useState<Location>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const openLocationSettings = (): void => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      try {
        const result = await Geolocation.requestAuthorization('whenInUse');
        return result === 'granted';
      } catch (error) {
        console.warn('iOS permission request error:', error);
        return false;
      }
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location to find nearby drivers and provide accurate pickup services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to find nearby drivers and provide accurate pickup services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: openLocationSettings,
              style: 'default'
            }
          ]
        );
        return;
      }

      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          setLocation(position.coords);
        },
        error => {
          console.error('Error getting location:', error);
          
          // Check if location access is permanently denied (Never)
          if (error.code === 1) {
            Alert.alert(
              'Location Access Required',
              'Location access has been permanently denied. To use this app, please enable location access in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Open Settings', 
                  onPress: openLocationSettings,
                  style: 'default'
                }
              ]
            );
          } else if (error.code === 2) {
            Alert.alert(
              'Location Unavailable',
              'Location services are currently unavailable. Please check your device settings and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Open Settings', 
                  onPress: openLocationSettings,
                  style: 'default'
                }
              ]
            );
          } else {
            Alert.alert(
              'Location Error',
              'Failed to get your location. Please check your location settings and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Open Settings', 
                  onPress: openLocationSettings,
                  style: 'default'
                }
              ]
            );
          }
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'An error occurred while getting your location. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: openLocationSettings,
            style: 'default'
          }
        ]
      );
    }
  };

  const startTracking = async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const id = Geolocation.watchPosition(
      (position: GeoPosition) => {
        setLocation(position.coords);
      },
      error => {
        console.error('Error watching location:', error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
    setWatchId(id);
  };

  const stopTracking = (): void => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    getCurrentLocation(); // Get initial location on mount

    return () => {
      // Clean up live tracking on unmount
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider
      value={{
        location,
        getCurrentLocation,
        startTracking,
        stopTracking,
        openLocationSettings,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

// Optional: Custom hook for easier context usage
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
