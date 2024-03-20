import { useRef } from "react";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Container, Content } from "./styles";
import { ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";

export function Departure() {
  const keyboardAvoidingViewBehavior = Platform.OS === 'ios' ? 'position' : 'height';
  const descriptionRef = useRef<TextInput>(null);

  const handleDeparture = () => {
    console.log('ok')
  };

  return (
    <Container>
      <Header title="Saída" />
      <KeyboardAvoidingView style={{flex: 1}} behavior={keyboardAvoidingViewBehavior}>
      <ScrollView>
      <Content>
        <LicensePlateInput returnKeyType="next" onSubmitEditing={() => descriptionRef.current?.focus()} label="Placa do veículo" placeholder="BRA1234" />
        <TextAreaInput blurOnSubmit returnKeyType="send" onSubmitEditing={handleDeparture} ref={descriptionRef} placeholder="Vou utilizar o veículo para..." label="Finalidade" />
      <Button onPress={handleDeparture} title="Registrar Saída" />
     </Content>
      </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
