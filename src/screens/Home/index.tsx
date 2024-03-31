import { useNavigation } from "@react-navigation/native";
import dayjs from 'dayjs';
import { CarStatus } from "../../components/CarStatus";
import { HomeHeader } from "../../components/HomeHeader";
import { Container, Content, Label, Title } from "./styles";
import { useQuery, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import Realm from "realm";
import { HistoricCard, HistoricCardProps } from "../../components/HistoricCard";
import { useUser } from "@realm/react";
import { getLastSyncTimestamp, saveLastSyncTimeSstamp } from "../../libs/asyncStorage/syncStorage";

export function Home() {
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([]);
  const { navigate } = useNavigation();
  const historic = useQuery(Historic);
  const user = useUser();
  const realm = useRealm();
  const handleRegisterMovement = () => {
    if (vehicleInUse?._id) {
      return navigate("arrival", {
        id: vehicleInUse._id.toString(),
      });
    } else {
      navigate("departure");
    }
  };
  const fetchVehicleInUse = () => {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0];
      setVehicleInUse(vehicle);
    } catch (err) {
      Alert.alert(
        "Veículo em uso",
        "Não foi possível carregar o veículo em uso"
      );
    }
  };

  async function fetchHistoric() {
    try {
      const response = historic.filtered(
        "status = 'arrival' SORT(created_at DESC)"
      );
      const lastSync = await getLastSyncTimestamp();
      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id!.toString(),
          created: dayjs(item.created_at).format("[Saída em] DD/MM/YYYY [às] HH:mm"),
          licensePlate: item.license_plate,
          isSync: lastSync ? lastSync > item.updated_at!.getTime() : false,
        })
      })
      setVehicleHistoric(formattedHistoric);
    } catch(err) {
      console.log(err);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico');
    }
  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id })
  }

  async function progressNotification(transfered: number, transferable: number) {
    const percentage = (transfered / transferable) * 100;
    if (percentage === 100) {
      await saveLastSyncTimeSstamp();
      fetchHistoric();
    }
  };

  useEffect(() => {
    fetchVehicleInUse();
  }, []);

  useEffect(() => {
    realm.addListener("change", () => fetchVehicleInUse());

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener("change", () => fetchVehicleInUse());
      }
    }
  }, []);

  useEffect(() => {
    fetchHistoric();
  }, [historic]);

  useEffect(() => {
     realm.subscriptions.update((mutableSubs, realm) => {
        const historicByUserQuery = realm.objects('Historic').filtered(`user_id = '${user!.id}'`);
          mutableSubs.add(historicByUserQuery, {
            name: 'historic_by_user'
          });
      })
  }, [realm]);

  useEffect(() => {
   const syncSession = realm.syncSession;
   if (!syncSession) return;
   syncSession.addProgressNotification(
    Realm.ProgressDirection.Upload,
    Realm.ProgressMode.ReportIndefinitely,
    progressNotification,
   )

   return () => syncSession.removeProgressNotification(progressNotification);
  }, []);

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={() => handleRegisterMovement()}
        />
        <Title>Histórico</Title>
       <FlatList
         data={vehicleHistoric}
         keyExtractor={item => item.id}
         renderItem={({ item }) => (
            <HistoricCard
             data={item}
             onPress={() => handleHistoricDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum veículo utilizado.
            </Label>
          )}
       />
      </Content>
    </Container>
  );
}
