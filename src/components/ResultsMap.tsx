"use client";

import type { Coordinates, Place } from "@/types";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  CircleMarker,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";

// Custom icon for the home address
const homeIcon = L.icon({
  iconUrl: "/home.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Convert coordinates to [lat, lon] for Leaflet
const toLatLng = (c: Coordinates): LatLngTuple => [c.latitude, c.longitude];

// Placeholder if map is loading or something went wrong
function MapPlaceholder() {
  return (
    <p>
      Map of your search results.{" "}
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </p>
  );
}

export default function ResultsMap({
  home,
  places,
}: {
  home: Place;
  places: Place[];
}) {
  return (
    <MapContainer
      center={toLatLng(home.coordinates)}
      zoom={14}
      scrollWheelZoom={true}
      placeholder={<MapPlaceholder />}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Add home icon into the map */}
      <Marker position={toLatLng(home.coordinates)} icon={homeIcon}>
        <Popup>{home.name}</Popup>
      </Marker>

      {/* Colored circle marker for each result */}
      {places.map((place) => (
        <CircleMarker
          key={place.id}
          center={toLatLng(place.coordinates)}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: place.color,
            fillOpacity: 1,
          }}
        >
          {/* Show place name when marker is clicked */}
          <Popup>{place.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
