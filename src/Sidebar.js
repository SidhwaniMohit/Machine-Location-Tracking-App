import React, { useState } from "react";
import logo from './assets/img/logo.png'
// import type {Machine} from "./Machine";

const Sidebar = ({ machineList, onButtonClick }) => {
  const [selectedButton, setSelectedButton] = useState("all");
  const onButtonSelect = (buttonLabel) => {
    setSelectedButton(buttonLabel);
  };

  return (
    <div>
      <div className="Logo-bg">
        <img src={logo} height='100%' width="100%"></img>
      </div>
      <ul className="sidebar-links">
        <li key="home">
          <button
            id="all"
            className={
              selectedButton === "all" ? "button-23-select" : "button-23"
            }
            onClick={() => {
              onButtonSelect("all");
              onButtonClick(machineList);
            }}
          >
            All Machines
            <br />
            <span className="org-name">Org Id: 157679</span>
          </button>
        </li>
      </ul>
      <ul className="sidebar-links">
        {machineList.map((machine) => (
          <li key={machine.id}>
            <button
              className={
                selectedButton === machine.vin
                  ? "button-23-select"
                  : "button-23"
              }
              onClick={() => {
                onButtonSelect(machine.vin);
                onButtonClick([machine]);
              }}
            >
              {machine.make + " " + machine.model}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Sidebar;
