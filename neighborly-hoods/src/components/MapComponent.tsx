import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ShopMarker {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface MapComponentProps {
    shops?: ShopMarker[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    onMarkerClick?: (shopId: number) => void;
    singleLocation?: { lat: number; lng: number; name: string };
}

// Component to fit bounds when shops change
const FitBounds = ({ shops }: { shops?: ShopMarker[] }) => {
    const map = useMap();

    useEffect(() => {
        if (shops && shops.length > 0) {
            const bounds = L.latLngBounds(
                shops.map(shop => [shop.latitude, shop.longitude] as [number, number])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [shops, map]);

    return null;
};

const MapComponent = ({
    shops = [],
    center = [20.5937, 78.9629], // Default to India center
    zoom = 5,
    height = '400px',
    onMarkerClick,
    singleLocation,
}: MapComponentProps) => {
    const [isMounted, setIsMounted] = useState(false);

    // Ensure component is mounted before rendering map
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // If single location, center on it
    const mapCenter: [number, number] = singleLocation
        ? [singleLocation.lat, singleLocation.lng]
        : center;
    const mapZoom = singleLocation ? 15 : zoom;

    if (!isMounted) {
        return (
            <div style={{ height, width: '100%', borderRadius: '0.5rem' }} className="flex items-center justify-center bg-accent">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height, width: '100%', borderRadius: '0.5rem' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Single location marker */}
            {singleLocation && (
                <Marker position={[singleLocation.lat, singleLocation.lng]}>
                    <Popup>{singleLocation.name}</Popup>
                </Marker>
            )}

            {/* Multiple shop markers */}
            {shops.map((shop) => (
                <Marker
                    key={shop.id}
                    position={[shop.latitude, shop.longitude]}
                    eventHandlers={{
                        click: () => onMarkerClick?.(shop.id),
                    }}
                >
                    <Popup>
                        <div className="p-1">
                            <h3 className="font-semibold">{shop.name}</h3>
                            <p className="text-sm text-gray-600">{shop.address}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Fit bounds to shops if multiple */}
            {shops.length > 1 && <FitBounds shops={shops} />}
        </MapContainer>
    );
};

export default MapComponent;

