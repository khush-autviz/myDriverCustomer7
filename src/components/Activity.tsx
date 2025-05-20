// import { StyleSheet, Text, View } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { Black, Gray, LightGold, White } from '../constants/Color'
// import Ionicons from 'react-native-vector-icons/Ionicons'
// import { useQuery } from '@tanstack/react-query'
// import { getRide } from '../constants/Api'

// export default function Activity() {

//   const [data, setdata] = useState([])

//   // fetches all rides
//   const rideDetails = useQuery({
//     queryKey: ['ride-details'],
//     queryFn: getRide,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: true,
//   })

//   useEffect(() => {
//     if (rideDetails) {
//       console.log("ride details",rideDetails);
      
//       // setdata(rideDetails.data.data.rides)
//     }

//   }, [rideDetails]);


//   return (
//     <SafeAreaView style={{backgroundColor: Black, flex: 1, paddingHorizontal:20, paddingTop: 10}}>
//       <Text style={{color: LightGold, fontSize: 32, fontWeight: '700'}}>Activity</Text>
//       <View style={{marginTop: 20, display: 'flex', flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
//         <Text style={{color: LightGold, fontSize: 20, fontWeight: '700'}}>Past</Text>
//         <Ionicons name='filter' size={20} color={LightGold} />
//       </View>
//       <Text style={{color: Gray, textAlign: 'center', fontSize: 16, marginTop: 20}}>You do not have any recent activity</Text>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({})



import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useQuery } from '@tanstack/react-query'
import { getRide } from '../constants/Api'
import { useNavigation } from '@react-navigation/native'
import Loader from './Loader'

export default function Activity() {
  const navigation: any = useNavigation();
  const [data, setData] = useState([]);

  // fetches all rides
  const rideDetails = useQuery({
    queryKey: ['ride-details'],
    queryFn: getRide,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (rideDetails.data?.data?.rides) {
      setData(rideDetails.data.data.rides);
    }
  }, [rideDetails.data]);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="car-outline" size={60} color={Gray} />
      </View>
      <Text style={styles.emptyStateTitle}>No rides yet</Text>
      <Text style={styles.emptyStateText}>
        You don't have any past rides to display
      </Text>
      <TouchableOpacity 
        style={styles.bookRideButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.bookRideButtonText}>Book a ride</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRideItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.rideItem}
      onPress={() => navigation.navigate('TripDetails', { rideId: item.id })}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideIconContainer}>
          <Ionicons name="car" size={24} color={Gold} />
        </View>
        <View style={styles.rideInfo}>
          <Text style={styles.rideDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.rideTime}>
            {new Date(item.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={styles.ridePrice}>${item.price || '0.00'}</Text>
      </View>
      
      <View style={styles.ridePath}>
        <View style={styles.locationMarkers}>
          <View style={styles.startDot} />
          <View style={styles.pathLine} />
          <View style={styles.endDot} />
        </View>
        <View style={styles.locationDetails}>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup?.address || 'Pickup location'}
          </Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.destination?.address || 'Destination location'}
          </Text>
        </View>
      </View>
      
      <View style={styles.rideFooter}>
        <View style={styles.rideStatus}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? '#4CAF50' : Gold }]} />
          <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={Gold} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>
      
      <View style={styles.filterRow}>
        <Text style={styles.sectionTitle}>Past Rides</Text>
        {/* <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={LightGold} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity> */}
      </View>
      
      {rideDetails.isLoading ? (
        // <View style={styles.loadingContainer}>
        //   <ActivityIndicator size="large" color={Gold} />
        //   <Text style={styles.loadingText}>Loading your rides...</Text>
        // </View>
        <Loader />
      ) : data && data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderRideItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    color: LightGold,
    fontSize: 32,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    color: LightGold,
    marginLeft: 5,
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  rideItem: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: Gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rideIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rideDate: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
  },
  rideTime: {
    color: Gray,
    fontSize: 14,
  },
  ridePrice: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
  },
  ridePath: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  locationMarkers: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Gold,
  },
  pathLine: {
    width: 2,
    height: 30,
    backgroundColor: Gray,
    marginVertical: 5,
  },
  endDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LightGold,
  },
  locationDetails: {
    flex: 1,
    justifyContent: 'space-between',
    height: 60,
  },
  locationText: {
    color: White,
    fontSize: 14,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  rideStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: White,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyStateText: {
    color: Gray,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
  },
  bookRideButton: {
    backgroundColor: Gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  bookRideButtonText: {
    color: Black,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Gray,
    marginTop: 15,
    fontSize: 16,
  },
});