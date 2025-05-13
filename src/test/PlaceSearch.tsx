// // // PlacesSearch.tsx
// // import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
// // import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
// // import axios from 'axios';

// // const GOOGLE_MAPS_API_KEY = 'AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I';

// // interface Prediction {
// //   description: string;
// //   place_id: string;
// // }

// // interface Props {
// //   placeholder: string;
// //   onPlaceSelected: (coords: { lat: number; lng: number }, description: string) => void;
// //   setSuggestions?: (suggestions: Prediction[]) => void;
// //   setActive?: () => void;
// //   initialValue?: string;
// // }

// // const PlacesSearch = forwardRef(({
// //   placeholder,
// //   onPlaceSelected,
// //   setSuggestions,
// //   setActive,
// //   initialValue = ''
// // }: Props, ref) => {
// //   const [query, setQuery] = useState(initialValue);
// //   const [selectedDescription, setSelectedDescription] = useState(initialValue);
// //   const [internalSuggestions, setInternalSuggestions] = useState<Prediction[]>([]);
// //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

// //   const fetchAutocomplete = async (input: string) => {
// //     if (!input) {
// //       setInternalSuggestions([]);
// //       setSuggestions?.([]);
// //       return;
// //     }

// //     try {
// //       const res = await axios.get(
// //         'https://maps.googleapis.com/maps/api/place/autocomplete/json',
// //         {
// //           params: {
// //             input,
// //             key: GOOGLE_MAPS_API_KEY,
// //             language: 'en',
// //           },
// //         }
// //       );

// //       if (res.data.status === 'OK') {
// //         setInternalSuggestions(res.data.predictions);
// //         setSuggestions?.(res.data.predictions);
// //       } else {
// //         setInternalSuggestions([]);
// //         setSuggestions?.([]);
// //       }
// //     } catch (err) {
// //       console.error('Autocomplete error:', err);
// //     }
// //   };

// //   const fetchPlaceDetails = async (placeId: string, description: string) => {
// //     try {
// //       const res = await axios.get(
// //         'https://maps.googleapis.com/maps/api/place/details/json',
// //         {
// //           params: {
// //             place_id: placeId,
// //             key: GOOGLE_MAPS_API_KEY,
// //           },
// //         }
// //       );
// //       const coords = res.data.result.geometry.location;
// //       setQuery(description);
// //       setSelectedDescription(description);
// //       onPlaceSelected(coords, description);
// //       setInternalSuggestions([]);
// //       setSuggestions?.([]);
// //     } catch (err) {
// //       console.error('Place details error:', err);
// //     }
// //   };

// //   const handleSelect = (item: Prediction) => {
// //     fetchPlaceDetails(item.place_id, item.description);
// //   };

// //   const handleChangeText = (text: string) => {
// //     setQuery(text);
// //     setActive?.();
// //     fetchAutocomplete(text);
// //   };

// //   const handleBlur = () => {
// //     // Revert input value when the input loses focus
// //     setQuery(selectedDescription);
// //   };

// //   // Exposing fetchPlaceDetails via ref
// //   useImperativeHandle(ref, () => ({
// //     fetchPlaceDetails,
// //   }));

// //   useEffect(() => {
// //     setQuery(initialValue);
// //     setSelectedDescription(initialValue);
// //   }, [initialValue]);

// //   return (
// //     <View style={styles.container}>
// //       <TextInput
// //         value={query}
// //         placeholder={placeholder}
// //         placeholderTextColor="#999"
// //         style={styles.input}
// //         onChangeText={handleChangeText}
// //         onFocus={setActive}
// //         onBlur={handleBlur}
// //       />
// //       {/* Suggestions are rendered below the input field */}
// //       <FlatList
// //         data={internalSuggestions}
// //         keyExtractor={(item) => item.place_id}
// //         renderItem={({ item }) => (
// //           <TouchableOpacity onPress={() => handleSelect(item)}>
// //             <Text style={styles.suggestion}>{item.description}</Text>
// //           </TouchableOpacity>
// //         )}
// //       />
// //     </View>
// //   );
// // });

// // export default PlacesSearch;

// // const styles = StyleSheet.create({
// //   container: {
// //     width: '100%',
// //   },
// //   input: {
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#ccc',
// //     paddingVertical: 8,
// //     color: '#fff',
// //   },
// //   suggestion: {
// //     paddingVertical: 10,
// //     borderBottomColor: '#ccc',
// //     borderBottomWidth: 1,
// //     color: '#fff',
// //   },
// // });





// import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
// import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import axios from 'axios';

// const GOOGLE_MAPS_API_KEY = 'AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I';

// interface Prediction {
//   description: string;
//   place_id: string;
// }

// interface Props {
//   placeholder: string;
//   onPlaceSelected: (coords: { lat: number; lng: number }, description: string) => void;
//   setSuggestions?: (suggestions: Prediction[]) => void;
//   setActive?: () => void;
//   initialValue?: string;
// }

