"use client";

import type { Coordinates, Place } from "@/types";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type RefObject } from "react";
import {
  MapContainer,
  CircleMarker,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import L, {
  type CircleMarker as LeafletCircleMarker,
  type LatLngTuple,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from "leaflet";
import { formatDistance } from "@/lib/geocoding";

const MOBILE_SHEET_HEIGHT_RATIO = 0.42;

// Custom icon for the home address
const homeIcon = L.icon({
  iconUrl: "/home.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom icon for the commute icon
const officeIcon = L.icon({
  iconUrl: "/office.svg",
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

// Recalculate the map size after layout changes
function ResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 320); // wait for the transition animation
    return () => clearTimeout(timeout);
  }, [trigger, map]);

  return null;
}

// Adjusting the map for mobile layout
function getMobileSheetHeight(map: LeafletMap): number {
  return window.matchMedia("(max-width: 1023px)").matches
    ? Math.round(map.getSize().y * MOBILE_SHEET_HEIGHT_RATIO)
    : 0;
}

// Fit the map bounds around the home and place markers
function FitBoundsHandler({
  north,
  east,
  south,
  west,
  trigger,
}: {
  north: number;
  east: number;
  south: number;
  west: number;
  trigger: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const mobileSheetHeight = getMobileSheetHeight(map);

    if (north === south && east === west) {
      if (mobileSheetHeight) {
        const zoom = map.getZoom();
        const center = map.unproject(
          map
            .project([north, east], zoom)
            .add([0, Math.round(mobileSheetHeight / 2)]),
          zoom,
        );
        map.setView(center, zoom, { animate: false });
      }
      return;
    }

    map.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      mobileSheetHeight
        ? {
            paddingTopLeft: [48, 48],
            paddingBottomRight: [48, 48 + mobileSheetHeight],
            maxZoom: 14,
          }
        : { padding: [48, 48], maxZoom: 14 },
    );
  }, [east, map, north, south, trigger, west]);

  return null;
}

// Synchronize popups with place or commute selection and hover state
function PopupSyncHandler({
  placeId,
  commute,
  markers,
  commuteMarker,
}: {
  placeId: string | null;
  commute: boolean;
  markers: RefObject<Map<string, LeafletCircleMarker>>;
  commuteMarker: RefObject<LeafletMarker | null>;
}) {
  const map = useMap();

  useEffect(() => {
    const marker = commute
      ? commuteMarker.current
      : placeId
        ? markers.current.get(placeId)
        : null;
    if (marker) {
      marker.openPopup();
    } else {
      map.closePopup();
    }
  }, [commute, commuteMarker, map, markers, placeId]);

  return null;
}

// Clear map selection when the user clicks outside interactive markers
function MapClickHandler({
  onClearSelection,
}: {
  onClearSelection: () => void;
}) {
  useMapEvents({
    click(event) {
      const target = event.originalEvent.target;
      if (
        target instanceof Element &&
        target.closest(".leaflet-popup, .leaflet-tooltip, .leaflet-control")
      ) {
        return;
      }

      onClearSelection();
    },
  });

  return null;
}

