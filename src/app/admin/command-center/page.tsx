'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Globe, Users, DollarSign, MapPin } from 'lucide-react';

// Dynamic import to avoid SSR issues with react-simple-maps
const AdminWorldMap = dynamic(
  () => import('@/components/admin/AdminWorldMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-onyx rounded-xl flex items-center justify-center border border-gold/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gold/60">Loading Command Center...</p>
        </div>
      </div>
    )
  }
);

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function CommandCenterPage() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/map-data');
      const data = await res.json();
      
      setStats([
        {
          label: 'Total Sales',
          value: data.summary?.totalSales || 0,
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          label: 'Active Readers',
          value: data.summary?.totalActiveReaders || 0,
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: 'Countries Reached',
          value: data.summary?.uniqueCountries || 0,
          icon: <Globe className="w-5 h-5" />,
        },
        {
          label: 'Total Revenue',
          value: `$${(data.summary?.totalRevenue || 0).toLocaleString()}`,
          icon: <MapPin className="w-5 h-5" />,
        },
      ]);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-onyx text-parchment">
      {/* Header */}
      <div className="border-b border-gold/20 bg-charcoal/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-gold flex items-center gap-3">
                <span className="text-4xl">🌍</span>
                Command Center
              </h1>
              <p className="text-parchment/50 mt-1">
                Real-time global visualization of ThroneLight reach
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-parchment/40 text-sm">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-charcoal/50 border border-gold/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg text-gold">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-parchment/50 text-xs uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* World Map */}
        <AdminWorldMap />

        {/* Instructions */}
        <div className="mt-6 bg-charcoal/30 border border-gold/10 rounded-xl p-6">
          <h3 className="text-gold font-semibold mb-3">📍 How to Use</h3>
          <div className="grid md:grid-cols-2 gap-4 text-parchment/70 text-sm">
            <div>
              <p className="font-medium text-parchment mb-1">Toggle Views:</p>
              <p>Switch between "Total Sales" (static gold circles) and "Live Users" (pulsing beacons) using the toggle at the top right of the map.</p>
            </div>
            <div>
              <p className="font-medium text-parchment mb-1">Interact:</p>
              <p>Hover over any marker to see location details. Use scroll or the +/- buttons to zoom. Click and drag to pan around the map.</p>
            </div>
            <div>
              <p className="font-medium text-parchment mb-1">Live Updates:</p>
              <p>The map auto-refreshes every 30 seconds. Reader locations update in real-time as people access the ThroneLight Reader.</p>
            </div>
            <div>
              <p className="font-medium text-parchment mb-1">Location Data:</p>
              <p>Locations are determined by IP geolocation for readers and shipping/billing address for sales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
