import { useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';
import { useFilterStore } from '../store/useFilterStore';

interface DataUsageRecord {
  msisdn: string;
  current_billing_status: string;
  data_usage_raw_total: number;
  apn_name: string;
  event_date: string;
  is_use_internet: string;
  latitude: number;
  longitude: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  area: string;
  region: string;
}

// Import all real data
import realDataJson from '../../real_data.json';
const mockData: DataUsageRecord[] = realDataJson as DataUsageRecord[];

const MapView = () => {
  const { category, status, search } = useFilterStore();

  const filteredData = useMemo(() => {
    return mockData.filter(record => {
      const matchesCategory = !category || record.region === category;
      const matchesStatus = !status || record.current_billing_status === status;
      const matchesSearch = !search || 
        record.msisdn.toLowerCase().includes(search.toLowerCase()) ||
        record.kelurahan.toLowerCase().includes(search.toLowerCase()) ||
        record.kecamatan.toLowerCase().includes(search.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [category, status, search]);

  // Calculate center point of visible markers
  const mapCenter = useMemo(() => {
    if (filteredData.length === 0) {
      return { lat: -6.2088, lng: 106.8456 }; // Jakarta, Indonesia
    }
    
    const avgLat = filteredData.reduce((sum, project) => sum + project.latitude, 0) / filteredData.length;
    const avgLng = filteredData.reduce((sum, project) => sum + project.longitude, 0) / filteredData.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [filteredData]);

  // Calculate marker size based on data usage
  const getMarkerSize = (dataUsage: number) => {
    if (!dataUsage || dataUsage <= 0) return 15;
    const maxValue = Math.max(...filteredData.map(p => p.data_usage_raw_total || 0));
    if (maxValue === 0) return 15;
    const minSize = 15;
    const maxSize = 45;
    
    return minSize + ((dataUsage / maxValue) * (maxSize - minSize));
  };

  // Get marker color based on billing status
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'IN-BILLING': return '#10b981'; // green
      case 'OUT-OF-BILLING': return '#f59e0b'; // yellow
      case 'SUSPENDED': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
        initialViewState={{
          longitude: mapCenter.lng,
          latitude: mapCenter.lat,
          zoom: 6
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {filteredData.map((record, index) => (
          <Marker
            key={`${record.msisdn}-${index}`}
            longitude={record.longitude}
            latitude={record.latitude}
          >
            <div
              className="rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform flex items-center justify-center text-white font-bold text-xs"
              style={{
                width: getMarkerSize(record.data_usage_raw_total),
                height: getMarkerSize(record.data_usage_raw_total),
                backgroundColor: getMarkerColor(record.current_billing_status),
              }}
              title={`${record.kelurahan} - ${record.data_usage_raw_total ? (record.data_usage_raw_total / (1024 * 1024)).toFixed(2) : '0'} MB`}
            >
              {record.data_usage_raw_total ? 
                (record.data_usage_raw_total >= 1024 * 1024 ? 
                  `${(record.data_usage_raw_total / (1024 * 1024)).toFixed(0)}MB` : 
                  `${(record.data_usage_raw_total / 1024).toFixed(0)}KB`
                ) : '0'}
            </div>
          </Marker>
        ))}
      </Map>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-base-100 p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>In Billing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Out of Billing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Suspended</span>
          </div>
          <div className="text-xs mt-2 text-base-content/70">
            Circle size = Data usage
          </div>
        </div>
      </div>
      
      {filteredData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-100/80">
          <div className="text-center text-base-content/60">
            No projects to display on map
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;