// Render the everything on the map
export default function ResultsMap({
  home,
  commute,
  places,
  layout,
  activePlaceId,
  activeCommute,
  commuteDistance,
  onPlaceSelect,
  onPlaceHover,
  onCommuteSelect,
  onCommuteHover,
  onClearSelection,
}: {
  home: Pick<Place, "coordinates" | "name">;
  commute: Pick<Place, "coordinates" | "name"> | null;
  commuteDistance: number | null;
  places: Place[];
  layout: boolean;
  activePlaceId: string | null;
  activeCommute: boolean;
  onPlaceSelect: (placeId: string) => void;
  onPlaceHover: (placeId: string | null) => void;
  onCommuteSelect: () => void;
  onCommuteHover: (hovered: boolean) => void;
  onClearSelection: () => void;
}) {
  const placeMarkers = useRef(new Map<string, LeafletCircleMarker>());
  const commuteMarker = useRef<LeafletMarker | null>(null);
  const activePlace = places.find(({ id }) => id === activePlaceId);
  const coordinates = [
    home.coordinates,
    ...places.map(({ coordinates: placeCoordinates }) => placeCoordinates),
    ...(activeCommute && commute ? [commute.coordinates] : []),
  ];
  const bounds = coordinates.reduce(
    (current, coordinate) => ({
      north: Math.max(current.north, coordinate.latitude),
      east: Math.max(current.east, coordinate.longitude),
      south: Math.min(current.south, coordinate.latitude),
      west: Math.min(current.west, coordinate.longitude),
    }),
    {
      north: Number.NEGATIVE_INFINITY,
      east: Number.NEGATIVE_INFINITY,
      south: Number.POSITIVE_INFINITY,
      west: Number.POSITIVE_INFINITY,
    },
  );
  const routeDestination = activeCommute
    ? commute?.coordinates
    : activePlace?.coordinates;
  const routeDistance = activeCommute ? commuteDistance : activePlace?.distance;
  const routeMidpoint = routeDestination
    ? toLatLng({
        latitude: (home.coordinates.latitude + routeDestination.latitude) / 2,
        longitude:
          (home.coordinates.longitude + routeDestination.longitude) / 2,
      })
    : null;

  return (
    <MapContainer
      center={toLatLng(home.coordinates)}
      zoom={14}
      scrollWheelZoom={true}
      zoomControl={false}
      attributionControl={false}
      placeholder={<MapPlaceholder />}
    >
      <ResizeHandler trigger={layout} />
      <FitBoundsHandler {...bounds} trigger={activeCommute} />
      <PopupSyncHandler
        placeId={activePlaceId}
        commute={activeCommute}
        markers={placeMarkers}
        commuteMarker={commuteMarker}
      />
      <MapClickHandler onClearSelection={onClearSelection} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeDestination && routeMidpoint && (
        <Polyline
          key={`${routeDestination.latitude},${routeDestination.longitude}`}
          positions={[toLatLng(home.coordinates), toLatLng(routeDestination)]}
          pathOptions={{
            color: "var(--color-green)",
            weight: 2,
            opacity: 0.8,
            dashArray: "4 6",
          }}
        >
          {routeDistance !== undefined && routeDistance !== null && (
            <Tooltip
              position={routeMidpoint}
              permanent
              direction="center"
              className="distance-line-tooltip"
            >
              {formatDistance(routeDistance)}
            </Tooltip>
          )}
        </Polyline>
      )}
      <AttributionControl position="topright" />{" "}
      <ZoomControl position="topright" />
      {/* Move the zoom controls to lower right */}
      {/* Add home icon into the map */}
      <Marker position={toLatLng(home.coordinates)} icon={homeIcon}>
        <Popup>{home.name}</Popup>
      </Marker>
      {commute && (
        <Marker
          ref={(marker) => {
            commuteMarker.current = marker;
          }}
          position={toLatLng(commute.coordinates)}
          icon={officeIcon}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: () => onCommuteSelect(),
            mouseover: () => onCommuteHover(true),
            mouseout: () => onCommuteHover(false),
          }}
        >
          <Popup>{commute.name}</Popup>
        </Marker>
      )}
      {/* Colored circle marker for each result */}
      {places.map((place) => {
        const isSelected = place.id === activePlaceId;

        return (
          <CircleMarker
            key={place.id}
            ref={(marker) => {
              if (marker) {
                placeMarkers.current.set(place.id, marker);
              } else {
                placeMarkers.current.delete(place.id);
              }
            }}
            center={toLatLng(place.coordinates)}
            radius={isSelected ? 14 : 10}
            pathOptions={{
              color: isSelected ? "var(--color-green)" : "#ffffff",
              weight: isSelected ? 4 : 2,
              fillColor: place.color,
              fillOpacity: 1,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click: () => onPlaceSelect(place.id),
              mouseover: () => onPlaceHover(place.id),
              mouseout: () => onPlaceHover(null),
            }}
          >
            {/* Show place name when marker is clicked */}
            <Popup>{place.name}</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
