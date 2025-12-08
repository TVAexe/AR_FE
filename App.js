import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Routes from "./routes/Routes";
import SafeContainer from "./components/SafeArea";
import { store } from "./states/store";

// ...existing code...
export default function App() {
  console.reportErrorsAsExceptions = false;
  return (
    <SafeContainer>
      <Provider store={store}>
        <Routes />
      </Provider>
    </SafeContainer>
  );
}