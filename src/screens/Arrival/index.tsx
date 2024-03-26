import React from "react";
import { Container, Content, Description, Footer, Label, LicensePlate } from "./styles";
import { useRoute } from "@react-navigation/native";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";

type RouteParamsProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;
  return (
    <Container>
        <Content>
         <Header title="Chegada" />
        <Label>
            Placa do veículo
        </Label>
        <LicensePlate>
            XXX0000
        </LicensePlate>
        <Label>
            Finalidade
        </Label>
        <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec
        </Description>
        <Footer>
            <ButtonIcon icon={X} />
            <Button title="Registrar chegada" />
        </Footer>
        </Content>
    </Container>
  )
}
