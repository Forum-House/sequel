'use client';
import { Navbar } from '@/components/shared';
import { Button } from '@/components/ui';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Copy,
  Cpu,
  Database,
  Globe,
  Link as LinkIcon,
  MoreVertical,
  MousePointerClick,
  Server,
  Terminal,
  Zap,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Lazy load charts
const TrafficChart = lazy(() =>
  import('@/components/analytics/traffic-chart').then((mod) => ({ default: mod.TrafficChart }))
);
const GeoChart = lazy(() =>
  import('@/components/analytics/geo-chart').then((mod) => ({ default: mod.GeoChart }))
);

const trafficData = [
  { name: 'Mon', clicks: 4000 },
  { name: 'Tue', clicks: 3000 },
  { name: 'Wed', clicks: 5000 },
  { name: 'Thu', clicks: 2780 },
  { name: 'Fri', clicks: 8900 },
  { name: 'Sat', clicks: 2390 },
  { name: 'Sun', clicks: 3490 },
];

const geoData = [
  { name: 'US', value: 400 },
  { name: 'UK', value: 300 },
  { name: 'DE', value: 300 },
  { name: 'IN', value: 200 },
];

const initialOpsData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  latency: 40 + Math.random() * 20,
  errors: Math.random() > 0.8 ? Math.random() * 5 : 0,
}));

function ChartSkeleton() {
  return <div className="w-full h-full bg-black/[0.02] animate-pulse rounded-sm" />;
}

