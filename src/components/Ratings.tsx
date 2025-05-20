import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler'

export default function Ratings({ route }: { route: any }) {
  const navigation: any = useNavigation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  // Get ride details from route params if needed
  // const { rideId } = route.params;

  const handleRatingSubmit = () => {
    // Submit rating logic here
    // API call to save rating
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Gold} />
        </TouchableOpacity> */}
        <Text style={styles.headerText}>Rate Your Trip</Text>
        <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} onPress={() => navigation.navigate('Main')}>
          <Text style={{color: Gold, fontSize: 16, fontWeight: '500'}}>Skip</Text>
          <Ionicons name="chevron-forward" size={24} color={Gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>How was your trip?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons 
                name={rating >= star ? "star" : "star-outline"} 
                size={40} 
                color={Gold} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Additional Feedback</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Gray}
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleRatingSubmit}
      >
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-between'
  },
  headerText: {
    color: Gold,
    fontSize: 20,
    fontWeight: '600',
    // paddingLeft: 15,
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  ratingTitle: {
    color: LightGold,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  feedbackContainer: {
    width: '100%',
    marginTop: 20,
  },
  feedbackLabel: {
    color: LightGold,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  feedbackInput: {
    backgroundColor: DarkGray,
    borderRadius: 8,
    borderColor: Gold,
    borderWidth: 1,
    padding: 15,
    color: White,
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Gold,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  submitButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '700',
  }
})