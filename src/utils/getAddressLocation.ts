import { reverseGeocodeAsync, LocationObjectCoords} from 'expo-location';

export async function getAddressLocation({
    latitude,
    longitude
}: LocationObjectCoords) {
  try {
   const addressReponse = await reverseGeocodeAsync({
    latitude,
    longitude,
   })
   return addressReponse[0]?.street;
  } catch(err) {
    console.error(err);
  }
} 