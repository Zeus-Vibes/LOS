import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, Loader2, Check, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationCaptureProps {
    currentLat?: number | null;
    currentLng?: number | null;
    onLocationUpdate: (lat: number, lng: number) => Promise<void>;
    title?: string;
}

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to recenter map
const MapRecenter = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
};

const LocationCapture = ({
    currentLat,
    currentLng,
    onLocationUpdate,
    title = "Shop Location"
}: LocationCaptureProps) => {
    const [latitude, setLatitude] = useState<string>(currentLat?.toString() || '');
    const [longitude, setLongitude] = useState<string>(currentLng?.toString() || '');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const watchId = useRef<number | null>(null);
    const { toast } = useToast();

    // Ensure component is mounted before rendering map
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (isLiveTracking) {
            if (navigator.geolocation) {
                watchId.current = navigator.geolocation.watchPosition(
                    (position) => {
                        setLatitude(position.coords.latitude.toFixed(6));
                        setLongitude(position.coords.longitude.toFixed(6));
                    },
                    (error) => {
                        console.error('WatchPosition error:', error);
                        setIsLiveTracking(false);
                        toast({ title: "Live Tracking Error", description: "Failed to track location.", variant: "destructive" });
                    },
                    { enableHighAccuracy: true }
                );
            }
        } else {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        }

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [isLiveTracking, toast]);

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toFixed(6));
                    setLongitude(position.coords.longitude.toFixed(6));
                    setIsGettingLocation(false);
                    toast({ title: "Location captured!", description: "Click Save to update your shop location" });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast({ title: "Error", description: "Could not get your location. Please enter manually.", variant: "destructive" });
                    setIsGettingLocation(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            toast({ title: "Not supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
            setIsGettingLocation(false);
        }
    };

    const handleSave = async () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            toast({ title: "Invalid coordinates", description: "Please enter valid latitude and longitude", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await onLocationUpdate(lat, lng);
            toast({ title: "Location saved!", description: "Your shop location has been updated" });
            setIsLiveTracking(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save location", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const hasLocation = currentLat && currentLng;
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const center: [number, number] = !isNaN(latNum) && !isNaN(lngNum) ? [latNum, lngNum] : [28.6139, 77.2090]; // Default to Delhi

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasLocation ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {hasLocation ? 'Location is set' : 'No location set - customers cannot find you'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
                    <Label htmlFor="live-tracking" className="text-xs font-semibold flex items-center gap-1">
                        <Crosshair className={`w-3 h-3 ${isLiveTracking ? 'text-red-500 animate-pulse' : ''}`} />
                        Live Track
                    </Label>
                    <Switch
                        id="live-tracking"
                        checked={isLiveTracking}
                        onCheckedChange={setIsLiveTracking}
                    />
                </div>
            </div>

            <div className="h-64 relative overflow-hidden rounded-xl border z-0">
                {isMounted ? (
                    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onLocationSelect={(lat, lng) => {
                            setLatitude(lat.toFixed(6));
                            setLongitude(lng.toFixed(6));
                        }} />
                        {!isNaN(latNum) && !isNaN(lngNum) && (
                            <>
                                <Marker position={[latNum, lngNum]} />
                                <MapRecenter lat={latNum} lng={lngNum} />
                            </>
                        )}
                    </MapContainer>
                ) : (
                    <div className="h-full flex items-center justify-center bg-accent">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                )}
                <div className="absolute top-2 right-2 z-[1000] space-y-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-md h-8 w-8 p-0"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        title="Get Current Location"
                    >
                        {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 28.6139"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., 77.2090"
                    />
                </div>
            </div>

            <Button
                className="w-full"
                onClick={handleSave}
                disabled={isSaving || !latitude || !longitude}
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Check className="w-4 h-4 mr-2" />
                )}
                {hasLocation ? "Update Shop Location" : "Set Shop Location"}
            </Button>

            {hasLocation && (
                <p className="text-[10px] text-muted-foreground text-center">
                    Current fixed coordinates: {Number(currentLat).toFixed(6)}, {Number(currentLng).toFixed(6)}
                </p>
            )}
        </Card>
    );
};

export default LocationCapture;
