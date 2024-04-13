import { Car, FlagCheckered } from "phosphor-react-native";
import { LocationInfo, LocationInfoProps } from "../LocationInfo";
import { Container, Line } from "./styles";

type Props = {
  departure: LocationInfoProps;
  arrival?: LocationInfoProps | null;
};

export function Locations({ departure, arrival = null }: Props) {
  return (
    <Container>
      <LocationInfo
        description={departure.description}
        icon={Car}
        label={departure.label}
      />
      <Line />
      {arrival && (
        <>
          <LocationInfo
            description={arrival.description}
            icon={FlagCheckered}
            label={arrival.label}
          />
        </>
      )}
    </Container>
  );
}
