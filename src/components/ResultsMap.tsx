"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  CircleMarker,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";

// Mock data for demo:
const places: {
  id: number;
  position: LatLngTuple;
  color: string;
  text: string;
}[] = [
  {
    id: 1,
    position: [60.1878, 24.8215],
    color: "#ff8a3d",
    text: "Maarintie 8",
  },
  {
    id: 2,
    position: [60.1866, 24.8277],
    color: "#f87171",
    text: "Otakaari 1, Aalto-yliopisto",
  },
  {
    id: 3,
    position: [60.187128, 24.8114551],
    color: "#4ade80",
    text: "K-market Maarinsolmu",
  },
  {
    id: 4,
    position: [60.1843, 24.8347],
    color: "#60a5fa",
    text: "Unisport Otaniemi",
  },
  {
    id: 5,
    position: [60.185, 24.827],
    color: "#c084fc",
    text: "Alvari restaurant",
  },
  {
    id: 6,
    position: [60.1905, 24.8135],
    color: "#facc15",
    text: "Maarin lintutorni",
  },
];

const homeIcon = L.icon({
  iconUrl: "/home.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function MapPlaceholder() {
  return (
    <p>
      Map of your search results.{" "}
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </p>
  );
}

export default function ResultsMap() {
  return (
    <MapContainer
      center={[60.1844, 24.8285]}
      zoom={14}
      scrollWheelZoom={true}
      placeholder={<MapPlaceholder />}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) =>
        place.id === 1 ? (
          <Marker key={place.id} position={place.position} icon={homeIcon}>
            <Popup>{place.text}</Popup>
          </Marker>
        ) : (
          <CircleMarker
            key={place.id}
            center={place.position}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: place.color,
              fillOpacity: 1,
            }}
          >
            <Popup>{place.text}</Popup>
          </CircleMarker>
        ),
      )}
    </MapContainer>
  );
}
