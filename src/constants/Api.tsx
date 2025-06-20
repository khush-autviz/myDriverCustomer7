import axios from '../lib/axios';

// signin
export const authSignin = async (data:any) => {
    const response = await axios.post('/auth/signin', data)
    return response
}

// verify otp
export const verifyOtp = async (data:any) => {
    const response = await axios.post('/auth/verifyOTP', data)
    return response
}

// register
export const authSignup = async (data:any) => {
    const response = await axios.post('/auth/register', data)
    return response
}

// get profile
export const getProfile = async () => {
    const response = await axios.get('/user/profile')
    return response
}

// edit profile
export const editProfile = async (data: any) => {
    const response = await axios.put('/user/profile/edit', data
        , {
        headers: {
            'Content-Type': 'multipart/form-data',
        }}
)
    return response
}

// ride price
export const calculateRidePrice = async (data: any) => {
    const response = await axios.post('/vehicle/calculate-prices', data)
    return response
}

// create ride
export const CreateRide = async (data: any) => {
    const response = await axios.post('/ride/create', data)
    return response 
}

// get ride history
export const getRideHistory = async () => {
    const response = await axios.get(`/ride`)
    return response
}

// get ride details
export const getRideDetails = async (rideId: any) => {
    const response = await axios.get(`/ride/${rideId}`)
    return response
}

//ride cancel
export const cancelRide = async (rideId: any, data: any) => {
    const response = await axios.put(`/ride-status/customer/cancel/${rideId}`, data)
    return response
}

// rating ride
export const ratingRide = async (data: any, rideId: any) => {
    const response = await axios.post(`/rating/ride/${rideId}`, data)
    return response
}