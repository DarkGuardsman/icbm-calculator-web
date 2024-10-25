import './App.css';
import MapToolPage from "./tools/map/MapToolPage";
import {Provider} from "react-redux";
import {store} from "./data/store"

function App() {
  return (
      <Provider store={store}>
        <MapToolPage/>
      </Provider>
  );
}

export default App;
