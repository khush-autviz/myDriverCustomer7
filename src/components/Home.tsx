import React, {use, useEffect, useState} from 'react';
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
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLocation} from '../context/LocationProvider';
import {ShowToast} from '../lib/Toast';

export default function Home() {
  const navigation: any = useNavigation();
  const {user} = useAuthStore();
  const {location, getCurrentLocation} = useLocation();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Fetch location when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchLocationOnFocus = async () => {
        if (!location) {
          console.log('No location found on Home screen focus, fetching...');
          setIsLoadingLocation(true);
          
          
          try {
            await getCurrentLocation();
          
          } catch (error) {
            console.error('Error fetching location on focus:', error);
            // Show error toast if location fetch fails
            ShowToast('Failed to get location. Please check your location settings.', { type: 'error' });
          } finally {
            setIsLoadingLocation(false);
          }
        }
      };

      fetchLocationOnFocus();
    }, [location, getCurrentLocation]),
  );

  // Debug logging
  console.log('Home component - location:', location);

  const handleSearch = () => {
    console.log('handleSearch called, location:', location);

    if (isLoadingLocation) {
      ShowToast('Please wait, getting your location...', { type: 'info' });
      return;
    }

    if (!location) {
      // ShowToast('Please enable location services to continue', {type: 'error'});
      ShowToast('Please wait, getting your location...', { type: 'info' });
      getCurrentLocation();
      return;
    }
    navigation.navigate('Location');
  };

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
            style={{paddingStart: 10}}
          />
          <TouchableOpacity 
            style={[styles.searchInput, isLoadingLocation && { opacity: 0.6 }]} 
            onPress={handleSearch}
            disabled={isLoadingLocation}
          >
            <Text style={styles.searchText}>
              {isLoadingLocation 
                ? 'Getting your location...' 
                : 'Where would you like to go?'
              }
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
            {/* <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Book now</Text>
            </TouchableOpacity> */}
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
            {/* <TouchableOpacity style={styles.updatesButton}>
              <Text style={styles.updatesButtonText}>Learn more</Text>
            </TouchableOpacity> */}
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
        <View style={{height: 20}} />
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
    color: Gold,
    fontSize: 16,
  },
  userName: {
    color: Gold,
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
