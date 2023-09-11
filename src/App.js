import "./App.css";
import Sidebar from "./Sidebar";
import Map from "./Map";
import { Machine } from "./Machine";
import { useEffect, useState } from "react";
import axios from "axios";


function App() {
  const [machineData, setMachineData] = useState([]);
  const [activeMachines, setActiveMachines] = useState([]);
  const handleButtonClick = (machines) => {
    setActiveMachines(machines);
  };
  useEffect(() => {
    axios
      .get("http://localhost:4000/machines")
      .then((response) => {
        const data = response.data;
        const mappedData = data.map((item) => {
          return new Machine(
            item.id,
            item.vin,
            item.name,
            item.make,
            item.type,
            item.model,
            item.lastKnown,
            item.locationHistory,
            item.lastUpdatedTime,
            item.locationAddress
          );
        });
        setMachineData(mappedData);
        setActiveMachines(mappedData);
      })
      .catch((error) => {
        console.error("Error Fetching From API", error);
      });
  }, []);
  return (
    <div className="App">
      <div className="sideBar">
        {/* <Sidebar3 />*/}
        <Sidebar machineList={machineData} onButtonClick={handleButtonClick} />
      </div>
      <div className="map">
        <Map activeMachines={activeMachines} />
      </div>
    </div>
  );
}

export default App;
