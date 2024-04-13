import React, { useEffect, useState } from "react";
import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from "./styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { BSON } from "realm";
import { Alert } from "react-native";
import { getLastSyncTimestamp } from "../../libs/asyncStorage/syncStorage";
import { stopLocationTask } from "../../tasks/backgroundLocationTask";
import { getStorageLocation } from "../../libs/asyncStorage/locationStorage";
import { LatLng } from "react-native-maps";
import { Map } from "../../components/Map";

type RouteParamsProps = {
  id: string;
};

export function Arrival() {
  const [dataNotSynced, setDataNotSynced] = useState(false);
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;
  const historic = useObject(Historic, new BSON.UUID(id));

  const title = historic?.status === "departure" ? "Chegada" : "Detalhes";
  const realm = useRealm();
  const { goBack } = useNavigation();

  function handleRemoveVehicleUsage() {
    Alert.alert("Cancelar", "Cancelar a utilização do veículo?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: () => removeVehicleUsage(),
      },
    ]);
  }
  async function removeVehicleUsage() {
    realm.write(() => {
      realm.delete(historic);
    });
    await stopLocationTask();
    goBack();
  }

  async function handleArrivalRegister() {
    try {
      if (!historic) {
        return Alert.alert(
          "Erro",
          "Não foi possível obter os dados do veículo"
        );
      }
      const locations = await getStorageLocation();
      await stopLocationTask();
      realm.write(() => {
        historic.status = "arrival";
        historic.updated_at = new Date();
        historic.coords.push(...locations);
      });
      await stopLocationTask();
      Alert.alert("Sucesso", "Chegada registrada com sucesso");
      goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível registrar a chegada");
    }
  }

  async function getLocationsInfo() {
    if (!historic) {
      return;
    }
    const lastSync = await getLastSyncTimestamp();
    const updated_at = historic?.updated_at?.getTime();
    setDataNotSynced(updated_at! > lastSync!);
    const locationsStorage = await getStorageLocation();
    setCoordinates(locationsStorage);
  }

  useEffect(() => {
    getLocationsInfo();
  }, [historic]);

  return (
    <Container>
      <Content>
        <Header title={title} />
        {
          coordinates.length > 0 && (
            <Map coordinates={coordinates} />
          )
        }
        <Label>Placa do veículo</Label>
        <LicensePlate>{historic?.license_plate}</LicensePlate>
        <Label>Finalidade</Label>
        <Description>{historic?.description}</Description>
      </Content>
      {historic?.status === "departure" && (
        <Footer>
          <ButtonIcon onPress={handleRemoveVehicleUsage} icon={X} />
          <Button
            onPress={() => handleArrivalRegister()}
            title="Registrar chegada"
          />
        </Footer>
      )}
      { dataNotSynced && (
      <AsyncMessage>
        Sincronização da{" "}
        {historic?.status === "departure" ? "partida" : "chegada"} pendente
      </AsyncMessage>
      )}
    </Container>
  );
}
