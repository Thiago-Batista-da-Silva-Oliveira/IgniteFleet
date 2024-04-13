import { reverseGeocodeAsync} from 'expo-location';

type Props = {
  latitude: number;
  longitude: number;
};

export async function getAddressLocation({
    latitude,
    longitude
}: Props) {
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