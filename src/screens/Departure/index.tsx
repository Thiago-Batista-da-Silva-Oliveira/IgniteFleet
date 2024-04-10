import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { useUser } from '@realm/react';
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Container, Content, Message } from "./styles";
import { useForegroundPermissions,
   watchPositionAsync,
   LocationAccuracy,
   LocationSubscription,
   LocationObjectCoords,
   } from 'expo-location'
import {
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { licensePlateValidate } from "../../utils/licensePlateValidate";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getAddressLocation } from "../../utils/getAddressLocation";
import { Loading } from "../../components/Loading";
import { LocationInfo } from "../../components/LocationInfo";
import { Car } from "phosphor-react-native";
import { Map } from "../../components/Map";

export function Departure() {
  const [description, setDescription] = useState("");
  const [lincesePlate, setLincesePlate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [curretAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LocationObjectCoords | null>(null);
  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions();
  const {goBack} = useNavigation();
  const realm = useRealm();
  const user = useUser();

  const keyboardAvoidingViewBehavior =
    Platform.OS === "ios" ? "position" : "height";
  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  const handleDeparture = () => {
    try {
      if (licensePlateValidate(lincesePlate)) {
        licensePlateRef.current?.focus();
         return Alert.alert("Placa inválida", "Por favor, insira uma placa válida");
      }
  
      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert("Campo obrigatório", "Por favor, insira a finalidade");
      }
      setIsRegistering(true);
      realm.write(() => {
        realm.create("Historic", Historic.generate({
          user_id: user!.id,
          license_plate: lincesePlate.toUpperCase(),
          description,
        }));
      })
      Alert.alert("Saída", "Saída do veículo registrada com sucesso");
      goBack();

    } catch(err: any) {
      console.log(err.message)
      Alert.alert("Erro", "Ocorreu um erro ao registrar a saída");
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    requestLocationForegroundPermission();
  }, [])

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return ;
    };
    let subscription: LocationSubscription;
    watchPositionAsync({
      accuracy: LocationAccuracy.Highest,
      timeInterval: 1000,
    }, (location) => {
      setCurrentCoords(location.coords);
       getAddressLocation(location.coords).then((address) => {
        if (address) {
          setCurrentAddress(address);
        }
       }).finally(( ) => setIsLoadingLocation(false));
    }).then((response) => subscription = response);
   return () => subscription.remove();
  }, [locationForegroundPermission]);

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <Message>
          Você precisa permitir o acesso à localização para utilizar essa funcionalidade.
          Por favor, habilite a permissão de localização nas configurações do seu dispositivo.
        </Message>
      </Container>
    )
  }

  if (isLoadingLocation) {
    return (
      <Loading />
    )
  }

  return (
    <Container>
      <Header title="Saída" />
      <KeyboardAwareScrollView extraHeight={100}
      >
        <ScrollView>
          {
            currentCoords && (
              <Map coordinates={[currentCoords]} />
            )
          }
          <Content>
            {
              curretAddress && (
                <LocationInfo
                  icon={Car}
                  label="Localização atual"
                  description={curretAddress}
                />
              )
            }
            <LicensePlateInput
              ref={licensePlateRef}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              label="Placa do veículo"
              placeholder="BRA1234"
              onChangeText={setLincesePlate}
            />
            <TextAreaInput
              blurOnSubmit
              returnKeyType="send"
              onSubmitEditing={handleDeparture}
              ref={descriptionRef}
              placeholder="Vou utilizar o veículo para..."
              label="Finalidade"
              onChangeText={setDescription}
            />
            <Button isLoading={isRegistering} onPress={handleDeparture} title="Registrar Saída" />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}