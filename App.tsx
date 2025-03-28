import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import { configureFonts } from 'react-native-paper';


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#caa26a", // Màu chính
    onPrimary: "#ffffff", // Màu chữ trên nền primary    
    twine: { // Thêm toàn bộ palette
      '50': '#faf7f2',
      '100': '#f4eee0',
      '200': '#e9dbbf',
      '300': '#dac297',
      '400': '#caa26a',
      '500': '#c08c4f',
      '600': '#b27944',
      '700': '#94603a',
      '800': '#784e34',
      '900': '#61412d',
      '950': '#342116',
    }
  },
  fonts: configureFonts({ config: { fontFamily: 'Roboto-Regular' } })
};

export default function App() {
  return (
    <PaperProvider theme={theme}>  {/* ✅ Bọc PaperProvider quanh toàn bộ ứng dụng */}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}