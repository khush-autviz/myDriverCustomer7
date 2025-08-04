import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useRef, useState, useContext, useEffect} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Black, Gold, White} from '../constants/Color';
import {useAuthStore} from '../store/authStore';
import PlacesSearch from '../test/PlaceSearch';
import {LocationContext} from '../context/LocationProvider';

interface Suggestion {
  description: string;
  place_id: string;
}

export default function Location() {
  // Static flag to prevent any geocoding API calls if one is already in progress
  const staticGeocodingInProgress = useRef(false);

  const navigation: any = useNavigation();
  const setPickupLocation = useAuthStore(state => state.setPickupLocation);
  const setDestinationLocation = useAuthStore(
    state => state.setDestinationLocation,
  );
  const {location, getCurrentLocation} = useContext(LocationContext);

  const [pickupSelected, setPickupSelected] = useState(false);
  const [dropSelected, setDropSelected] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeType, setActiveType] = useState<'pickup' | 'drop' | null>(null);
  const [currentLocationAddress, setCurrentLocationAddress] =
    useState('Current Location');
  const [isCurrentLocation, setIsCurrentLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [geocodeCache, setGeocodeCache] = useState<{[key: string]: string}>({});
  const geocodingAttemptedRef = useRef(false);
  const globalGeocodingInProgressRef = useRef(false); // Global flag to prevent concurrent calls

  // Session-level cache to persist across component re-renders
  const sessionGeocodeCache = useRef<{[key: string]: string}>({});

  // Create separate refs for pickup and drop inputs
  const pickupSearchRef = useRef<any>(null);
  const dropSearchRef = useRef<any>(null);

  // Reset the geocoding flag when component mounts
  useEffect(() => {
    geocodingAttemptedRef.current = false; // Reset the ref when component mounts
    globalGeocodingInProgressRef.current = false; // Reset global flag
    staticGeocodingInProgress.current = false; // Reset static flag
  }, []);

  // Set current location as pickup on screen focus (with safeguards)
  useFocusEffect(
    React.useCallback(() => {
      const setCurrentLocationAsPickup = async () => {
        // Multiple safeguards to prevent repeated API calls
        if (
          !location ||
          pickupSelected ||
          geocodingAttemptedRef.current ||
          globalGeocodingInProgressRef.current ||
          staticGeocodingInProgress.current
        ) {
          console.log('Skipping auto-set pickup:', {
            hasLocation: !!location,
            pickupSelected,
            geocodingAttempted: geocodingAttemptedRef.current,
            globalInProgress: globalGeocodingInProgressRef.current,
            staticInProgress: staticGeocodingInProgress.current,
          });
          return;
        }

        console.log('Auto-setting current location as pickup');
        geocodingAttemptedRef.current = true; // Prevent repeated attempts
        globalGeocodingInProgressRef.current = true; // Prevent concurrent calls
        staticGeocodingInProgress.current = true; // Prevent any other geocoding calls

        const cacheKey = `${location.latitude.toFixed(
          4,
        )},${location.longitude.toFixed(4)}`;

        // Check session cache first
        if (sessionGeocodeCache.current[cacheKey]) {
          // Use session cached result
          setPickupLocation({
            lat: location.latitude,
            lng: location.longitude,
            description: sessionGeocodeCache.current[cacheKey],
          });
          setCurrentLocationAddress('Current Location');
          setIsCurrentLocation(true);
          setPickupSelected(true);
          globalGeocodingInProgressRef.current = false; // Reset global flag
          staticGeocodingInProgress.current = false; // Reset static flag
          console.log('Auto-set pickup to current location (session cached)');
        } else if (geocodeCache[cacheKey]) {
          // Use cached result
          setPickupLocation({
            lat: location.latitude,
            lng: location.longitude,
            description: geocodeCache[cacheKey],
          });
          setCurrentLocationAddress('Current Location');
          setIsCurrentLocation(true);
          setPickupSelected(true);
          globalGeocodingInProgressRef.current = false; // Reset global flag
          staticGeocodingInProgress.current = false; // Reset static flag
          console.log('Auto-set pickup to current location (cached)');
        } else {
          // Make geocoding API call (only once per location)
          console.log(
            'Making geocoding API call for auto-set pickup:',
            cacheKey,
          );
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ`,
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              // Cache the result in both session and state
              sessionGeocodeCache.current[cacheKey] = address;
              setGeocodeCache(prev => ({...prev, [cacheKey]: address}));
              setPickupLocation({
                lat: location.latitude,
                lng: location.longitude,
                description: address,
              });
              setCurrentLocationAddress('Current Location');
              setIsCurrentLocation(true);
              setPickupSelected(true);
              globalGeocodingInProgressRef.current = false; // Reset global flag
              staticGeocodingInProgress.current = false; // Reset static flag
              console.log('Auto-set pickup to current location');
            }
          } catch (error) {
            console.log('error getting address for auto-set pickup', error);
            console.error('Error getting address:', error);
            // Fallback to coordinates only
            setPickupLocation({
              lat: location.latitude,
              lng: location.longitude,
              description: 'Current Location',
            });
            setCurrentLocationAddress('Current Location');
            setIsCurrentLocation(true);
            setPickupSelected(true);
            globalGeocodingInProgressRef.current = false; // Reset global flag
            staticGeocodingInProgress.current = false; // Reset static flag
          } finally {
            globalGeocodingInProgressRef.current = false; // Always reset global flag
            staticGeocodingInProgress.current = false; // Always reset static flag
          }
        }
      };

      setCurrentLocationAsPickup();
    }, [location?.latitude, location?.longitude, pickupSelected]), // More specific dependencies
  );

  // REMOVED: Automatic geocoding on screen focus
  // Now geocoding will only happen when user explicitly selects "Use Current Location"

  const handleSelect = (
    coords: {lat: number; lng: number},
    description: string,
  ) => {
    if (activeType === 'pickup') {
      console.log('Setting pickup location:', {
        lat: coords.lat,
        lng: coords.lng,
        description,
      });
      setPickupLocation({lat: coords.lat, lng: coords.lng, description});
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
      console.log('Setting destination location:', {
        lat: coords.lat,
        lng: coords.lng,
        description,
      });
      setDestinationLocation({lat: coords.lat, lng: coords.lng, description});
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
    const currentDestinationLocation =
      useAuthStore.getState().destinationLocation;

    console.log(
      'Navigating to TripDetails with pickup:',
      currentPickupLocation,
    );
    console.log(
      'Navigating to TripDetails with destination:',
      currentDestinationLocation,
    );

    setTimeout(
      () =>
        navigation.replace('TripDetails', {
          pickupLocation: currentPickupLocation,
          destinationLocation: currentDestinationLocation,
        }),
      100,
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={24}
          color={Gold}
          onPress={() => navigation.goBack()}
        />
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
                ...(activeType === 'pickup'
                  ? [
                      {
                        description: 'Use Current Location',
                        place_id: 'current_location',
                      },
                    ]
                  : []),
                ...suggestions,
              ]}
              keyExtractor={item => item.place_id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.suggestionItem,
                    item.place_id === 'current_location' &&
                      styles.currentLocationItem,
                  ]}
                  onPress={async () => {
                    if (item.place_id === 'current_location') {
                      // Handle current location selection with geocoding
                      if (
                        location &&
                        !globalGeocodingInProgressRef.current &&
                        !staticGeocodingInProgress.current
                      ) {
                        globalGeocodingInProgressRef.current = true; // Prevent concurrent calls
                        staticGeocodingInProgress.current = true; // Prevent any other geocoding calls

                        const handleCurrentLocationSelection = async () => {
                          const cacheKey = `${location.latitude.toFixed(
                            4,
                          )},${location.longitude.toFixed(4)}`;

                          // Check session cache first
                          if (sessionGeocodeCache.current[cacheKey]) {
                            // Use session cached result
                            setPickupLocation({
                              lat: location.latitude,
                              lng: location.longitude,
                              description:
                                sessionGeocodeCache.current[cacheKey],
                            });
                            setCurrentLocationAddress('Current Location');
                            setIsCurrentLocation(true);
                            setPickupSelected(true);
                            setActiveType(null);
                            setSuggestions([]);
                            globalGeocodingInProgressRef.current = false; // Reset flag
                            staticGeocodingInProgress.current = false; // Reset static flag
                            console.log(
                              'pickup location set to current location (session cached)',
                            );
                          } else if (geocodeCache[cacheKey]) {
                            // Use cached result
                            setPickupLocation({
                              lat: location.latitude,
                              lng: location.longitude,
                              description: geocodeCache[cacheKey],
                            });
                            setCurrentLocationAddress('Current Location');
                            setIsCurrentLocation(true);
                            setPickupSelected(true);
                            setActiveType(null);
                            setSuggestions([]);
                            globalGeocodingInProgressRef.current = false; // Reset flag
                            staticGeocodingInProgress.current = false; // Reset static flag
                            console.log(
                              'pickup location set to current location (cached)',
                            );
                          } else {
                            // Make geocoding API call
                            console.log(
                              'Making geocoding API call for current location:',
                              cacheKey,
                            );
                            try {
                              const response = await fetch(
                                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ`,
                              );
                              const data = await response.json();
                              if (data.results && data.results.length > 0) {
                                const address =
                                  data.results[0].formatted_address;
                                // Cache the result in both session and state
                                sessionGeocodeCache.current[cacheKey] = address;
                                setGeocodeCache(prev => ({
                                  ...prev,
                                  [cacheKey]: address,
                                }));
                                setPickupLocation({
                                  lat: location.latitude,
                                  lng: location.longitude,
                                  description: address,
                                });
                                setCurrentLocationAddress('Current Location');
                                setIsCurrentLocation(true);
                                setPickupSelected(true);
                                setActiveType(null);
                                setSuggestions([]);
                                globalGeocodingInProgressRef.current = false; // Reset flag
                                staticGeocodingInProgress.current = false; // Reset static flag
                                console.log(
                                  'pickup location set to current location',
                                );
                              }
                            } catch (error) {
                              console.log(
                                'error getting address for current location',
                                error,
                              );
                              console.error('Error getting address:', error);
                              // Fallback to coordinates only
                              setPickupLocation({
                                lat: location.latitude,
                                lng: location.longitude,
                                description: 'Current Location',
                              });
                              setCurrentLocationAddress('Current Location');
                              setIsCurrentLocation(true);
                              setPickupSelected(true);
                              setActiveType(null);
                              setSuggestions([]);
                              globalGeocodingInProgressRef.current = false; // Reset flag
                              staticGeocodingInProgress.current = false; // Reset static flag
                            } finally {
                              globalGeocodingInProgressRef.current = false; // Always reset flag
                              staticGeocodingInProgress.current = false; // Always reset static flag
                            }
                          }
                        };

                        handleCurrentLocationSelection();
                      }
                    } else {
                      handleSuggestionSelect(item.place_id, item.description);
                    }
                  }}>
                  <View style={styles.suggestionContent}>
                    {item.place_id === 'current_location' && (
                      <Ionicons
                        name="location"
                        size={18}
                        color={Gold}
                        style={styles.suggestionIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.suggestionText,
                        item.place_id === 'current_location' &&
                          styles.currentLocationText,
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
    paddingTop: 10,
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
