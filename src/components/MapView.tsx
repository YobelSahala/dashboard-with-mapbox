import { useMemo, useEffect, useState, useRef } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl';
import type { LayerProps, MapRef } from 'react-map-gl';
import { useFilterStore } from '../store/useFilterStore';
import { loadCSVData } from '../utils/csvLoader';
import type { DataUsageRecord } from '../types/data';

// Import CSV file as text
import csvData from '../../data.csv?raw';

const MapView = () => {
  const { category, status, search, apn } = useFilterStore();
  const [data, setData] = useState<DataUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const parsedData = await loadCSVData(csvData);
        setData(parsedData);
      } catch (err) {
        console.error('❌ Failed to load CSV for map:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesCategory = !category || record.region === category;
      const matchesStatus = !status || record.current_billing_status === status;
      const matchesApn = !apn || record.apn_name === apn;
      const matchesSearch = !search ||
        (record.msisdn && record.msisdn.toString().toLowerCase().includes(search.toLowerCase())) ||
        (record.kelurahan && record.kelurahan.toString().toLowerCase().includes(search.toLowerCase())) ||
        (record.kecamatan && record.kecamatan.toString().toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesStatus && matchesApn && matchesSearch;
    });
  }, [data, category, status, apn, search]);

  // Calculate center point of visible markers
  const mapCenter = useMemo(() => {
    if (filteredData.length === 0) {
      return { lat: -6.2088, lng: 106.8456 }; // Jakarta, Indonesia
    }
    
    const avgLat = filteredData.reduce((sum, project) => sum + project.latitude, 0) / filteredData.length;
    const avgLng = filteredData.reduce((sum, project) => sum + project.longitude, 0) / filteredData.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [filteredData]);

  // Convert filtered data to GeoJSON for clustering
  const geoJsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredData.map((record, index) => ({
      type: 'Feature' as const,
      properties: {
        id: `${record.msisdn}-${index}`,
        msisdn: record.msisdn,
        data_usage: record.data_usage_raw_total || 0,
        billing_status: record.current_billing_status,
        location: record.kelurahan,
        region: record.region
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [record.longitude, record.latitude]
      }
    }))
  }), [filteredData]);

  // Cluster layer styles
  const clusterLayer: LayerProps = {
    id: 'clusters',
    type: 'circle',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        10,
        '#e49a4c',
        30,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        15,
        10,
        20,
        30,
        25
      ]
    }
  };

  const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#ffffff'
    }
  };

  const unclusteredPointLayer: LayerProps = {
    id: 'unclustered-point',
    type: 'circle',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'billing_status'], 'IN-BILLING'], '#10b981',
        ['==', ['get', 'billing_status'], 'IN-TESTING'], '#3b82f6',
        ['==', ['get', 'billing_status'], 'SUSPENDED'], '#ef4444',
        ['==', ['get', 'billing_status'], 'RETIRED'], '#6b7280',
        '#6b7280'
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'data_usage'],
        0, 8,
        1000000, 20
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  };

  // Handle cluster click to zoom in
  const onClusterClick = (event: any) => {
    const feature = event.features?.[0];
    if (!feature || !mapRef.current) return;

    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current.getSource('data-usage') as any;

    mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
      if (err || !mapRef.current) return;

      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500
      });
    });
  };

  // Handle mouse events for popup
  const onMouseEnter = (event: any) => {
    const feature = event.features?.[0];
    if (feature && !feature.properties.cluster_id) {
      setPopupInfo({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        properties: feature.properties
      });
    }
  };

  const onMouseLeave = () => {
    setPopupInfo(null);
  };

  if (loading) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <div className="mt-4 text-sm text-base-content/70">
            Loading map data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
        initialViewState={{
          longitude: mapCenter.lng,
          latitude: mapCenter.lat,
          zoom: 6
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClusterClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Source
          id="data-usage"
          type="geojson"
          data={geoJsonData}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Hover Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            className="popup"
          >
            <div className="p-3 text-sm min-w-[200px]">
              <div className="font-semibold text-base-content mb-2">
                Usage Details
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-base-content/70">MSISDN:</span>
                  <span className="font-medium">{popupInfo.properties.msisdn}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/70">Data Usage:</span>
                  <span className="font-medium">
                    {(popupInfo.properties.data_usage / 1024 / 1024).toFixed(4)} MB
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/70">Status:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    popupInfo.properties.billing_status === 'IN-BILLING' ? 'bg-green-100 text-green-800' :
                    popupInfo.properties.billing_status === 'IN-TESTING' ? 'bg-blue-100 text-blue-800' :
                    popupInfo.properties.billing_status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {popupInfo.properties.billing_status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/70">Location:</span>
                  <span className="font-medium">{popupInfo.properties.location}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/70">Region:</span>
                  <span className="font-medium">{popupInfo.properties.region}</span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Legend */}
      <div className="absolute top-16 left-7 bg-base-100 p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>In Billing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>In Testing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Suspended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Retired</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-base-content/70">
            Circle size = Data usage
          </div>
          <div className="text-xs text-base-content/70">
            Click clusters to zoom in
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