import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NeighborhoodSelect({ onSelect }) {
  const [locations, setLocations] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  useEffect(() => {
    // Fetch the house prices data
    fetch('/data/housePrices.json')
      .then(response => response.json())
      .then(data => {
        setLocations(data.locations);
      })
      .catch(error => console.error('Error loading house prices data:', error));
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const location = locations.find(loc => loc.name === selectedLocation);
      if (location && location.neighborhoodData) {
        setNeighborhoods(location.neighborhoodData);
      } else {
        setNeighborhoods([]);
      }
    } else {
      setNeighborhoods([]);
    }
  }, [selectedLocation, locations]);

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    setSelectedNeighborhood("");
  };

  const handleNeighborhoodChange = (value) => {
    setSelectedNeighborhood(value);
    
    const location = locations.find(loc => loc.name === selectedLocation);
    const neighborhood = location?.neighborhoodData.find(n => n.name === value);
    
    if (location && neighborhood) {
      onSelect({
        location: location.name,
        neighborhood: neighborhood.name,
        price: neighborhood.medianHomePrice,
        currency: location.currency,
        priceHistory: neighborhood.priceHistory
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Location</label>
        <Select value={selectedLocation} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {locations.map((location) => (
              <SelectItem key={location.name} value={location.name}>
                {location.name}, {location.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLocation && (
        <div>
          <label className="block text-sm font-medium mb-1">Select Neighborhood</label>
          <Select value={selectedNeighborhood} onValueChange={handleNeighborhoodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select neighborhood" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {neighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood.name} value={neighborhood.name}>
                  {neighborhood.name} - {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: locations.find(loc => loc.name === selectedLocation)?.currency || 'USD',
                    maximumFractionDigits: 0
                  }).format(neighborhood.medianHomePrice)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
} 