type TabType = 'analytics' | 'operations';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [opsData, setOpsData] = useState(initialOpsData);
  const [status, setStatus] = useState('HEALTHY');
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'warn' | 'error' | 'success' }[]>([
    { msg: '[12:00:00] System initialized', type: 'success' },
    { msg: '[12:00:05] All nodes healthy', type: 'success' },
  ]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success') => {
    setLogs((prev) => [...prev, { msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }].slice(-6));
  };

  const triggerSpike = () => {
    setStatus('DEGRADED');
    addLog('Traffic spike initiated', 'warn');
    const newData = [
      ...opsData.slice(1),
      {
        time: opsData[opsData.length - 1].time + 1,
        latency: 300 + Math.random() * 200,
        errors: 10 + Math.random() * 5,
      },
    ];
    setOpsData(newData);
    setTimeout(() => {
      setStatus('HEALTHY');
      addLog('System recovered', 'success');
    }, 5000);
  };

  const killDB = () => {
    setStatus('OUTAGE');
    addLog('Database terminated', 'error');
    const newData = [
      ...opsData.slice(1),
      {
        time: opsData[opsData.length - 1].time + 1,
        latency: 0,
        errors: 100,
      },
    ];
    setOpsData(newData);
    setTimeout(() => {
      setStatus('HEALTHY');
      addLog('Connection restored', 'success');
    }, 8000);
  };

  useEffect(() => {
    if (status === 'HEALTHY' && activeTab === 'operations') {
      const interval = setInterval(() => {
        setOpsData((prev) => [
          ...prev.slice(1),
          {
            time: prev[prev.length - 1].time + 1,
            latency: 40 + Math.random() * 20,
            errors: Math.random() > 0.9 ? Math.random() * 2 : 0,
          },
        ]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, activeTab]);

  const currentLatency = opsData[opsData.length - 1]?.latency?.toFixed(0) || '0';
  const currentErrors = opsData[opsData.length - 1]?.errors?.toFixed(2) || '0';

  return (
    <main 
      className="min-h-screen flex flex-col relative"
      style={{
        background: activeTab === 'analytics' 
          ? 'linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)'
          : 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className={`absolute inset-0 ${activeTab === 'analytics' ? 'opacity-[0.015]' : 'opacity-[0.025]'}`} style={{
        backgroundImage: activeTab === 'analytics'
          ? `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
             repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
          : `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px),
             repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)`
      }} />

      <Navbar />
      <div className="relative flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className={`inline-block ${activeTab === 'analytics' ? 'bg-black' : 'bg-white'} px-4 py-1.5 mb-3`}>
              <span className={`text-[9px] font-semibold tracking-[0.25em] ${activeTab === 'analytics' ? 'text-white/70' : 'text-black/70'} uppercase`}>
                Dashboard
              </span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-heading font-bold tracking-tight ${activeTab === 'analytics' ? 'text-black' : 'text-white'}`}>
              Sequel Dashboard
            </h1>
          </div>
          
          {/* Tab Switcher */}
          <div className={`flex rounded-sm overflow-hidden border ${activeTab === 'analytics' ? 'border-black/10' : 'border-white/10'}`}>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-black text-white'
                  : activeTab === 'operations' 
                    ? 'bg-white/5 text-white/60 hover:bg-white/10'
                    : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'operations'
                  ? 'bg-white text-black'
                  : activeTab === 'analytics'
                    ? 'bg-black/5 text-black/60 hover:bg-black/10'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Activity className="w-4 h-4" />
              Operations
            </button>
          </div>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <>
            {/* Create Link Input */}
            <div className="flex w-full gap-3">
              <div className="flex-1 flex items-center px-4 bg-white border-2 border-black/8 rounded-sm hover:border-black/20 transition-colors">
                <LinkIcon className="w-4 h-4 text-black/30 mr-3" />
                <input
                  type="url"
                  placeholder="Create new link..."
                  className="w-full bg-transparent py-2.5 outline-none text-sm placeholder:text-black/30"
                />
              </div>
              <Button variant="dark" className="text-xs px-5 py-2.5 font-semibold">Create</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Clicks', value: '124,592', icon: MousePointerClick, trend: '+12.5%' },
                { label: 'Unique Visitors', value: '84,201', icon: Globe, trend: '+5.2%' },
                { label: 'Avg. CTR', value: '24.8%', icon: ArrowUpRight, trend: '+2.1%' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-black/6 p-6 rounded-sm hover:border-black/15 hover:shadow-lg transition-all cursor-default group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-sm">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-black/40 uppercase tracking-[0.15em] mb-1">{stat.label}</div>
                  <div className="text-2xl md:text-3xl font-black tracking-tight">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white border border-black/6 p-6 rounded-sm hover:shadow-lg transition-all">
                <h3 className="text-sm font-bold mb-5 tracking-tight">Traffic Overview</h3>
                <div className="h-56">
                  <Suspense fallback={<ChartSkeleton />}>
                    <TrafficChart data={trafficData} />
                  </Suspense>
                </div>
              </div>
              <div className="bg-white border border-black/6 p-6 rounded-sm hover:shadow-lg transition-all">
                <h3 className="text-sm font-bold mb-5 tracking-tight">Top Locations</h3>
                <div className="h-56">
                  <Suspense fallback={<ChartSkeleton />}>
                    <GeoChart data={geoData} />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Links Table */}
            <div className="bg-white border border-black/6 rounded-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-tight">Recent Links</h3>
                <Button variant="ghost" size="sm" className="text-xs text-black/50 hover:text-black font-semibold">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-black/[0.02]">
                      <th className="px-6 py-3 text-xs font-semibold text-black/50 uppercase tracking-[0.1em]">Short Link</th>
                      <th className="px-6 py-3 text-xs font-semibold text-black/50 uppercase tracking-[0.1em]">Original URL</th>
                      <th className="px-6 py-3 text-xs font-semibold text-black/50 uppercase tracking-[0.1em]">Clicks</th>
                      <th className="px-6 py-3 text-xs font-semibold text-black/50 uppercase tracking-[0.1em]">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        short: 'sequel.link/launch',
                        orig: 'https://example.com/campaign-2026',
                        clicks: '45.2k',
                        status: 'Active',
                      },
                      {
                        short: 'sequel.link/docs',
                        orig: 'https://docs.example.com/v2',
                        clicks: '12.8k',
                        status: 'Active',
                      },
                      {
                        short: 'sequel.link/promo',
                        orig: 'https://example.com/special-offer',
                        clicks: '8.4k',
                        status: 'Expired',
                      },
                    ].map((link) => (
                      <tr
                        key={link.short}
                        className="border-b border-black/[0.03] hover:bg-black/[0.015] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold flex items-center gap-3">
                          {link.short}
                          <Copy className="w-3.5 h-3.5 cursor-pointer text-black/20 hover:text-black/70 transition-colors" />
                        </td>
                        <td className="px-6 py-4 text-sm text-black/45 truncate max-w-xs">{link.orig}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{link.clicks}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                              link.status === 'Active' 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-black/[0.04] text-black/35'
                            }`}
                          >
                            {link.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="p-1.5 hover:bg-black/[0.05] rounded-sm transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-black/30" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Operations Tab Content */}
        {activeTab === 'operations' && (
          <>
            {/* Status Bar */}
            <div 
              className="flex flex-wrap justify-center gap-10 p-6 rounded-sm"
              style={{
                background: 'linear-gradient(145deg, #0d0d0d 0%, #080808 100%)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'HEALTHY' ? 'bg-green-400 animate-pulse' : 
                  status === 'DEGRADED' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400 animate-pulse'
                }`} />
                <span className="text-xs font-mono text-white/50">STATUS</span>
                <span className={`text-sm font-bold ${
                  status === 'HEALTHY' ? 'text-green-400' : 
                  status === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
                }`}>{status}</span>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Nodes</div>
                <div className="text-base font-bold text-white/85 font-mono">24/24</div>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Uptime</div>
                <div className="text-base font-bold text-white/85 font-mono">99.99%</div>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">P99</div>
                <div className="text-base font-bold text-white/85 font-mono">{currentLatency}ms</div>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Errors</div>
                <div className="text-base font-bold text-white/85 font-mono">{currentErrors}%</div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Charts Column */}
              <div className="lg:col-span-2 space-y-5">
                {/* Latency Chart */}
                <div 
                  className="p-6 rounded-sm"
                  style={{
                    background: 'linear-gradient(145deg, #0a0a0a 0%, #050505 100%)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-semibold flex items-center gap-2 text-white/50 uppercase tracking-wider">
                      <Activity className="w-4 h-4" /> Latency
                    </h3>
                    <span className="text-xl font-mono font-bold text-white/85">{currentLatency}<span className="text-xs text-white/35 ml-1">ms</span></span>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={opsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} width={30} />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            fontSize: '10px',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="latency"
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Error Rate Chart */}
                <div 
                  className="p-6 rounded-sm"
                  style={{
                    background: 'linear-gradient(145deg, #0a0a0a 0%, #050505 100%)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-semibold flex items-center gap-2 text-white/50 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" /> Error Rate
                    </h3>
                    <span className="text-xl font-mono font-bold text-red-400">{currentErrors}<span className="text-xs text-white/35 ml-1">%</span></span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={opsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} width={30} />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Line
                          type="step"
                          dataKey="errors"
                          stroke="rgba(248,113,113,0.7)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Controls & Logs Column */}
              <div className="space-y-5">
                {/* Chaos Controls */}
                <div 
                  className="p-6 rounded-sm"
                  style={{
                    background: 'linear-gradient(145deg, #0d0d0d 0%, #080808 100%)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <h3 className="text-xs font-semibold mb-2 text-white/60 flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="w-4 h-4" /> Chaos Controls
                  </h3>
                  <p className="text-xs text-white/30 mb-6">
                    Inject failures to test system resilience
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={triggerSpike}
                      className="w-full bg-white/[0.03] border border-white/10 text-white/70 py-3 text-xs font-semibold hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2.5 rounded-sm group"
                    >
                      <Cpu className="w-4 h-4 group-hover:text-yellow-400" /> SPIKE TRAFFIC
                    </button>
                    <button
                      type="button"
                      onClick={killDB}
                      className="w-full bg-white/[0.01] border border-white/6 text-white/50 py-3 text-xs font-semibold hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-2.5 rounded-sm group"
                    >
                      <Database className="w-4 h-4" /> KILL DATABASE
                    </button>
                  </div>
                </div>

                {/* Event Log */}
                <div 
                  className="p-6 rounded-sm flex flex-col"
                  style={{
                    background: 'linear-gradient(145deg, #0a0a0a 0%, #050505 100%)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    minHeight: '260px'
                  }}
                >
                  <h3 className="text-xs font-semibold mb-4 flex items-center gap-2 text-white/50 uppercase tracking-wider">
                    <Terminal className="w-4 h-4" /> Event Log
                  </h3>
                  <div 
                    className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 rounded-sm"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2.5 ${
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'warn' ? 'text-yellow-400' :
                          log.type === 'success' ? 'text-green-400' :
                          'text-white/55'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                          log.type === 'error' ? 'bg-red-400' :
                          log.type === 'warn' ? 'bg-yellow-400' :
                          log.type === 'success' ? 'bg-green-400' :
                          'bg-white/55'
                        }`} />
                        {log.msg}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div 
                  className="p-6 rounded-sm"
                  style={{
                    background: 'linear-gradient(145deg, #0a0a0a 0%, #050505 100%)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <h3 className="text-xs font-semibold mb-5 flex items-center gap-2 text-white/50 uppercase tracking-wider">
                    <Server className="w-4 h-4" /> Infrastructure
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'CPU Usage', value: '23%', bar: 23 },
                      { label: 'Memory', value: '4.2GB', bar: 42 },
                      { label: 'Connections', value: '1.2k', bar: 60 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/35">{item.label}</span>
                          <span className="text-white/70 font-mono font-semibold">{item.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white/25 rounded-full transition-all"
                            style={{ width: `${item.bar}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
