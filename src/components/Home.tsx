import React, { use, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {
  Black,
  DarkGray,
  Gold,
  Gray,
  LightGold,
  White,
} from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from '../context/LocationProvider';
import { ShowToast } from '../lib/Toast';

export default function Home() {
  const navigation: any = useNavigation();
  const { user } = useAuthStore()
  const { location } = useLocation()

  console.log('location', location);

  const handleSearch = () => {
    if (!location) {
      ShowToast('Please enable location services to continue',
        {type: 'error',}
      );
      return;
    }
    navigation.navigate('Location');
  }

  const logAllLocalStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allItems = await AsyncStorage.multiGet(allKeys);

      console.log('📦 AsyncStorage contents:');
      allItems.forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
    } catch (error) {
      console.error('❌ Error reading AsyncStorage:', error);
    }
  };

  // Call this function wherever appropriate
  useEffect(() => {
    logAllLocalStorage();
  }, []);


  return (
    <>
      <StatusBar backgroundColor={Black} barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello there,</Text>
            <Text style={styles.userName}>{user?.firstName}</Text>
          </View>
          {/* <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={24} color={Gold} />
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={24}
            color={Gray}
            style={{ paddingStart: 10 }}
          />
          <TouchableOpacity
            style={styles.searchInput}
            onPress={handleSearch}
          >
            <Text style={styles.searchText}>
              Where would you like to go?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {[
              { icon: 'home', label: 'Home' },
              { icon: 'briefcase', label: 'Work' },
              { icon: 'heart', label: 'Saved' },
              { icon: 'time', label: 'Recent' },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.actionButton}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name={item.icon} size={22} color={Gold} />
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Promo Card */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>40% off Rides</Text>
            <Text style={styles.promoSubtitle}>Limited time offer!</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Book now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoImageContainer}>
            {/* You can add an actual image here */}
            <View style={styles.promoImagePlaceholder}>
              <Ionicons name="car-sport" size={40} color={Black} />
            </View>
          </View>
        </View>

        {/* Updates Card */}
        <View style={styles.updatesCard}>
          <View style={styles.updatesContent}>
            <Text style={styles.updatesTitle}>Future Updates</Text>
            <Text style={styles.updatesSubtitle}>Coming soon!</Text>
            <TouchableOpacity style={styles.updatesButton}>
              <Text style={styles.updatesButtonText}>Learn more</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.updatesImageContainer}>
            {/* You can add an actual image here */}
            <View style={styles.updatesImagePlaceholder}>
              <Ionicons name="notifications" size={40} color={Black} />
            </View>
          </View>
        </View>

        {/* Recent Trips */}
        {/* <View style={styles.recentTrips}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <TouchableOpacity style={styles.tripItem}>
            <View style={styles.tripIconContainer}>
              <Ionicons name="time" size={24} color={Gold} />
            </View>
            <View style={styles.tripDetails}>
              <Text style={styles.tripDestination}>Downtown Mall</Text>
              <Text style={styles.tripDate}>Yesterday, 3:30 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Gold} />
          </TouchableOpacity>
        </View> */}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: {
    color: Gray,
    fontSize: 16,
  },
  userName: {
    color: White,
    fontSize: 22,
    fontWeight: '700',
  },
  profileIcon: {
    backgroundColor: DarkGray,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: DarkGray,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    height: 55,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  searchText: {
    color: Gray,
    paddingHorizontal: 10,
  },
  quickActions: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: LightGold,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    backgroundColor: DarkGray,
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: White,
    fontSize: 12,
  },
  promoCard: {
    backgroundColor: '#ffdcd1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 2,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Black,
  },
  promoSubtitle: {
    fontSize: 16,
    color: Black,
    opacity: 0.8,
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: Black,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: LightGold,
    fontWeight: '600',
  },
  promoImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatesCard: {
    backgroundColor: '#d1ffbd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  updatesContent: {
    flex: 2,
  },
  updatesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Black,
  },
  updatesSubtitle: {
    fontSize: 16,
    color: Black,
    opacity: 0.8,
    marginBottom: 15,
  },
  updatesButton: {
    backgroundColor: Black,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  updatesButtonText: {
    color: LightGold,
    fontWeight: '600',
  },
  updatesImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatesImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTrips: {
    marginBottom: 20,
  },
  tripItem: {
    backgroundColor: DarkGray,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tripDetails: {
    flex: 1,
  },
  tripDestination: {
    color: White,
    fontSize: 16,
    fontWeight: '500',
  },
  tripDate: {
    color: Gray,
    fontSize: 12,
    marginTop: 3,
  },
});