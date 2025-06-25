import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Black, Gold, Gray, White, DarkGray, LightGold } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { format } from 'date-fns';

export default function RideDetails() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { ride } = route.params;

  // const formatDate = (dateString: string) => {
  //   return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Status and Date */}
          <View style={styles.section}>
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: ride?.status === 'completed' ? 
                    'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
                ]}>
                  <Text style={[
                    styles.status,
                    { color: ride?.status === 'completed' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {ride.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {new Date(ride.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} • {new Date(ride.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationAddress}>{ride.pickupLocation.address}</Text>
                </View>
              </View>
              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color="#F44336" />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>Drop-off</Text>
                  <Text style={styles.locationAddress}>{ride.destination.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Details */}
          {ride?.driver && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Details</Text>
              <View style={styles.driverContainer}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>
                    {ride?.driver?.firstName} {ride?.driver?.lastName}
                  </Text>
                  <Text style={styles.vehicleInfo}>
                    {ride?.driver?.vehicleDetails?.brand} {ride?.driver?.vehicleDetails?.model} • {ride?.driver?.vehicleDetails?.color}
                  </Text>
                  <Text style={styles.licensePlate}>
                    {ride?.driver?.vehicleDetails?.licensePlate}
                  </Text>
                </View>
                <View style={styles.driverContact}>
                  <Text style={styles.driverPhone}>{ride?.driver?.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Fare Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Details</Text>
            <View style={styles.fareContainer}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Distance</Text>
                <Text style={styles.fareValue}>{ride.distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Price per km</Text>
                <Text style={styles.fareValue}>R{ride.vehicle.pricePerKm}</Text>
              </View>
              <View style={styles.fareDivider} />
              <View style={styles.fareRow}>
                <Text style={styles.totalLabel}>Total Fare</Text>
                <Text style={styles.totalValue}>R{ride.fare.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Action Button */}
        {(ride.status === 'completed' && ride.rating === null) && (
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.ratingButton}
              onPress={() => navigation.navigate('Ratings', { rideId: ride.id })}
            >
              <Ionicons name="star" size={20} color={Black} />
              <Text style={styles.ratingButtonText}>Rate your ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    color: Gray,
    fontSize: 14,
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    color: Gray,
    fontSize: 14,
    marginBottom: 4,
  },
  locationAddress: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
  },
  driverContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleInfo: {
    color: Gray,
    fontSize: 14,
    marginBottom: 4,
  },
  licensePlate: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
  },
  driverContact: {
    alignItems: 'flex-end',
  },
  driverPhone: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
  },
  fareContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareLabel: {
    color: Gray,
    fontSize: 14,
  },
  fareValue: {
    color: White,
    fontSize: 14,
    fontWeight: '500',
  },
  fareDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  totalLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingButton: {
    backgroundColor: Gold,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});