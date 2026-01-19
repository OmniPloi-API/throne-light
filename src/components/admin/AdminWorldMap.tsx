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
    type: 'sale' | 'reader' | 'country' | 'revenue';
    details?: string;
  };
}

// View modes for the stat cards
type ViewMode = 'all' | 'sales' | 'readers' | 'countries' | 'revenue';

// Gold color palette
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4E4BC';
const GOLD_DARK = '#8B7355';
const GREEN = '#4ADE80';
const BLUE = '#60A5FA';
const PURPLE = '#A78BFA';

const AdminWorldMap = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  // Load saved filter preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('admin-map-view-mode');
    if (savedViewMode === 'sales' || savedViewMode === 'readers' || savedViewMode === 'all' || savedViewMode === 'countries' || savedViewMode === 'revenue') {
      setViewMode(savedViewMode as ViewMode);
    }
  }, []);

  // Save filter preference when it changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('admin-map-view-mode', mode);
  };

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
    .domain([1, Math.max(...(mapData?.sales?.map(s => s.count) || [1]), 10)])
    .range([4, 20]);

  const readerScale = scaleLinear()
    .domain([1, Math.max(...(mapData?.readers?.map(r => r.count) || [1]), 5)])
    .range([6, 24]);

  const handleMarkerHover = (
    event: React.MouseEvent,
    location: SaleLocation | ReaderLocation,
    type: 'sale' | 'reader' | 'country' | 'revenue'
  ) => {
    const rect = (event.target as Element).getBoundingClientRect();
    let details = '';
    
    if (type === 'sale') {
      details = `${location.count} sale(s) from this city`;
    } else if (type === 'reader') {
      details = `${(location as ReaderLocation).readers.length} active reader(s)`;
    } else if (type === 'country') {
      details = `Readers in ${location.country}`;
    } else if (type === 'revenue') {
      details = `$${(location as SaleLocation).totalAmount.toFixed(2)} earned`;
    }
    
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: {
        city: location.city,
        country: location.country,
        count: location.count,
        type,
        details
      }
    });
  };
  
  // Get unique countries from sales, readers, AND countriesData from API
  const getUniqueCountries = () => {
    if (!mapData) return [];
    const countryMap = new Map<string, { country: string; countryCode: string; latitude: number; longitude: number; readerCount: number; salesCount: number; visitorCount: number }>();
    
    // First, add all countries from the API's countriesData (from tracking events)
    // This is the most comprehensive source since it tracks all page views
    if ((mapData as any).countriesData) {
      (mapData as any).countriesData.forEach((c: any) => {
        countryMap.set(c.country, {
          country: c.country,
          countryCode: c.countryCode,
          latitude: c.latitude,
          longitude: c.longitude,
          readerCount: 0,
          salesCount: c.saleCount || 0,
          visitorCount: c.visitorCount || 0
        });
      });
    }
    
    // Add reader locations
    (mapData.readers || []).forEach(r => {
      const existing = countryMap.get(r.country);
      if (existing) {
        existing.readerCount += r.count;
      } else {
        countryMap.set(r.country, {
          country: r.country,
          countryCode: r.countryCode,
          latitude: r.latitude,
          longitude: r.longitude,
          readerCount: r.count,
          salesCount: 0,
          visitorCount: 0
        });
      }
    });
    
    // Add sales locations
    (mapData.sales || []).forEach(s => {
      const existing = countryMap.get(s.country);
      if (existing) {
        existing.salesCount += s.count;
      } else {
        countryMap.set(s.country, {
          country: s.country,
          countryCode: s.countryCode,
          latitude: s.latitude,
          longitude: s.longitude,
          readerCount: 0,
          salesCount: s.count,
          visitorCount: 0
        });
      }
    });
    
    return Array.from(countryMap.values());
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
            <h2 className="text-2xl font-serif text-gold">
              Global View
            </h2>
            <p className="text-parchment/50 text-sm mt-1">Global Reach Visualization</p>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex items-center gap-1 bg-charcoal/50 rounded-full p-1">
            <button
              onClick={() => handleViewModeChange('all')}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-gold text-onyx'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              🌍 All
            </button>
            <button
              onClick={() => handleViewModeChange('sales')}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'sales'
                  ? 'bg-gold text-onyx'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              💰 Sales
            </button>
            <button
              onClick={() => handleViewModeChange('readers')}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
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
                Live
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar - Clickable Cards */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => handleViewModeChange('sales')}
          className={`bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border transition-all text-left ${
            viewMode === 'sales' 
              ? 'border-gold ring-2 ring-gold/50' 
              : 'border-gold/20 hover:border-gold/50'
          }`}
        >
          <p className="text-parchment/50 text-xs uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-gold">{mapData?.summary.totalSales || 0}</p>
        </button>
        
        <button
          onClick={() => handleViewModeChange('readers')}
          className={`bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border transition-all text-left ${
            viewMode === 'readers' 
              ? 'border-purple-400 ring-2 ring-purple-400/50' 
              : 'border-gold/20 hover:border-purple-400/50'
          }`}
        >
          <p className="text-parchment/50 text-xs uppercase tracking-wider">Active Readers</p>
          <p className="text-2xl font-bold text-purple-400">{mapData?.summary.totalActiveReaders || 0}</p>
        </button>
        
        <button
          onClick={() => handleViewModeChange('countries')}
          className={`bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border transition-all text-left ${
            viewMode === 'countries' 
              ? 'border-blue-400 ring-2 ring-blue-400/50' 
              : 'border-gold/20 hover:border-blue-400/50'
          }`}
        >
          <p className="text-parchment/50 text-xs uppercase tracking-wider">Countries</p>
          <p className="text-2xl font-bold text-blue-400">{mapData?.summary.uniqueCountries || 0}</p>
        </button>
        
        <button
          onClick={() => handleViewModeChange('revenue')}
          className={`bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-2 border transition-all text-left ${
            viewMode === 'revenue' 
              ? 'border-green-400 ring-2 ring-green-400/50' 
              : 'border-gold/20 hover:border-green-400/50'
          }`}
        >
          <p className="text-parchment/50 text-xs uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            ${(mapData?.summary.totalRevenue || 0).toFixed(0)}
          </p>
        </button>
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

            {/* Sale Markers (Gold Circles) - shown for 'sales' and 'all' modes */}
            {(viewMode === 'sales' || viewMode === 'all') && mapData?.sales?.map((sale, i) => (
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

            {/* Reader Markers (Pulsing Purple Beacons) - shown for 'readers' and 'all' modes */}
            {(viewMode === 'readers' || viewMode === 'all') && mapData?.readers?.map((reader, i) => (
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
                    stroke={PURPLE}
                    strokeWidth={2}
                    className="animate-ping-slow"
                    opacity={0.4}
                  />
                  {/* Middle pulse ring */}
                  <circle
                    r={readerScale(reader.count) + 4}
                    fill="none"
                    stroke={PURPLE}
                    strokeWidth={1.5}
                    className="animate-ping-slower"
                    opacity={0.6}
                  />
                  {/* Core beacon */}
                  <circle
                    r={readerScale(reader.count)}
                    fill={PURPLE}
                    fillOpacity={0.9}
                    stroke="#C4B5FD"
                    strokeWidth={2}
                    className="drop-shadow-purple"
                  />
                  {/* Center glow */}
                  <circle
                    r={readerScale(reader.count) / 2}
                    fill="#C4B5FD"
                    fillOpacity={0.8}
                  />
                </g>
              </Marker>
            ))}
            
            {/* Country Markers (Blue Circles) - shown for 'countries' mode */}
            {viewMode === 'countries' && getUniqueCountries().map((country, i) => (
              <Marker
                key={`country-${i}`}
                coordinates={[country.longitude, country.latitude]}
                onMouseEnter={(e) => {
                  const rect = (e.target as Element).getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                    content: {
                      city: '',
                      country: country.country,
                      count: country.readerCount + country.salesCount,
                      type: 'country',
                      details: `${country.readerCount} reader(s), ${country.salesCount} sale(s)`
                    }
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <g className="cursor-pointer">
                  <circle
                    r={12}
                    fill={BLUE}
                    fillOpacity={0.7}
                    stroke="#93C5FD"
                    strokeWidth={2}
                    className="drop-shadow-blue"
                  />
                  <circle
                    r={6}
                    fill="#93C5FD"
                    fillOpacity={0.9}
                  />
                </g>
              </Marker>
            ))}
            
            {/* Revenue Markers (Green Circles with amount) - shown for 'revenue' mode */}
            {viewMode === 'revenue' && mapData?.sales?.filter(s => s.totalAmount > 0).map((sale, i) => (
              <Marker
                key={`revenue-${i}`}
                coordinates={[sale.longitude, sale.latitude]}
                onMouseEnter={(e) => handleMarkerHover(e, sale, 'revenue')}
                onMouseLeave={() => setTooltip(null)}
              >
                <g className="cursor-pointer">
                  {/* Glow effect for revenue */}
                  <circle
                    r={Math.max(8, Math.min(sale.totalAmount / 5, 25))}
                    fill={GREEN}
                    fillOpacity={0.3}
                    className="animate-pulse"
                  />
                  {/* Core circle */}
                  <circle
                    r={Math.max(6, Math.min(sale.totalAmount / 8, 18))}
                    fill={GREEN}
                    fillOpacity={0.8}
                    stroke="#86EFAC"
                    strokeWidth={2}
                    className="drop-shadow-green"
                  />
                  {/* Center */}
                  <circle
                    r={3}
                    fill="#86EFAC"
                    fillOpacity={0.9}
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
              {tooltip.content.city && (
                <p className="text-gold font-semibold">{tooltip.content.city}</p>
              )}
              <p className="text-parchment/60 text-sm">{tooltip.content.country}</p>
              <div className="mt-2 pt-2 border-t border-gold/20">
                <p className="text-parchment text-sm">
                  {tooltip.content.type === 'sale' && '💰'}
                  {tooltip.content.type === 'reader' && '📖'}
                  {tooltip.content.type === 'country' && '🌍'}
                  {tooltip.content.type === 'revenue' && '💵'}
                  {' '}{tooltip.content.details}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Legend based on view mode */}
      <div className="absolute bottom-4 left-4 z-20 bg-charcoal/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gold/20">
        <p className="text-parchment/50 text-xs uppercase tracking-wider mb-2">Legend</p>
        <div className="flex flex-col gap-2">
          {viewMode === 'sales' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold/60" />
                <span className="text-parchment/80 text-xs">Sale Location (by city)</span>
              </div>
              <p className="text-parchment/50 text-xs">Hover to see sale count</p>
            </>
          )}
          {viewMode === 'readers' && (
            <>
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-40" />
                  <div className="absolute inset-1 rounded-full bg-purple-400" />
                </div>
                <span className="text-parchment/80 text-xs">Active Reader (live)</span>
              </div>
              <p className="text-parchment/50 text-xs">Currently reading the book</p>
            </>
          )}
          {viewMode === 'countries' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400/70" />
                <span className="text-parchment/80 text-xs">Country with Readers</span>
              </div>
              <p className="text-parchment/50 text-xs">Hover to see reader count</p>
            </>
          )}
          {viewMode === 'revenue' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-400/80" />
                <span className="text-parchment/80 text-xs">Revenue Location</span>
              </div>
              <p className="text-parchment/50 text-xs">Hover to see amount earned</p>
            </>
          )}
          {viewMode === 'all' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold/60" />
                <span className="text-parchment/80 text-xs">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-40" />
                  <div className="absolute inset-1 rounded-full bg-purple-400" />
                </div>
                <span className="text-parchment/80 text-xs">Active Readers</span>
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
        
        .drop-shadow-green {
          filter: drop-shadow(0 0 8px ${GREEN}80);
        }
        
        .drop-shadow-blue {
          filter: drop-shadow(0 0 8px ${BLUE}80);
        }
        
        .drop-shadow-purple {
          filter: drop-shadow(0 0 8px ${PURPLE}80);
        }
      `}</style>
    </div>
  );
};

export default memo(AdminWorldMap);
