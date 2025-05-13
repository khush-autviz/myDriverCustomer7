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