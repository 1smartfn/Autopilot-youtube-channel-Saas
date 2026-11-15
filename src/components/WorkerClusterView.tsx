import React, { useState } from 'react';
import { 
  Cpu, 
  Server, 
  Activity, 
  Clock, 
  Zap, 
  Layers, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  RotateCw,
  HardDrive
} from 'lucide-react';
import { WorkerNode, PipelineItem } from '../types';
import { ComponentTag } from './ComponentTag';

interface WorkerClusterViewProps {
  cluster: WorkerNode[];
  activeQueue: PipelineItem[];
  concurrencyLimit: number;
}

export const WorkerClusterView: React.FC<WorkerClusterViewProps> = ({
  cluster,
  activeQueue,
  concurrencyLimit
}) => {
  const [nodes, setNodes] = useState<WorkerNode[]>(cluster);
  const [isAddingNode, setIsAddingNode] = useState(false);

  const totalSlots = nodes.reduce((acc, n) => acc + n.maxSlots, 0);
  const busySlots = nodes.reduce((acc, n) => acc + n.activeJobs, 0);

  const handleAddWorker = () => {
    setIsAddingNode(true);
    setTimeout(() => {
      const newNode: WorkerNode = {
        id: `worker-asia-east-1-${Date.now().toString().slice(-3)}`,
        region: 'ap-southeast-1 (Singapore)',
        specs: '4x NVIDIA L40S 48GB Cloud Pod',
        status: 'online',
        currentLoadPercent: 12,
        activeJobs: 0,
        maxSlots: 4,
        completedToday: 0,
        avgRenderSpeed: '1.1x real-time'
      };
      setNodes([...nodes, newNode]);
      setIsAddingNode(false);
    }, 1200);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Cluster Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <ComponentTag id="SEC-WORKERS-HEADER" name="Worker Cluster Telemetry Header" category="section" size="xs" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Distributed GPU Worker Nodes & Render Farm
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Multi-node cluster dedicated to real-time Wan 2.1 open-source neural frame generation, audio synthesis, and ffmpeg encoding (100% Free & Open-Source, Zero API Billing).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddWorker}
            disabled={isAddingNode}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition disabled:opacity-50"
          >
            {isAddingNode ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            <span>Provision Worker Node</span>
          </button>
        </div>
      </div>

      {/* Cluster Key Performance Metrics */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-WORKERS-METRICS" name="GPU Cluster Performance Metrics Grid" category="metric" size="xs" />
          <span className="text-[11px] font-mono text-zinc-400">Telemetry Counters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Cluster Capacity</span>
            <Server className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{busySlots}</span>
            <span className="text-xs text-zinc-500">/ {totalSlots} active render slots</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
              style={{ width: `${(busySlots / totalSlots) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Your Concurrency Cap</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{concurrencyLimit}</span>
            <span className="text-xs text-zinc-400">concurrent jobs allowed</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">Tier: PRO (Upgrade to Agency for 16 slots)</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Queue Depth</span>
            <Clock className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{activeQueue.length}</span>
            <span className="text-xs text-zinc-400">jobs pending / rendering</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-400">Average wait latency: ~3.2 minutes</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Cluster Health</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">99.98%</span>
            <span className="text-xs text-zinc-400">uptime</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">3 nodes operational across 3 regions</p>
        </div>
      </div>
      </div>

      {/* Worker Nodes Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-WORKERS-NODES-GRID" name="Active Cluster GPU Node Cards" category="card" size="xs" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Active Cluster Nodes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => {
            return (
              <div 
                key={node.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{node.id}</span>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                    {node.region}
                  </span>
                </div>

                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Hardware Acceleration</span>
                  <span className="font-mono text-zinc-300 text-[11px]">{node.specs}</span>
                </div>

                {/* Load Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">GPU Compute Load</span>
                    <span className="font-mono text-cyan-400 font-semibold">{node.currentLoadPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${node.currentLoadPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span>Active slots: <strong className="text-white">{node.activeJobs}</strong>/{node.maxSlots}</span>
                  <span>Render Speed: <strong className="text-emerald-400">{node.avgRenderSpeed}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Concurrent Queue Management Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ComponentTag id="CARD-WORKERS-JOB-STREAM" name="Live GPU Job Queue Allocation Stream" category="card" size="xs" />
              <h3 className="text-sm font-semibold text-white">Live Job Queue & Worker Allocation</h3>
            </div>
            <p className="text-xs text-zinc-400">Prioritized job execution with automatic load balancing</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Active: {activeQueue.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Worker Node</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
              {activeQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No jobs currently queued. Run the Autopilot Studio to enqueue automated video renders!
                  </td>
                </tr>
              ) : (
                activeQueue.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-white">{job.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                        HIGH (PRO)
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-zinc-200 max-w-[220px] truncate">
                      {job.topic}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">
                      {job.workerId || 'worker-us-east-1'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-amber-300">
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${job.renderProgress || 35}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400">{job.renderProgress || 35}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {job.renderProgress > 80 ? '< 30 sec' : '~2.5 min'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>
    </div>
  );
};
