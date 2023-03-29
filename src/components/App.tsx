import { useSelector } from "react-redux";
import { ReactElement } from "react";

import Login from "./login/login";
import AppContainer from "./AppContainer";
import { AppState } from "../store";

function App(): ReactElement {
  const token = useSelector((state: AppState) => state.token);

  return token ? <AppContainer /> : <Login />;
}

export default App;
