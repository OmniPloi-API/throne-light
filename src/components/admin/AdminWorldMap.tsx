'use client';

import { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion, AnimatePresence } from 'framer-motion';

// World map TopoJSON
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface SaleLocation {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  count: number;
  totalAmount: number;
}

interface ReaderLocation {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  count: number;
  readers: Array<{
    id: string;
    email: string | null;
    section: string | null;
    page: number;
  }>;
}

interface MapData {
  sales: SaleLocation[];
  readers: ReaderLocation[];
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalActiveReaders: number;
    uniqueCountries: number;
    salesLocations: number;
    readerLocations: number;
  };
}

interface TooltipData {
  x: number;
  y: number;
  content: {
    city: string;
    country: string;
    count: number;
    type: 'sale' | 'reader';
    details?: string;
  };
}

// Gold color palette
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4E4BC';
const GOLD_DARK = '#8B7355';

const AdminWorldMap = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [viewMode, setViewMode] = useState<'sales' | 'readers'>('sales');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  // Fetch map data
  const fetchMapData = async () => {
    try {
      const res = await fetch('/api/admin/map-data');
      const data = await res.json();
      setMapData(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(fetchMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scale for marker sizes
  const saleScale = scaleLinear()
    .domain([1, Math.max(...(mapData?.sales.map(s => s.count) || [1]), 10)])
    .range([4, 20]);

  const readerScale = scaleLinear()
    .domain([1, Math.max(...(mapData?.readers.map(r => r.count) || [1]), 5)])
    .range([6, 24]);

  const handleMarkerHover = (
    event: React.MouseEvent,
    location: SaleLocation | ReaderLocation,
    type: 'sale' | 'reader'
  ) => {
    const rect = (event.target as Element).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: {
        city: location.city,
        country: location.country,
        count: location.count,
        type,
        details: type === 'sale' 
          ? `$${(location as SaleLocation).totalAmount.toFixed(2)} revenue`
          : `${(location as ReaderLocation).readers.length} active reader(s)`
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-onyx rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gold/60">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-onyx rounded-xl overflow-hidden border border-gold/20">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-onyx via-onyx/90 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <span className="text-3xl">👑</span>
              Throne Light Command Center
            </h2>
            <p className="text-parchment/50 text-sm mt-1">Global Reach Visualization</p>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex items-center gap-2 bg-charcoal/50 rounded-full p-1">
            <button
              onClick={() => setViewMode('sales')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'sales'
                  ? 'bg-gold text-onyx'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              💰 Total Sales
            </button>
            <button
              onClick={() => setViewMode('readers')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'readers'
                  ? 'bg-gold text-onyx'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Users
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-2">
        <div className="bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/20">
          <p className="text-parchment/50 text-xs uppercase tracking-wider">
            {viewMode === 'sales' ? 'Total Sales' : 'Active Readers'}
          </p>
          <p className="text-2xl font-bold text-gold">
            {viewMode === 'sales' 
              ? mapData?.summary.totalSales || 0
              : mapData?.summary.totalActiveReaders || 0
            }
          </p>
        </div>
        <div className="bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/20">
          <p className="text-parchment/50 text-xs uppercase tracking-wider">Countries</p>
          <p className="text-2xl font-bold text-gold">{mapData?.summary.uniqueCountries || 0}</p>
        </div>
        {viewMode === 'sales' && (
          <div className="bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/20">
            <p className="text-parchment/50 text-xs uppercase tracking-wider">Revenue</p>
            <p className="text-2xl font-bold text-gold">
              ${(mapData?.summary.totalRevenue || 0).toFixed(0)}
            </p>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.5, 8))}
          className="w-10 h-10 bg-charcoal/80 backdrop-blur-sm rounded-lg border border-gold/20 text-gold hover:bg-gold/20 transition-colors flex items-center justify-center text-xl"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z / 1.5, 1))}
          className="w-10 h-10 bg-charcoal/80 backdrop-blur-sm rounded-lg border border-gold/20 text-gold hover:bg-gold/20 transition-colors flex items-center justify-center text-xl"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([0, 20]); }}
          className="w-10 h-10 bg-charcoal/80 backdrop-blur-sm rounded-lg border border-gold/20 text-gold hover:bg-gold/20 transition-colors flex items-center justify-center text-xs"
        >
          Reset
        </button>
      </div>

      {/* Map */}
      <div className="w-full h-[600px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 150,
            center: [0, 20]
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ coordinates, zoom: newZoom }) => {
              setCenter(coordinates as [number, number]);
              setZoom(newZoom);
            }}
          >
            {/* Continents with Gold Borders */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="transparent"
                    stroke={GOLD}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: `${GOLD}15` },
                      pressed: { outline: 'none' }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Sale Markers (Static Gold Circles) */}
            {viewMode === 'sales' && mapData?.sales.map((sale, i) => (
              <Marker
                key={`sale-${i}`}
                coordinates={[sale.longitude, sale.latitude]}
                onMouseEnter={(e) => handleMarkerHover(e, sale, 'sale')}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle
                  r={saleScale(sale.count)}
                  fill={GOLD}
                  fillOpacity={0.6}
                  stroke={GOLD_LIGHT}
                  strokeWidth={1}
                  className="cursor-pointer transition-all hover:fill-opacity-100"
                />
              </Marker>
            ))}

            {/* Reader Markers (Pulsing Beacons) */}
            {viewMode === 'readers' && mapData?.readers.map((reader, i) => (
              <Marker
                key={`reader-${i}`}
                coordinates={[reader.longitude, reader.latitude]}
                onMouseEnter={(e) => handleMarkerHover(e, reader, 'reader')}
                onMouseLeave={() => setTooltip(null)}
              >
                <g className="cursor-pointer">
                  {/* Outer pulse ring */}
                  <circle
                    r={readerScale(reader.count) + 8}
                    fill="none"
                    stroke={GOLD}
                    strokeWidth={2}
                    className="animate-ping-slow"
                    opacity={0.4}
                  />
                  {/* Middle pulse ring */}
                  <circle
                    r={readerScale(reader.count) + 4}
                    fill="none"
                    stroke={GOLD}
                    strokeWidth={1.5}
                    className="animate-ping-slower"
                    opacity={0.6}
                  />
                  {/* Core beacon */}
                  <circle
                    r={readerScale(reader.count)}
                    fill={GOLD}
                    fillOpacity={0.9}
                    stroke={GOLD_LIGHT}
                    strokeWidth={2}
                    className="drop-shadow-gold"
                  />
                  {/* Center glow */}
                  <circle
                    r={readerScale(reader.count) / 2}
                    fill={GOLD_LIGHT}
                    fillOpacity={0.8}
                  />
                </g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-charcoal border border-gold/30 rounded-lg px-4 py-3 shadow-2xl">
              <p className="text-gold font-semibold">{tooltip.content.city}</p>
              <p className="text-parchment/60 text-sm">{tooltip.content.country}</p>
              <div className="mt-2 pt-2 border-t border-gold/20">
                <p className="text-parchment text-sm">
                  {tooltip.content.type === 'sale' ? '💰' : '📖'} {tooltip.content.count} {tooltip.content.type === 'sale' ? 'sale(s)' : 'reader(s)'}
                </p>
                {tooltip.content.details && (
                  <p className="text-gold/80 text-xs mt-1">{tooltip.content.details}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gold/20">
        <p className="text-parchment/50 text-xs uppercase tracking-wider mb-2">Legend</p>
        <div className="flex items-center gap-4">
          {viewMode === 'sales' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold/60" />
                <span className="text-parchment/80 text-xs">1-5 sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gold/60" />
                <span className="text-parchment/80 text-xs">10+ sales</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-40" />
                  <div className="absolute inset-1 rounded-full bg-gold" />
                </div>
                <span className="text-parchment/80 text-xs">Active Reader</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-ping-slower {
          animation: ping-slower 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.5s;
        }
        
        .drop-shadow-gold {
          filter: drop-shadow(0 0 8px ${GOLD}80);
        }
      `}</style>
    </div>
  );
};

export default memo(AdminWorldMap);
