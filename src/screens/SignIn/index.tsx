import { Container, Slogan, Title } from "./styles";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import backgroundImg from "../../assets/background.png";
import { Button } from "../../components/Button";
import { ANDROID_CLIENT_ID } from "@env";
import {Realm, useApp} from '@realm/react';
import { useState } from "react";
import { Alert } from "react-native";

GoogleSignin.configure({
  scopes: ["email", "profile"],
  webClientId: ANDROID_CLIENT_ID,
});

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const app = useApp();

  async function handleGoogleSignIn() {
    setIsAuthenticating(true)
    try {
      const {idToken} = await GoogleSignin.signIn();
      if (idToken) {
        const credentials = Realm.Credentials.jwt(idToken);
        await app.logIn(credentials);
      } else {
        Alert.alert("Erro ao autenticar", "Não foi possível autenticar com o Google")
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao autenticar", "Não foi possível autenticar com o Google")
    } finally {
      setIsAuthenticating(false)
    }
  }
  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>
      <Button
        title="Entrar com Google"
        onPress={handleGoogleSignIn}
        isLoading={isAuthenticating}
      />
    </Container>
  );
}
