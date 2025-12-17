import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Routes from "./routes/Routes";
import { store } from "./states/store";

export default function App() {
  console.reportErrorsAsExceptions = false;
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}