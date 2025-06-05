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



import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, Gray, Gold, LightGold, White, DarkGray } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useQuery } from '@tanstack/react-query'
import { getRideHistory } from '../constants/Api'
import { useNavigation } from '@react-navigation/native'

export default function Activity() {
  const navigation: any = useNavigation();
  const [data, setData] = useState([]);

  // fetches all rides
  const {data: rideHistory, isLoading} = useQuery({
    queryKey: ['ride-history'],
    queryFn: getRideHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (rideHistory?.data?.data?.rides) {
      console.log("ride details",rideHistory.data.data.rides);
      setData(rideHistory.data.data.rides);
    }
  }, [rideHistory]);

  // Calculate total rides and earnings
  const totalRides = data.length;
  const totalEarnings = data.reduce((sum: number, ride: any) => 
    sum + (parseFloat(ride.price) || 0), 0).toFixed(2);

  const renderRideItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
    >
      {/* <View style={styles.activityIconContainer}>
        <Ionicons name="car" size={20} color={Gold} />
      </View> */}
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>
          {item.destination?.address ? 
            `Trip to ${item.destination.address}` : 
            'Ride'}
        </Text>
        <Text style={styles.activityDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })} • {new Date(item.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <View style={styles.activityAmount}>
        <Text style={styles.amountText}>${item.fare || '0.00'}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { 
            backgroundColor: item.status === 'completed' ? '#4CAF50' : Gold 
          }]} />
          <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="car-outline" size={60} color={Gold} />
      </View>
      <Text style={styles.emptyStateTitle}>No Rides Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Your completed rides will appear here. Book a ride to get started.
      </Text>
      {/* <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyStateButtonText}>Book a Ride</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        {/* <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={Gold} />
        </TouchableOpacity> */}
      </View>

      {/* Activity Summary Card */}
      {/* <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Rides</Text>
          <Text style={styles.summaryValue}>{totalRides}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>${totalEarnings}</Text>
        </View>
      </View> */}

      {/* Activity List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Gold} />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      ) : data && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderRideItem}
          contentContainerStyle={styles.activityListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: LightGold,
    fontSize: 32,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 10,
  },
  summaryLabel: {
    color: Gray,
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    color: Gold,
    fontSize: 24,
    fontWeight: '700',
  },
  activityListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: White,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    color: Gray,
    fontSize: 14,
  },
  activityAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: Gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
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
    color: Gray,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: Gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Gray,
    marginTop: 12,
    fontSize: 16,
  },
})