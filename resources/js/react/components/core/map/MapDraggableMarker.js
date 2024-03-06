import PropTypes from "prop-types";
import { useState, useRef, useEffect, forwardRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const LocationMarker = forwardRef((props, ref) => {
  const {
    draggable,
    position,
    eventHandlers,
    setPosition,
    toggleDraggable,
    isGetCurrentLocation,
  } = props;
  const map = useMap();

  useEffect(() => {
    if(isGetCurrentLocation) {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    } else {
      map.flyTo(position, map.getZoom());
    }
  }, [map]);

  return position === null ? null : (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={ref}
    >
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {`${position[0]}, ${position[1]}`}
        </span>
      </Popup>
    </Marker>
  );
});

const LeafletgeoSearch = ({ setMarker }) => {
  const map = useMap();

  const dragMarkerHandler = (e) => {
    setMarker(e.location);
  };

  const pinMarkerHandler = (e) => {
    setMarker(e.marker._latlng);
  };

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: "id",
      },
    });

    const searchControl = new GeoSearchControl({
      provider,
      showMarker: false,
    });

    map.addControl(searchControl);
    map.on("geosearch/marker/dragend", dragMarkerHandler);
    map.on("geosearch/showlocation", pinMarkerHandler);

    return () => map.removeControl(searchControl);
  }, []);

  return null;
};

const MapDraggableMarker = ({
  center,
  marker,
  setMarker,
  withGetCurrentLocation = false,
}) => {
  const [zoom] = useState(13);
  const [draggable, setDraggable] = useState(true);
  const refmarker = useRef();

  const toggleDraggable = () => {
    setDraggable(!draggable);
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = refmarker.current;
        if (marker != null) {
          setMarker(marker.getLatLng());
        }
      },
    }),
    []
  );

  const position = [center.lat, center.lng];
  const markerPosition = [marker.lat, marker.lng];
  return (
    <MapContainer center={position} zoom={zoom} className="leaflet-map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletgeoSearch setMarker={setMarker} />
      <LocationMarker
        draggable={draggable}
        toggleDraggable={toggleDraggable}
        eventHandlers={eventHandlers}
        ref={refmarker}
        position={markerPosition}
        setPosition={setMarker}
        isGetCurrentLocation={withGetCurrentLocation}
      />
    </MapContainer>
  );
};

MapDraggableMarker.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  marker: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  setMarker: PropTypes.func.isRequired,
};

export default MapDraggableMarker;
