import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

const dimesions = Dimensions.get('window');

export const Container = styled.View`
  width: ${dimesions.width}px;
  position: absolute;
  z-index: 1;
  background-color: ${({ theme }) => theme.COLORS.GRAY_500};
  padding-bottom: 5px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.COLORS.GRAY_100};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};

  margin-left: 4px;
`;