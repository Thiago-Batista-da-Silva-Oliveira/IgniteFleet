import { useRef, useState } from "react";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { useUser } from '@realm/react';
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Container, Content } from "./styles";
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

export function Departure() {
  const [description, setDescription] = useState("");
  const [lincesePlate, setLincesePlate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
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

  return (
    <Container>
      <Header title="Saída" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardAvoidingViewBehavior}
      >
        <ScrollView>
          <Content>
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
      </KeyboardAvoidingView>
    </Container>
  );
}
