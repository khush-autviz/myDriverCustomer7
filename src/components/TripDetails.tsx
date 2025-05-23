import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Black, Gold, Gray, LightGold, White } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker} from 'react-native-maps';
import { LocationContext } from '../context/LocationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import MapViewDirections from 'react-native-maps-directions';
import { useSocket } from '../context/SocketContext';
import { useMutation } from '@tanstack/react-query';
import { calculateRidePrice, cancelRide, CreateRide } from '../constants/Api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripDetails() {
  const navigation: any = useNavigation();
  const [mode, setmode] = useState('first');
  const [ridePrices, setridePrices] = useState([])
  const [rideDetails, setrideDetails] = useState<any>()
  const [selctedRide, setselctedRide] = useState<any>()
  const bottomSheetRef = useRef<BottomSheet>(null);
  const screenHeight = Dimensions.get('window').height;
  const socket = useSocket()

  const { pickupLocation, destinationLocation } = useAuthStore();

  const { location } = useContext(LocationContext)

  const snapPoints = useMemo(() => ['25%', '50%'], []);



  // location details
  const pickupCoord =
    pickupLocation && pickupLocation.lat !== undefined && pickupLocation.lng !== undefined
      ? { latitude: pickupLocation.lat, longitude: pickupLocation.lng }
      : undefined;

  const destinationCoord =
    destinationLocation && destinationLocation.lat !== undefined && destinationLocation.lng !== undefined
      ? { latitude: destinationLocation.lat, longitude: destinationLocation.lng }
      : undefined;


  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);     

  // calculate ride price
  const RidePriceMutation = useMutation({
    mutationFn: calculateRidePrice,
    onSuccess: (response) => {
      console.log('ride price success', response);
      setridePrices(response.data.data.priceEstimates)
    },
    onError: (error) => {
      console.log('ride price error', error);
    },
  })

  //create ride
  const CreateRideMutation = useMutation({
    mutationFn: CreateRide,
    onSuccess: (response) => {
      console.log('ride created success', response);
      setrideDetails(response.data.data.ride)
      setmode('second')
    },
    onError: (error) => {
      console.log('ride created error', error);
    },
  })

  //cancel ride
  const cancelRideMutation = useMutation({
    mutationFn: cancelRide,
    onSuccess: (response) => {
      console.log('ride cancelled success', response);
      navigation.navigate('Main')
    },
    onError: (error) => {
      console.log('ride cancelled error', error);
    },
  })

  const handleBookButton = () => {
    if (selctedRide) {
      const data = {
        pickupLocation: {
          address: pickupLocation?.description,
          coordinates: [
            pickupCoord?.latitude, pickupCoord?.longitude,
          ]
        },
        destination: {
          address:destinationLocation?.description,
          coordinates: [
         destinationCoord?.latitude, destinationCoord?.longitude,
          ]
        },
        vehicleId: selctedRide.vehicleId,
      }
      CreateRideMutation.mutate(data)
    }
  }

  const handleCancelButton = () => {
    if (rideDetails) {
      const data = {
        rideId: rideDetails.id,
      }
      cancelRideMutation.mutateAsync(data)
    }
  }

  useEffect(() => {
    if (pickupCoord && destinationCoord) {
      const data = {
        pickupCoords: pickupCoord,
        destinationCoords: destinationCoord,
      }
      RidePriceMutation.mutateAsync(data)
    }
    
  }, [])

  useEffect(() => {
    setselctedRide(ridePrices[0])
  }, [ridePrices])

  useEffect(() => {
    if (rideDetails) {
      socket?.emit('bookRide', {
        rideId: rideDetails.id,
      })
    }
  }, [rideDetails])
  

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Black}}>
    <GestureHandlerRootView style={styles.container}>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 20,
          left: 10,
          zIndex: 100,
        }}
        onPress={() => navigation.navigate('Main')}>
        <Ionicons name="chevron-back-circle" size={32} color={Gold} />
      </TouchableOpacity>


      <MapView
        style={styles.map}
        showsCompass={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude: pickupLocation?.lat, longitude: pickupLocation?.lng }} />
        <Marker coordinate={{
          latitude: destinationLocation?.lat, longitude: destinationLocation?.lng
        }} />

        <MapViewDirections
          origin={pickupCoord}
          destination={destinationCoord}
          apikey='AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I'
          strokeColor="#fff"
          strokeWidth={4}
        />

      </MapView>


      <BottomSheet
        ref={bottomSheetRef}
        index={1} // start hidden
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleIndicatorStyle={{ backgroundColor: Gold }}
        backgroundStyle={{ backgroundColor: Black }}>
        <BottomSheetView style={styles.contentContainer}>
          {mode === 'first' && (
            <>
              {/* <View style={{maxHeight: screenHeight * 0.25}}> */}

              <ScrollView style={{ maxHeight: '100%' }}>
                {ridePrices.map((item: any) => (
                  <TouchableOpacity
                    key={item.vehicleId}
                    onPress={() => setselctedRide(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      borderColor: Gold,
                      borderWidth: item.vehicleId === selctedRide?.vehicleId ? 3 : 1,
                      borderRadius: 8,
                      paddingVertical: item.vehicleId === selctedRide?.vehicleId ? 15 : 12,
                      paddingHorizontal: 10,
                      marginBottom: 10,
                    }}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}>
                      <Ionicons name="bicycle" size={30} color="green" />
                      <View>
                        <Text
                          style={{
                            color: LightGold,
                            fontSize: 14,
                            fontWeight: '500',
                          }}>
                          {item.vehicleType === 'bike' ? 'Bike' : item.vehicleType === 'car' ? 'Car' : item.vehicleType === 'bikeWithExtraDriver' ? 'Bike + Driver' : item.vehicleType === 'carWithExtraDriver' ? 'Car + Driver' : ''}
                        </Text>
                        <Text style={{ color: Gray, fontSize: 12, flexShrink: 1, flexWrap: 'wrap' }}>
                          {item.description.substr(0, 45)}..
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                      ${item.price}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: Gold,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                    }}>
                    <Ionicons name="bicycle" size={30} color="green" />
                    <View>
                      <Text
                        style={{
                          color: LightGold,
                          fontSize: 14,
                          fontWeight: '500',
                        }}>
                        Bike
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Quick Bike Rides
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        10 min away
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                    $20
                  </Text>
                </View> */}
                {/* <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: Gold,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                    }}>
                    <Ionicons name="car" size={30} color="green" />
                    <View>
                      <Text
                        style={{
                          color: LightGold,
                          fontSize: 14,
                          fontWeight: '500',
                        }}>
                        Cab Economy
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Quick Car Rides
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        8 min away
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                    $30
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: Gold,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                    }}>
                    <Ionicons name="car-sport" size={30} color="green" />
                    <View>
                      <Text
                        style={{
                          color: LightGold,
                          fontSize: 14,
                          fontWeight: '500',
                        }}>
                        Cab Premium
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Premium car Rides
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        10 min away
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                    $40
                  </Text>
                </View> */}
                {/* <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    borderColor: Gold,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                    }}>
                    <Ionicons name="car-sport" size={30} color="green" />
                    <View>
                      <Text
                        style={{ color: LightGold, fontSize: 14, fontWeight: '500' }}>
                        Cab Premium
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Premium car Rides
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>10 min away</Text>
                    </View>
                  </View>
                  <Text style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                    $40
                  </Text>
                </View> */}
              </ScrollView>
              {/* </View> */}
              <View
                style={{
                  borderTopColor: White,
                  borderWidth: 3,
                  borderRadius: 8,
                  marginTop: 10,
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    paddingVertical: 10,
                  }}>
                  <View
                    style={{
                      width: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 10,
                      borderRightColor: White,
                      borderRightWidth: 3,
                    }}>
                    <Ionicons name="cash-outline" size={30} color="green" />
                    <Text
                      style={{
                        color: LightGold,
                        fontSize: 14,
                        fontWeight: '700',
                      }}>
                      Cash
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 10,
                      paddingStart: 10,
                    }}>
                    <Ionicons name="cash-outline" size={30} color="green" />
                    <Text
                      style={{
                        color: LightGold,
                        fontSize: 14,
                        fontWeight: '700',
                      }}>
                      Offers
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: Gold,
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 10,
                  }}
                  onPress={handleBookButton}
                >
                  <Text
                    style={{
                      color: White,
                      fontSize: 14,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}>
                    Book Now
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {mode === 'second' && (
            <>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  borderBlockColor: Gold,
                  borderBottomWidth: 3,
                  paddingBottom: 10,
                }}>
                <View>
                  <Text style={{ color: Gold, fontSize: 14, fontWeight: 500 }}>
                    Looking for your
                  </Text>
                  <Text style={{ color: Gold, fontSize: 16, fontWeight: '700' }}>
                    Ride
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: Gold,
                    borderRadius: 16,
                    padding: 10,
                  }}
                  onPress={() => setmode('third')}>
                  <Text>Trip Details</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={require('../assets/images/search.jpg')}
                style={{
                  height: 250,
                  width: '100%',
                  marginTop: 10,
                  borderRadius: 16,
                }}
              />
            </>
          )}

          {mode === 'third' && (
            <>
              {/* <View style={{display: 'flex', flexDirection: 'row', gap: 30, alignItems: 'center', borderBottomColor: Gold, borderBottomWidth: 3, paddingBottom: 10}}>
                <Ionicons name='bicycle' size={44} color="green" />
                <View>
                    <Text style={{color: Gold, fontSize: 14, fontWeight: 500}}>
                    Looking for your
                  </Text>
                  <Text style={{color: Gold, fontSize: 16, fontWeight: '700'}}>
                    Ride
                  </Text>
                </View>
              </View> */}
              <View style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', paddingBottom: 10 }}>
                <TouchableOpacity onPress={() => setmode('second')}>
                  <Ionicons name='chevron-back' size={24} color={Gold} />

                </TouchableOpacity>
                <Text style={{ color: Gold, fontSize: 18, fontWeight: 700 }}>
                  Location Details
                </Text>
              </View>
              <View
                style={{
                  borderColor: Gold,
                  borderWidth: 3,
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 10,
                  gap: 10,
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'center',
                  }}>
                  <View style={{ gap: 10 }}>
                    <Ionicons name="location" size={20} color="green" />
                  </View>
                  <View>
                    <View>
                      <Text
                        style={{ color: Gold, fontSize: 14, fontWeight: 700 }}>
                        FZ5
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Chandigarh, India
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'center',
                  }}>
                  <View style={{ gap: 10 }}>
                    <Ionicons name="location" size={20} color="red" />
                  </View>
                  <View>
                    <View>
                      <Text
                        style={{ color: Gold, fontSize: 14, fontWeight: 700 }}>
                        FZ5
                      </Text>
                      <Text style={{ color: Gray, fontSize: 12 }}>
                        Chandigarh, India
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Text style={{ color: Gold, fontSize: 18, fontWeight: 700 }}>
                  Total
                </Text>
                <Text style={{ color: Gold, fontSize: 18, fontWeight: 700 }}>
                  $40
                </Text>
              </View>
              <View style={{ borderBottomColor: Gold, borderWidth: 3, borderRadius: 10, marginTop: 10 }}></View>
              <TouchableOpacity
                style={{
                  backgroundColor: Gold,
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    color: White,
                    fontSize: 14,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                  Book Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#8B3A3A',
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 10,
                }}
                onPress={() => setmode('first')}
              >
                <Text
                  style={{
                    color: White,
                    fontSize: 14,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                  Cancel Ride
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    // alignItems: 'start',
    backgroundColor: Black,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
