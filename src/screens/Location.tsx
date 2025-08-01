import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useRef, useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Black, Gold, White } from '../constants/Color';
import { useAuthStore } from '../store/authStore';
import PlacesSearch from '../test/PlaceSearch';
import { LocationContext } from '../context/LocationProvider';

interface Suggestion {
  description: string;
  place_id: string;
}

export default function Location() {
  const navigation: any = useNavigation();
  const setPickupLocation = useAuthStore((state) => state.setPickupLocation);
  const setDestinationLocation = useAuthStore((state) => state.setDestinationLocation);
  const { location, getCurrentLocation } = useContext(LocationContext);

  const [pickupSelected, setPickupSelected] = useState(false);
  const [dropSelected, setDropSelected] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeType, setActiveType] = useState<'pickup' | 'drop' | null>(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState('Current Location');
  const [isCurrentLocation, setIsCurrentLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Create separate refs for pickup and drop inputs
  const pickupSearchRef = useRef<any>(null);
  const dropSearchRef = useRef<any>(null);

  // Get current location on component mount and set as pickup only if no pickup is selected
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      await getCurrentLocation();
      if (location && !pickupSelected) {
        // console.log('current location', location);
        // Reverse geocode to get address from coordinates
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            // Only set pickup location if no pickup has been selected yet
            setPickupLocation({ 
              lat: location.latitude, 
              lng: location.longitude, 
              description: address 
            });
            setPickupSelected(true);
            setIsCurrentLocation(true);
            setCurrentLocationAddress('Current Location'); // Keep showing "Current Location"
            console.log('pickup location set to current location');
          }
        } catch (error) {
          console.log('error getting address', error);
          console.error('Error getting address:', error);
          setCurrentLocationAddress('Select Location');
        }
      }
    };

    fetchCurrentLocation();
  }, [location, getCurrentLocation, setPickupLocation, pickupSelected]);

  const handleSelect = (coords: { lat: number; lng: number }, description: string) => {
    if (activeType === 'pickup') {
      console.log('Setting pickup location:', { lat: coords.lat, lng: coords.lng, description });
      setPickupLocation({ lat: coords.lat, lng: coords.lng, description });
      setPickupSelected(true);
      setActiveType(null);
      setIsCurrentLocation(false); // User selected a different location
      setCurrentLocationAddress(description);
      // Update the pickup search ref with the new value
      if (pickupSearchRef.current) {
        pickupSearchRef.current.setQuery(description);
      }
    } else if (activeType === 'drop') {
      if (!pickupSelected) {
        Alert.alert('Please select your pickup location first');
        return;
      }
      console.log('Setting destination location:', { lat: coords.lat, lng: coords.lng, description });
      setDestinationLocation({ lat: coords.lat, lng: coords.lng, description });
      setDropSelected(true);
      setActiveType(null);
    }
    setSuggestions([]);
  };

  const handleSuggestionSelect = (placeId: string, description: string) => {
    // Use the correct ref based on activeType
    if (activeType === 'pickup') {
      pickupSearchRef.current.fetchPlaceDetails(placeId, description);
    } else if (activeType === 'drop') {
      dropSearchRef.current.fetchPlaceDetails(placeId, description);
    }
  };

  // Navigate when both locations are selected
  if (pickupSelected && dropSelected) {
    // Get the current locations from the store
    const currentPickupLocation = useAuthStore.getState().pickupLocation;
    const currentDestinationLocation = useAuthStore.getState().destinationLocation;
    
    console.log('Navigating to TripDetails with pickup:', currentPickupLocation);
    console.log('Navigating to TripDetails with destination:', currentDestinationLocation);
    
    setTimeout(() => navigation.replace('TripDetails', {
      pickupLocation: currentPickupLocation,
      destinationLocation: currentDestinationLocation
    }), 100);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color={Gold} onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Select Locations</Text>
      </View>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <View style={styles.iconColumn}>
          <Ionicons name="location" size={22} color="green" />
          <Ionicons name="location" size={22} color="red" />
        </View>

        <View style={styles.inputsColumn}>
          {/* Pickup Location - Editable */}
          <PlacesSearch
            ref={pickupSearchRef}
            placeholder="Pickup location"
            initialValue={currentLocationAddress}
            onPlaceSelected={handleSelect}
            setSuggestions={setSuggestions}
            setActive={() => setActiveType('pickup')}
            setLoading={setIsSearching}
            editable={true}
          />

          {/* Drop Location - Editable */}
          <PlacesSearch
            ref={dropSearchRef}
            placeholder="Drop location"
            onPlaceSelected={handleSelect}
            setSuggestions={setSuggestions}
            setActive={() => setActiveType('drop')}
            setLoading={setIsSearching}
            editable={true}
          />
        </View>
      </View>

      {/* Suggestions */}
      {(suggestions.length > 0 || isSearching) && activeType && (
        <View style={styles.suggestionBox}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Gold} />
              <Text style={styles.loadingText}>Searching places...</Text>
            </View>
          ) : (
            <FlatList
              data={[
                // Add "Use Current Location" option when searching for pickup
                ...(activeType === 'pickup' ? [{
                  description: 'Use Current Location',
                  place_id: 'current_location'
                }] : []),
                ...suggestions
              ]}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.suggestionItem,
                    item.place_id === 'current_location' && styles.currentLocationItem
                  ]}
                  onPress={() => {
                    if (item.place_id === 'current_location') {
                      // Handle current location selection
                      if (location) {
                        setPickupLocation({ 
                          lat: location.latitude, 
                          lng: location.longitude, 
                          description: 'Current Location' 
                        });
                        setCurrentLocationAddress('Current Location');
                        setIsCurrentLocation(true);
                        setPickupSelected(true);
                        setActiveType(null);
                        setSuggestions([]);
                      }
                    } else {
                      handleSuggestionSelect(item.place_id, item.description);
                    }
                  }}>
                  <View style={styles.suggestionContent}>
                    {item.place_id === 'current_location' && (
                      <Ionicons name="location" size={18} color={Gold} style={styles.suggestionIcon} />
                    )}
                    <Text style={[
                      styles.suggestionText,
                      item.place_id === 'current_location' && styles.currentLocationText
                    ]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: Gold,
    fontSize: 20,
    fontWeight: '600',
    paddingLeft: 15,
  },
  inputContainer: {
    borderColor: Gold,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 20,
  },
  iconColumn: {
    gap: 25,
    paddingTop: 8,
  },
  inputsColumn: {
    gap: 20,
    width: '85%',
  },
  suggestionBox: {
    marginTop: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    maxHeight: 300,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  suggestionText: {
    color: White,
    fontSize: 14,
  },
  currentLocationItem: {
    backgroundColor: '#333',
  },
  currentLocationText: {
    fontWeight: 'bold',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    color: Gold,
    fontSize: 14,
    marginLeft: 10,
  },
});