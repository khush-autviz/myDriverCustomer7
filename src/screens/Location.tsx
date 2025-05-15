// import {
//   StyleSheet,
//   Text,
//   View,
//   Alert,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import React, { useRef, useState, useEffect, useContext } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { Black, Gold, White } from '../constants/Color';
// import { useAuthStore } from '../store/authStore';
// import PlacesSearch from '../test/PlaceSearch';
// import { LocationContext } from '../context/LocationProvider';

// interface Suggestion {
//   description: string;
//   place_id: string;
// }

// export default function Location() {
//   const navigation: any = useNavigation();
//   const setPickupLocation = useAuthStore((state) => state.setPickupLocation);
//   const setDestinationLocation = useAuthStore((state) => state.setDestinationLocation);
//   const { location, getCurrentLocation } = useContext(LocationContext);

//   const [pickupSelected, setPickupSelected] = useState(false);
//   const [dropSelected, setDropSelected] = useState(false);
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [activeType, setActiveType] = useState<'pickup' | 'drop' | null>(null);
//   const [fullLocationDescription, setFullLocationDescription] = useState('');
//   const [currentLocationLabel, setCurrentLocationLabel] = useState('Current Location');

//   const placesSearchRef = useRef<any>(null);

//   // Get current location on component mount
//   useEffect(() => {
//     const fetchCurrentLocation = async () => {
//       await getCurrentLocation();
//       if (location) {
//         // Reverse geocode to get address from coordinates
//         try {
//           const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I`
//           );
//           const data = await response.json();
//           if (data.results && data.results.length > 0) {
//             const address = data.results[0].formatted_address;
//             setFullLocationDescription(address);
//             // Set pickup location with current coordinates and address
//             setPickupLocation({ 
//               lat: location.latitude, 
//               lng: location.longitude, 
//               description: address 
//             });
//             setPickupSelected(true);
//           }
//         } catch (error) {
//           console.error('Error getting address:', error);
//         }
//       }
//     };

//     fetchCurrentLocation();
//   }, []);

//   const handleSelect = (coords: { lat: number; lng: number }, description: string) => {
//     if (activeType === 'pickup') {
//       setPickupLocation({ lat: coords.lat, lng: coords.lng, description });
//       setPickupSelected(true);
//       setActiveType(null);
//       // If user selects a different pickup location, it's no longer the current location
//       setCurrentLocationLabel(description);
//     } else if (activeType === 'drop') {
//       if (!pickupSelected) {
//         Alert.alert('Please select your pickup location first');
//         return;
//       }
//       setDestinationLocation({ lat: coords.lat, lng: coords.lng, description });
//       setDropSelected(true);
//       setActiveType(null);
//     }
//     setSuggestions([]);
//   };

//   // Navigate when both locations are selected
//   if (pickupSelected && dropSelected) {
//     setTimeout(() => navigation.navigate('TripDetails'), 100);
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Ionicons name="chevron-back" size={24} color={Gold} onPress={() => navigation.goBack()} />
//         <Text style={styles.headerText}>Select Locations</Text>
//       </View>

//       {/* Inputs */}
//       <View style={styles.inputContainer}>
//         <View style={styles.iconColumn}>
//           <Ionicons name="location" size={22} color="green" />
//           <Ionicons name="location" size={22} color="red" />
//         </View>

//         <View style={styles.inputsColumn}>
//           {/* Pickup Location */}
//           <PlacesSearch
//             ref={placesSearchRef}
//             placeholder="Pickup location"
//             initialValue={currentLocationLabel}
//             onPlaceSelected={handleSelect}
//             setSuggestions={setSuggestions}
//             setActive={() => setActiveType('pickup')}
//           />

//           {/* Drop Location */}
//           <PlacesSearch
//             ref={placesSearchRef}
//             placeholder="Drop location"
//             onPlaceSelected={handleSelect}
//             setSuggestions={setSuggestions}
//             setActive={() => setActiveType('drop')}
//           />
//         </View>
//       </View>

//       {/* Suggestions - Outside of inputContainer */}
//       {suggestions.length > 0 && (
//         <View style={styles.suggestionBox}>
//           <FlatList
//             data={suggestions}
//             keyExtractor={(item) => item.place_id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.suggestionItem}
//                 onPress={() =>
//                   placesSearchRef.current.fetchPlaceDetails(item.place_id, item.description)
//                 }>
//                 <Text style={styles.suggestionText}>{item.description}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       )}
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Black,
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerText: {
//     color: Gold,
//     fontSize: 20,
//     fontWeight: '600',
//     paddingLeft: 15,
//   },
//   inputContainer: {
//     borderColor: Gold,
//     borderWidth: 1,
//     padding: 15,
//     borderRadius: 10,
//     flexDirection: 'row',
//     gap: 20,
//   },
//   iconColumn: {
//     gap: 25,
//     paddingTop: 8,
//   },
//   inputsColumn: {
//     gap: 20,
//     width: '85%',
//   },
//   suggestionBox: {
//     marginTop: 15,
//     backgroundColor: '#222',
//     borderRadius: 10,
//     padding: 10,
//     maxHeight: 300,
//   },
//   suggestionItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#444',
//   },
//   suggestionText: {
//     color: White,
//     fontSize: 14,
//   },
// });   





import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useRef, useState, useContext } from 'react';
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
  const { location } = useContext(LocationContext);

  const [pickupSelected, setPickupSelected] = useState(false);
  const [dropSelected, setDropSelected] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeType, setActiveType] = useState<'pickup' | 'drop' | null>(null);

  // Create separate refs for pickup and drop inputs
  const pickupSearchRef = useRef<any>(null);
  const dropSearchRef = useRef<any>(null);

  const handleSelect = (coords: { lat: number; lng: number }, description: string) => {
    if (activeType === 'pickup') {
      setPickupLocation({ lat: coords.lat, lng: coords.lng, description });
      setPickupSelected(true);
      setActiveType(null);
    } else if (activeType === 'drop') {
      if (!pickupSelected) {
        Alert.alert('Please select your pickup location first');
        return;
      }
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
    setTimeout(() => navigation.navigate('TripDetails'), 100);
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
          {/* Pickup Location - with its own ref */}
          <PlacesSearch
            ref={pickupSearchRef}
            placeholder="Pickup location"
            onPlaceSelected={handleSelect}
            setSuggestions={setSuggestions}
            setActive={() => setActiveType('pickup')}
          />

          {/* Drop Location - with its own ref */}
          <PlacesSearch
            ref={dropSearchRef}
            placeholder="Drop location"
            onPlaceSelected={handleSelect}
            setSuggestions={setSuggestions}
            setActive={() => setActiveType('drop')}
          />
        </View>
      </View>

      {/* Suggestions - Outside of inputContainer */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item.place_id, item.description)}>
                <Text style={styles.suggestionText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    padding: 20,
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
});