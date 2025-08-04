import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import {View, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ';

interface Prediction {
  description: string;
  place_id: string;
}

interface Props {
  placeholder: string;
  onPlaceSelected: (
    coords: {lat: number; lng: number},
    description: string,
  ) => void;
  setSuggestions?: (suggestions: Prediction[]) => void;
  setActive?: () => void;
  initialValue?: string;
  editable?: boolean;
  setLoading?: (loading: boolean) => void;
}

const PlacesSearch = forwardRef(
  (
    {
      placeholder,
      onPlaceSelected,
      setSuggestions,
      setActive,
      initialValue = '',
      editable = true,
      setLoading,
    }: Props,
    ref,
  ) => {
    const [query, setQuery] = useState(initialValue);
    const [selectedDescription, setSelectedDescription] =
      useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cache for autocomplete results
    const autocompleteCache = useRef<{[key: string]: Prediction[]}>({});

    // Flag to prevent multiple place details API calls
    const placeDetailsInProgress = useRef(false);

    const fetchAutocomplete = async (input: string) => {
      if (!input || input.length < 3) {
        // Only search after 3 characters
        setSuggestions?.([]);
        setIsLoading(false);
        setLoading?.(false);
        return;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check cache first
      if (autocompleteCache.current[input]) {
        setSuggestions?.(autocompleteCache.current[input]);
        setIsLoading(false);
        setLoading?.(false);
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsLoading(true);
      setLoading?.(true);

      timeoutRef.current = setTimeout(async () => {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
          const res = await axios.get(
            'https://maps.googleapis.com/maps/api/place/autocomplete/json',
            {
              params: {
                input,
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              },
              signal: abortControllerRef.current.signal,
            },
          );

          if (res.data.status === 'OK') {
            // Cache the results
            autocompleteCache.current[input] = res.data.predictions;
            setSuggestions?.(res.data.predictions);
          } else {
            setSuggestions?.([]);
          }
        } catch (err: any) {
          // Don't log error if request was cancelled
          if (err.name !== 'CanceledError') {
            console.error('Autocomplete error:', err);
          }
          setSuggestions?.([]);
        } finally {
          setIsLoading(false);
          setLoading?.(false);
        }
      }, 800); // Increased debounce from 300ms to 800ms
    };

    const fetchPlaceDetails = async (placeId: string, description: string) => {
      // Prevent multiple simultaneous place details calls
      if (placeDetailsInProgress.current) {
        console.log('Place details call already in progress, skipping');
        return;
      }

      placeDetailsInProgress.current = true;
      setIsLoading(true);
      setLoading?.(true);

      try {
        const res = await axios.get(
          'https://maps.googleapis.com/maps/api/place/details/json',
          {
            params: {
              place_id: placeId,
              key: GOOGLE_MAPS_API_KEY,
            },
          },
        );

        if (
          res.data.status === 'OK' &&
          res.data.result &&
          res.data.result.geometry
        ) {
          const coords = res.data.result.geometry.location;
          console.log('PlaceSearch - fetched coordinates:', coords);
          console.log('PlaceSearch - description:', description);
          setQuery(description);
          setSelectedDescription(description);
          onPlaceSelected(coords, description);
        } else {
          console.error('Invalid place details response:', res.data);
        }
      } catch (err) {
        console.error('Place details error:', err);
      } finally {
        setIsLoading(false);
        setLoading?.(false);
        placeDetailsInProgress.current = false; // Reset flag
      }
    };

    const handleChangeText = (text: string) => {
      if (!editable) return;
      setQuery(text);
      fetchAutocomplete(text);
    };

    const handleFocus = () => {
      if (!editable) return;
      // Call setActive when the input is focused
      setActive?.();
    };

    const handleBlur = () => {
      if (!editable) return;
      // Only revert if the query is empty, otherwise keep the current value
      if (!query.trim()) {
        setQuery(selectedDescription);
      }
    };

    // Exposing fetchPlaceDetails and setQuery via ref
    useImperativeHandle(ref, () => ({
      fetchPlaceDetails,
      setQuery: (newText: string) => {
        setQuery(newText);
        setSelectedDescription(newText);
      },
    }));

    useEffect(() => {
      if (initialValue && !selectedDescription) {
        setQuery(initialValue);
        setSelectedDescription(initialValue);
      }
    }, [initialValue, selectedDescription]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            value={query}
            placeholder={placeholder}
            placeholderTextColor="#999"
            style={[styles.input, !editable && styles.disabledInput]}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFD700" />
            </View>
          )}
        </View>
      </View>
    );
  },
);

export default PlacesSearch;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    color: '#fff',
  },
  disabledInput: {
    color: '#999',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    position: 'absolute',
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
