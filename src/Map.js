import React, {useState} from 'react';
import {GoogleMap, InfoWindowF, MarkerF, PolylineF, useLoadScript} from "@react-google-maps/api";
import {BeatLoader, BounceLoader, RingLoader} from 'react-spinners';
import {CSSProperties} from "react";


const Map = ({activeMachines}) => {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyAvlwbPdqvgaNtSCdPwZjE5wllKBTT7sf8",
    });
    if (!isLoaded)
        return <LoadingComponent isLoaded={isLoaded}/>
    return <GMap activeMachines={activeMachines}/>
};

export function GMap({activeMachines}) {

    const [activeMarker, setActiveMarker] = useState(null);
    const tractorIcon = "http://localhost:3000/tractors.png"
    const handleOnLoad = (map) => {
        console.log("handle On Load Called")
        const bounds = new window.google.maps.LatLngBounds();
        activeMachines.forEach(machine => {
            console.log(machine.lastKnown);
            bounds.extend(machine.lastKnown)
        });
        map.fitBounds(bounds);
    };

    const machinesLoaded = activeMachines.length > 0;
    if (!machinesLoaded)
        return <LoadingComponent isLoaded={machinesLoaded}/>
    return (
        <GoogleMap onLoad={handleOnLoad} mapContainerStyle={{width: "75vw", height: "96vh"}}>
            {activeMachines.map(machine => (
                <MarkerF key={machine.id} position={machine.lastKnown} icon={tractorIcon}
                         onClick={() => setActiveMarker(machine)}
                         animation={window.google.maps.Animation.DROP}/>
            ))}

            {activeMarker && (
                <InfoWindowF position={activeMarker.lastKnown}
                             onCloseClick={() => setActiveMarker(null)}>
                    <div>{getMachineInfo(activeMarker)}</div>
                </InfoWindowF>
            )}
            {activeMachines.length === 1 && (
            <PolylineF path={activeMachines[0].locationHistory} />)}
        </GoogleMap>
    );
}

export default Map;

function getMachineInfo(machine) {
    const content = <div>
        <span className="heading-span">{machine.make} {machine.model}</span>
        <div>
            <ul className="detail-list">
                <li>Category: {machine.type}</li>
                <li>VIN: {machine.vin}</li>
                <li>Last Known Location: {machine.lastKnown.lat} {machine.lastKnown.lng}</li>
            </ul>
        </div>
    </div>
    return content;
}


const reverseGeocode = (lat, lng) => {
    const {google} = window.google;

    const geocoder = new google.maps.Geocoder();

    const latLng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({location: latLng}, (results, status) => {
        if (status === 'OK') {
            if (results[0]) {
                console.log(results[0].formatted_address)
            } else {
                console.error('No results found');
            }
        } else {
            console.error('Geocoder failed due to: ' + status);
        }
    });
};


export const LoadingComponent = ({isLoaded}) => {
    const override: CSSProperties = {
        display: "block",
        margin: "0 auto",
    }
    const containerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Make the container at least as tall as the viewport
    };

    return (
    <div style={containerStyle}>
        <div className="loading-container">
            <BounceLoader color="rgb(70, 95, 112)" cssOverride={override} size={60} loading={!isLoaded}/>
            <p>Loading Map...</p>
        </div>
    </div>)



}





