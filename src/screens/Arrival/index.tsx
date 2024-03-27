import React from "react";
import { Container, Content, Description, Footer, Label, LicensePlate } from "./styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { BSON } from "realm";
import { Alert } from "react-native";

type RouteParamsProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;
  const historic = useObject(Historic, new BSON.UUID(id));

  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes';
  const realm = useRealm();
  const {goBack} = useNavigation();

  function handleRemoveVehicleUsage() {
    Alert.alert(
      'Cancelar',
      'Cancelar a utilização do veículo?',
      [
        {
          text: 'Não', style: 'cancel'
        },
        {
          text: 'Sim', onPress: () => removeVehicleUsage()
        }
      ]
    )
  }
  function removeVehicleUsage() {
    realm.write(() => {
      realm.delete(historic);
    });
    goBack();
  }

  function handleArrivalRegister() {
    try {
      if(!historic) {
        return Alert.alert('Erro', 'Não foi possível obter os dados do veículo');
      }
      realm.write(() => {
        historic.status = 'arrival';
        historic.updated_at = new Date();
      }
      )
      Alert.alert('Sucesso', 'Chegada registrada com sucesso');
      goBack();
    } catch(err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível registrar a chegada');
    }
  }

  return (
    <Container>
        <Content>
         <Header title={title} />
        <Label>
            Placa do veículo
        </Label>
        <LicensePlate>
            {historic?.license_plate}
        </LicensePlate>
        <Label>
            Finalidade
        </Label>
        <Description>
            {historic?.description}
        </Description>
        </Content>
        {
          historic?.status === 'departure' && (
           <Footer>
            <ButtonIcon onPress={handleRemoveVehicleUsage} icon={X} />
            <Button onPress={() => handleArrivalRegister()} title="Registrar chegada" />
          </Footer>
          )
         }
    </Container>
  )
}