// const PlacesSearch = forwardRef(({
//   placeholder,
//   onPlaceSelected,
//   setSuggestions,
//   setActive,
//   initialValue = ''
// }: Props, ref) => {
//   const [query, setQuery] = useState(initialValue);
//   const [selectedDescription, setSelectedDescription] = useState(initialValue);
//   const [internalSuggestions, setInternalSuggestions] = useState<Prediction[]>([]);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const fetchAutocomplete = async (input: string) => {
//     if (!input) {
//       setInternalSuggestions([]);
//       setSuggestions?.([]);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         'https://maps.googleapis.com/maps/api/place/autocomplete/json',
//         {
//           params: {
//             input,
//             key: GOOGLE_MAPS_API_KEY,
//             language: 'en',
//           },
//         }
//       );

//       if (res.data.status === 'OK') {
//         setInternalSuggestions(res.data.predictions);
//         setSuggestions?.(res.data.predictions);
//       } else {
//         setInternalSuggestions([]);
//         setSuggestions?.([]);
//       }
//     } catch (err) {
//       console.error('Autocomplete error:', err);
//     }
//   };

//   const fetchPlaceDetails = async (placeId: string, description: string) => {
//     try {
//       const res = await axios.get(
//         'https://maps.googleapis.com/maps/api/place/details/json',
//         {
//           params: {
//             place_id: placeId,
//             key: GOOGLE_MAPS_API_KEY,
//           },
//         }
//       );
//       const coords = res.data.result.geometry.location;
//       setQuery(description);
//       setSelectedDescription(description);
//       onPlaceSelected(coords, description);
//       setInternalSuggestions([]);
//       setSuggestions?.([]);
//     } catch (err) {
//       console.error('Place details error:', err);
//     }
//   };

//   const handleSelect = (item: Prediction) => {
//     fetchPlaceDetails(item.place_id, item.description);
//   };

//   const handleChangeText = (text: string) => {
//     setQuery(text);
//     setActive?.();
//     fetchAutocomplete(text);
//   };

//   const handleBlur = () => {
//     // Revert input value when the input loses focus
//     setQuery(selectedDescription);
//   };

//   // Exposing fetchPlaceDetails via ref
//   useImperativeHandle(ref, () => ({
//     fetchPlaceDetails,
//   }));

//   useEffect(() => {
//     setQuery(initialValue);
//     setSelectedDescription(initialValue);
//   }, [initialValue]);

//   return (
//     <View style={styles.container}>
//       <TextInput
//         value={query}
//         placeholder={placeholder}
//         placeholderTextColor="#999"
//         style={styles.input}
//         onChangeText={handleChangeText}
//         onFocus={setActive}
//         onBlur={handleBlur}
//       />
//       {/* Suggestions are rendered below the input field */}
//       <FlatList
//         data={internalSuggestions}
//         keyExtractor={(item) => item.place_id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => handleSelect(item)}>
//             <Text style={styles.suggestion}>{item.description}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// });

// export default PlacesSearch;

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingVertical: 8,
//     color: '#fff',
//   },
//   suggestion: {
//     paddingVertical: 10,
//     borderBottomColor: '#ccc',
//     borderBottomWidth: 1,
//     color: '#fff',
//   },
// });





import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I';

interface Prediction {
  description: string;
  place_id: string;
}

interface Props {
  placeholder: string;
  onPlaceSelected: (coords: { lat: number; lng: number }, description: string) => void;
  setSuggestions?: (suggestions: Prediction[]) => void;
  setActive?: () => void;
  initialValue?: string;
}

const PlacesSearch = forwardRef(({
  placeholder,
  onPlaceSelected,
  setSuggestions,
  setActive,
  initialValue = ''
}: Props, ref) => {
  const [query, setQuery] = useState(initialValue);
  const [selectedDescription, setSelectedDescription] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAutocomplete = async (input: string) => {
    if (!input) {
      setSuggestions?.([]);
      return;
    }

    try {
      const res = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input,
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          },
        }
      );

      if (res.data.status === 'OK') {
        setSuggestions?.(res.data.predictions);
      } else {
        setSuggestions?.([]);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  };

  const fetchPlaceDetails = async (placeId: string, description: string) => {
    try {
      const res = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      const coords = res.data.result.geometry.location;
      setQuery(description);
      setSelectedDescription(description);
      onPlaceSelected(coords, description);
      setSuggestions?.([]);
    } catch (err) {
      console.error('Place details error:', err);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    setActive?.();
    fetchAutocomplete(text);
  };

  const handleBlur = () => {
    // Revert input value when the input loses focus
    setQuery(selectedDescription);
  };

  // Exposing fetchPlaceDetails via ref
  useImperativeHandle(ref, () => ({
    fetchPlaceDetails,
  }));

  useEffect(() => {
    setQuery(initialValue);
    setSelectedDescription(initialValue);
  }, [initialValue]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={handleChangeText}
        onFocus={setActive}
        onBlur={handleBlur}
      />
    </View>
  );
});

export default PlacesSearch;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    color: '#fff',
  },
});