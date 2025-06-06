import { Dimensions, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Black, Gold, Gray, LightGold, White } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { LocationContext } from '../context/LocationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import MapViewDirections from 'react-native-maps-directions';
import { useSocket } from '../context/SocketContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { calculateRidePrice, cancelRide, CreateRide, getRideDetails } from '../constants/Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShowToast } from '../lib/Toast';
import Modal from 'react-native-modal';

export default function TripDetails() {
  const navigation: any = useNavigation();
  const [mode, setmode] = useState('booking');
  const [modalVisible, setmodalVisible] = useState(false);
  const [ridePrices, setridePrices] = useState([])
  // const [rideDetails, setrideDetails] = useState<any>()
  const [driverDetails, setdriverDetails] = useState<any>()
  const [driverLocation, setdriverLocation] = useState<any>()
  const [selctedRide, setselctedRide] = useState<any>()
  const [rideOtp, setrideOtp] = useState<string>()
  const bottomSheetRef = useRef<BottomSheet>(null);
  const screenHeight = Dimensions.get('window').height;
  const socket = useSocket()

  const { pickupLocation, destinationLocation, setRideId } = useAuthStore();
  const rideId = useAuthStore(state => state.rideId)

  const { location } = useContext(LocationContext)

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const cancelReasons = [
    'Rider not at pickup location',
    'Rider not responding',
    'Vehicle issue or breakdown',
    'Personal emergency',
    'Rider asked to cancel the trip',
  ];

  // get ride details
  const { data: rideInfo, refetch } = useQuery({
    queryKey: ['rideInfo', rideId],
    queryFn: () => getRideDetails(rideId),
    enabled: !!rideId,
    staleTime: 0,
  })

  console.log(rideId, 'rideId new check');


  console.log(rideInfo, 'rideInfo');


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
      setRideId(response.data.data.ride.id)
      // setrideDetails(response.data.data.ride)
      setmode('searchingDriver')
    },
    onError: (error) => {
      console.log('ride created error', error);
      ShowToast(error.message, { type: 'error' });
    },
  })

  //cancel ride
  const cancelRideMutation = useMutation({
    mutationFn: (data: any) => cancelRide(String(rideId), data),
    onSuccess: (response) => {
      setmodalVisible(false)
      console.log('ride cancelled success', response);
      setRideId(null)
      navigation.navigate('Main')
    },
    onError: (error) => {
      console.log('ride cancelled error', error);
      ShowToast(error.message, { type: 'error' });
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
          address: destinationLocation?.description,
          coordinates: [
            destinationCoord?.latitude, destinationCoord?.longitude,
          ]
        },
        vehicleId: selctedRide.vehicleId,
      }
      CreateRideMutation.mutate(data)
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

  // Socket event handlers
  const handleRideAccepted = useCallback((data: any) => {
    console.log('ride accepted', data.driver);
    refetch();
    setdriverDetails(data.driver);
    setmode('accepted');
  }, [refetch]);

  const handleDriverArrived = useCallback((data: any) => {
    console.log('driver arrived', data);
    setrideOtp(data.rideOtp);
  }, []);

  const handleOtpVerified = useCallback((data: any) => {
    console.log('ride otp verification', data);
    setmode('otp_verified');
  }, []);

  const handleRideCompleted = useCallback((data: any) => {
    console.log('ride completed', data);
    // navigation.replace('Ratings', {rideId: rideId});
    navigation.reset({
      index: 0,
      routes: [{ name: 'Ratings', params: { rideId: rideId } }],
    });
    // setRideId(null)
    // navigation.replace('Main')
  }, [navigation]);

  const handleDriverLocation = useCallback((data: any) => {
    console.log('driver location', data);
    setdriverLocation(data);
  }, []);

  const handleRideCancelled = useCallback((data: any) => {
    console.log('ride cancelled', data);
    setmodalVisible(false);
    setRideId(null);
    ShowToast("Driver cancelled the ride", { type: 'error' });
    setmode('booking');
  }, []);

  const handleNoDriversFound = useCallback((data: any) => {
    console.log('no drivers found logs', data);
    setmode('booking');
    setRideId(null);
    ShowToast("No drivers available", { type: 'error' });
  }, []);

  const handleNearbyDrivers = useCallback((data: any) => {
    console.log('nearby drivers', data);
    // setmode('searchingDriver');
  }, []);

  // socket?.emit('searchNearbyDrivers', {
  //   pickupCoords: pickupCoord
  // });

  // Socket event listeners setup and cleanup
  useEffect(() => {
    if (socket) {
      socket.on('rideAccepted', handleRideAccepted);
      socket.on('driverArrived', handleDriverArrived);
      socket.on('otpVerified', handleOtpVerified);
      socket.on('rideCompleted', handleRideCompleted);
      socket.on('driverLocationUpdate', handleDriverLocation);
      socket.on('rideCancelled', handleRideCancelled);
      socket.on('noDriversAvailable', handleNoDriversFound);
      // socket.on('nearbyDrivers', handleNearbyDrivers);

      return () => {
        socket.off('rideAccepted', handleRideAccepted);
        socket.off('driverArrived', handleDriverArrived);
        socket.off('otpVerified', handleOtpVerified);
        socket.off('rideCompleted', handleRideCompleted);
        socket.off('driverLocationUpdate', handleDriverLocation);
        socket.off('rideCancelled', handleRideCancelled);
        socket.off('noDriversAvailable', handleNoDriversFound);
        // socket.off('nearbyDrivers', handleNearbyDrivers);
      };
    }
  }, [socket, handleRideAccepted, handleDriverArrived, handleOtpVerified,
    handleRideCompleted, handleDriverLocation, handleRideCancelled]);

  // Fix marker coordinates type issue
  const markerCoordinates = useMemo(() => ({
    pickup: pickupLocation?.lat && pickupLocation?.lng ? {
      latitude: pickupLocation.lat,
      longitude: pickupLocation.lng
    } : null,
    destination: destinationLocation?.lat && destinationLocation?.lng ? {
      latitude: destinationLocation.lat,
      longitude: destinationLocation.lng
    } : null
  }), [pickupLocation, destinationLocation]);

  useEffect(() => {
    if (rideInfo?.data?.data?.ride?.status && rideInfo?.data?.data?.ride?.status !== 'cancelled' && rideInfo?.data?.data?.ride?.status !== 'searchingDriver') {
      console.log(rideInfo?.data?.data?.ride?.status, 'rideInfo?.data?.data?.ride?.status');
      setmode(rideInfo?.data?.data?.ride?.status)
    }

     if (rideInfo?.data?.data?.ride?.status === 'completed') {
      setmode('booking')
    }

    if (rideInfo?.data?.data?.ride?.rideOtp) {
      setrideOtp(rideInfo?.data?.data?.ride?.rideOtp)
    }
  }, [rideInfo])

  useEffect(() => {

    refetch()

  }, [])

  console.log(mode, 'mode');
  


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Black }}>
      <GestureHandlerRootView style={styles.container}>
        { (mode === 'searchingDriver' || mode === 'booking' || mode === 'noDriversFound') && (
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
        )}

        {/* Cancel Ride Modal */}
        <Modal
          isVisible={modalVisible}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.7}
          onBackdropPress={() => setmodalVisible(false)}
          style={styles.modal}
          statusBarTranslucent
          useNativeDriver
          hideModalContentWhileAnimating
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              {/* <View style={styles.modalIndicator} /> */}
              <Text style={styles.modalTitle}>Cancel Ride</Text>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Please select a reason for cancellation:
              </Text>

              <FlatList
                data={cancelReasons}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.reasonButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      cancelRideMutation.mutate({
                        id: rideId,
                        payload: { reason: item }
                      });
                    }}
                  >
                    <Text style={styles.reasonText}>{item}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Gold} />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.reasonsList}
              />
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => setmodalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <MapView
          style={styles.map}
          showsCompass={false}
          initialRegion={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {markerCoordinates.pickup && (
            <Marker coordinate={markerCoordinates.pickup}>
              <Image source={require('../assets/logo/pickup.png')} style={{ width: 40, height: 40 }} />
            </Marker>
          )}
          {markerCoordinates.destination && (
            <Marker coordinate={markerCoordinates.destination}>
              <Image source={require('../assets/logo/destination.png')} style={{ width: 35, height: 35 }} />
            </Marker>
          )}

          <MapViewDirections
            origin={pickupCoord}
            destination={destinationCoord}
            apikey='AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I'
            strokeColor={Gold}
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
            {(mode === 'booking' || mode === "noDriversFound") && (
              <>
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
                        }}>{item.vehicleType.includes('bike') ?
                          <Image source={require('../assets/logo/motorcycle.png')} style={{ width: 35, height: 35 }} /> : <Image source={require('../assets/logo/car.png')} style={{ width: 35, height: 35 }} />}
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
                            {item.description.substr(0, 30)}..
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ color: LightGold, fontSize: 14, fontWeight: '700' }}>
                        ${item.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {/* </View> */}
                <View
                  style={{
                    borderTopColor: White,
                    borderWidth: 3,
                    borderRadius: 8,
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: Gold,
                      borderRadius: 8,
                      padding: 15,
                      marginTop: 10,
                    }}
                    onPress={handleBookButton}
                    disabled={CreateRideMutation.isPending}
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
            {mode === 'searchingDriver' && (
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
                      backgroundColor: '#8B3A3A',
                      borderRadius: 8,
                      padding: 10,
                    }}
                    onPress={() => setmodalVisible(true)}>
                    <Text style={{ color: White, fontSize: 14, fontWeight: '700' }}>Cancel Ride</Text>
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

            {(mode === 'accepted' || mode === 'arrived') && (
              <View style={{ flex: 1 }}>
                {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={() => setmode('second')}>
                    <Ionicons name='chevron-back' size={24} color={Gold} />
                  </TouchableOpacity>
                  <Text style={{ color: Gold, fontSize: 24, fontWeight: '600', marginLeft: 10 }}>
                    Trip Details
                  </Text>
                </View> */}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* Driver Details Card */}
                  <View style={{
                    borderColor: Gold,
                    borderWidth: 1,
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 15,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 24,
                          backgroundColor: 'rgba(255, 215, 0, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12
                        }}>
                          <Ionicons name="person" size={20} color={Gold} />
                        </View>
                        <Text style={{ color: Gold, fontSize: 16, fontWeight: '600' }}>
                          {rideInfo?.data?.data?.ride?.driver?.firstName ?? driverDetails?.firstName} {rideInfo?.data?.data?.ride?.driver?.lastName ?? driverDetails?.lastName}
                        </Text>
                      </View>
                      {rideOtp && (
                        <View style={{ backgroundColor: 'rgba(255, 107, 107, 0.4)', padding: 5, borderRadius: 10, marginLeft: 20, }}>
                          <Text style={{ color: LightGold, fontSize: 16, fontWeight: '500' }}>
                            OTP:  {rideOtp}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="car" size={20} color={Gold} style={{ marginRight: 8 }} />
                      <Text style={{ color: Gold, fontSize: 14, fontWeight: '500' }}>
                        {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.brand ?? driverDetails?.vehicleDetails?.brand} {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.model ?? driverDetails?.vehicleDetails?.model} • {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.licensePlate ?? driverDetails?.vehicleDetails?.licensePlate}
                      </Text>
                    </View> 
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="call" size={20} color={Gold} style={{ marginRight: 8 }} />
                      <Text style={{ color: Gold, fontSize: 14, fontWeight: '500' }}>
                        {rideInfo?.data?.data?.ride?.driver?.phone ?? driverDetails?.phone}
                      </Text>
                    </View>
                  </View>

                  {/* Ride Status */}
                  {/* <TouchableOpacity style={{
                    backgroundColor: Gold,
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 15,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: Black, fontSize: 18, fontWeight: '600' }}>
                      {rideInfo?.data?.data?.ride?.status?.toUpperCase()}
                    </Text>
                  </TouchableOpacity> */}

                  {/* Location Details */}
                  <View style={{
                    borderColor: Gold,
                    borderWidth: 1,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ marginRight: 12, marginTop: 4 }}>
                        <Ionicons name="location" size={20} color="green" />
                      </View>
                      <Text style={{ color: LightGold, fontSize: 14, flex: 1, lineHeight: 22 }}>
                        {rideInfo?.data?.data?.ride?.pickupLocation?.address}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ marginRight: 12, marginTop: 4 }}>
                        <Ionicons name="location" size={20} color="red" />
                      </View>
                      <Text style={{ color: LightGold, fontSize: 14, flex: 1, lineHeight: 22 }}>
                        {rideInfo?.data?.data?.ride?.destination?.address}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#8B3A3A',
                    borderRadius: 8,
                    padding: 16,
                    marginTop: 'auto',
                    marginBottom: 20
                  }}
                  onPress={() => setmodalVisible(true)}
                >
                  <Text style={{
                    color: White,
                    fontSize: 18,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Cancel Ride
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {(mode === 'otp_verified' || mode === 'in_progress') && (
              <View style={{ flex: 1 }}>
                {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setmode('second')}>
                  <Ionicons name='chevron-back' size={24} color={Gold} />
                </TouchableOpacity>
                <Text style={{ color: Gold, fontSize: 24, fontWeight: '600', marginLeft: 10 }}>
                  Trip Details
                </Text>
              </View> */}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                <View style={styles.tripStatusContainer}>
                    <View style={styles.statusItem}>
                      <Ionicons name="time-outline" size={20} color={Gold} />
                      <Text style={styles.statusText}>Trip in progress</Text>
                    </View>
                  </View>
                  {/* Driver Details Card */}
                  <View style={{
                    borderColor: Gold,
                    borderWidth: 1,
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 15,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 24,
                          backgroundColor: 'rgba(255, 215, 0, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12
                        }}>
                          <Ionicons name="person" size={20} color={Gold} />
                        </View>
                        <Text style={{ color: Gold, fontSize: 16, fontWeight: '600' }}>
                          {rideInfo?.data?.data?.ride?.driver?.firstName} {rideInfo?.data?.data?.ride?.driver?.lastName}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="car" size={20} color={Gold} style={{ marginRight: 8 }} />
                      <Text style={{ color: Gold, fontSize: 14, fontWeight: '500' }}>
                        {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.brand} {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.model} • {rideInfo?.data?.data?.ride?.driver?.vehicleDetails?.licensePlate}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="call" size={20} color={Gold} style={{ marginRight: 8 }} />
                      <Text style={{ color: Gold, fontSize: 14, fontWeight: '500' }}>
                        {rideInfo?.data?.data?.ride?.driver?.phone}
                      </Text>
                    </View>
                  </View>

                  {/* Location Details */}
                  <View style={{
                    borderColor: Gold,
                    borderWidth: 1,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ marginRight: 12, marginTop: 4 }}>
                        <Ionicons name="location" size={20} color="green" />
                      </View>
                      <Text style={{ color: LightGold, fontSize: 14, flex: 1, lineHeight: 22 }}>
                        {rideInfo?.data?.data?.ride?.pickupLocation?.address}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ marginRight: 12, marginTop: 4 }}>
                        <Ionicons name="location" size={20} color="red" />
                      </View>
                      <Text style={{ color: LightGold, fontSize: 14, flex: 1, lineHeight: 22 }}>
                        {rideInfo?.data?.data?.ride?.destination?.address}
                      </Text>
                    </View>
                  </View>
                  {/* <View style={styles.tripStatusContainer}>
                    <View style={styles.statusItem}>
                      <Ionicons name="time-outline" size={20} color={Gold} />
                      <Text style={styles.statusText}>Trip in progress</Text>
                    </View>
                  </View> */}
                </ScrollView>

              </View>
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
  // Modal Styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Extra padding for iOS devices with home indicator
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: Gray,
    borderRadius: 3,
    marginBottom: 12,
  },
  modalTitle: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalDescription: {
    color: White,
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  reasonsList: {
    paddingBottom: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  reasonText: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelButton: {
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10
  },
  cancelButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
  },


  // OTP Section Styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  otpInput: {
    borderColor: Gold,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    width: '60%',
    color: White,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: Gold,
    borderRadius: 10,
    padding: 12,
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  verifyButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Trip Details Card Styles
  tripDetailsCard: {
    borderColor: Gold,
    borderWidth: 2,
    padding: 8,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationTitle: {
    color: Gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationSubtitle: {
    color: LightGold,
    fontSize: 14,
    flexWrap: 'wrap',
    width: '55%',
    // marginRight: 10,
  },

  // Cancel Button Styles
  cancelRideButton: {
    backgroundColor: '#8B3A3A',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cancelRideButtonText: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
  },

  tripStatusContainer: {
    // marginTop: 10,
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  statusText: {
    color: White,
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
});
