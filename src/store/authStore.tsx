// import { create } from 'zustand';
// import { persist, PersistOptions } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Define a proper User type
// // interface User {
// //   id: string;
// //   firstName?: string;
// //   lastName?: string;
// //   email?: string;
// //   phone?: string;
// // }

// type User = Record<string, any>;

// interface Token {
//   access_token?: string;
//   refresh_token?: string;
// }

// // Define the state interface (only the data we want to persist)
// interface AuthStateData {
//   user: User | null;
//   token: Token | null;
// }

// // Define the full state interface including methods
// interface AuthState extends AuthStateData {
//   setUser: (user: User) => void;
//   setToken: (token: Token) => void;
//   logout: () => void;
// }

// type AuthStorePersist = PersistOptions<AuthState, AuthStateData>

// const persistConfig: AuthStorePersist = {
//   name: 'auth-storage',
//   storage: {
//     getItem: async (name) => {
//       const value = await AsyncStorage.getItem(name);
//       return value ? JSON.parse(value) : null;
//     },
//     setItem: async (name, value) => {
//       await AsyncStorage.setItem(name, JSON.stringify(value));
//     },
//     removeItem: async (name) => {
//       await AsyncStorage.removeItem(name);
//     },
//   },
//   partialize: (state) => ({
//     user: state.user,
//     token: state.token,
//   }),
// };

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       token: null,
//       setUser: (user) => set({ user }),
//       setToken: (token) => set({ token }),
//       logout: () => set({ user: null, token: null }),
//     }),
//     persistConfig
//   )
// );



import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
type User = Record<string, any>;
interface Token {
  access_token?: string;
  refresh_token?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
  description: string;
}

// Data that will be persisted
interface AuthStateData {
  user: User | null;
  token: Token | null;
  rideId: string | null;
  pickupLocation: Coordinates | null;
  destinationLocation: Coordinates | null;
}

// Full Zustand state including methods
interface AuthState extends AuthStateData {
  setUser: (user: User) => void;
  setToken: (token: Token) => void;
  setRideId: (rideId: string) => void;
  setPickupLocation: (location: Coordinates) => void;
  setDestinationLocation: (location: Coordinates) => void;
  clearLocations: () => void;
  logout: () => void;
}

type AuthStorePersist = PersistOptions<AuthState, AuthStateData>;

const persistConfig: AuthStorePersist = {
  name: 'auth-storage',
  storage: {
    getItem: async (name) => {
      const value = await AsyncStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    },
    setItem: async (name, value) => {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: async (name) => {
      await AsyncStorage.removeItem(name);
    },
  },
  partialize: (state) => ({
    user: state.user,
    token: state.token,
    rideId: state.rideId,
    pickupLocation: state.pickupLocation,
    destinationLocation: state.destinationLocation,
  }),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rideId: null,
      pickupLocation: null,
      destinationLocation: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRideId: (rideId) => set({ rideId }),
      setPickupLocation: (location) => set({ pickupLocation: location }),
      setDestinationLocation: (location) => set({ destinationLocation: location }),
      clearLocations: () => set({ pickupLocation: null, destinationLocation: null }),
      logout: () =>
        set({
          user: null,
          token: null,
          pickupLocation: null,
          destinationLocation: null,
        }),
    }),
    persistConfig
  )
);
