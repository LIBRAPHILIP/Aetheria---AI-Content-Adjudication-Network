import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface NodeArea {
  id: string;
  group: number;
  radius: number;
  region: string;
  label: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

const NODES: NodeArea[] = [
  // Central Hub
  { id: 'hub', group: 0, radius: 24, region: 'Core', label: 'GenLayer Mainnet' },
  // North America Region
  { id: 'na-1', group: 1, radius: 14, region: 'NA-East', label: 'Gemini-Flash' },
  { id: 'na-2', group: 1, radius: 12, region: 'NA-West', label: 'Claude-Juror' },
  { id: 'na-3', group: 1, radius: 10, region: 'NA-Central', label: 'Llama-Edge' },
  // Europe Region
  { id: 'eu-1', group: 2, radius: 16, region: 'EU-Central', label: 'Mistral-Oracle' },
  { id: 'eu-2', group: 2, radius: 10, region: 'EU-West', label: 'Mixtral-Node' },
  // Asia Region
  { id: 'as-1', group: 3, radius: 14, region: 'AS-East', label: 'Deepseek-Audit' },
  { id: 'as-2', group: 3, radius: 10, region: 'AS-South', label: 'Qwen-Validator' },
];

const LINKS: Link[] = [
  { source: 'na-1', target: 'hub', value: 2 },
  { source: 'na-2', target: 'hub', value: 2 },
  { source: 'na-3', target: 'hub', value: 1 },
  { source: 'eu-1', target: 'hub', value: 3 },
  { source: 'eu-2', target: 'hub', value: 1 },
  { source: 'as-1', target: 'hub', value: 2 },
  { source: 'as-2', target: 'hub', value: 1 },
  // Cross-region sync
  { source: 'na-1', target: 'eu-1', value: 1 },
  { source: 'eu-1', target: 'as-1', value: 1 },
];

const REGION_METRICS = [
  { id: 'core', name: 'Core Mainnet', color: 'bg-[#6366f1]', cases: 'Total Protocol Hub', stake: 'Shared TVL' },
  { id: 'na', name: 'North America', color: 'bg-[#10b981]', cases: '124,530 resolved', stake: '14.5M GEN Staked' },
  { id: 'eu', name: 'Europe', color: 'bg-[#f43f5e]', cases: '98,211 resolved', stake: '9.2M GEN Staked' },
  { id: 'asia', name: 'Asia Pacific', color: 'bg-[#f59e0b]', cases: '156,092 resolved', stake: '18.1M GEN Staked' },
];

export default function ValidatorNodeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>('all');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Clear old svg if it exists
    d3.select(container).selectAll('*').remove();

    let width = container.clientWidth || 600;
    const height = 350;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Add a dark background rect just in case, though it's handled by container css
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent');

    const color = d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3])
      .range(['#6366f1', '#10b981', '#f43f5e', '#f59e0b']); // Indigo, Emerald, Rose, Amber

    const simulation = d3.forceSimulation<any>(NODES)
      .force('link', d3.forceLink<any, any>(LINKS).id((d) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 10).iterations(2));

    const link = svg.append('g')
      .attr('stroke', '#1E232F')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(LINKS)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))
      .style('transition', 'x1 0.15s ease-out, y1 0.15s ease-out, x2 0.15s ease-out, y2 0.15s ease-out');

    const node = svg.append('g')
      .attr('stroke', '#0B0D13')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(NODES)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => color(d.group))
      .style('transition', 'cx 0.15s ease-out, cy 0.15s ease-out')
      .call(drag(simulation));

    node.append('title')
      .text((d) => `${d.label} (${d.region})`);

    const label = svg.append('g')
      .selectAll('text')
      .data(NODES)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8') // slate-400
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .attr('dy', (d) => d.radius + 12)
      .style('transition', 'x 0.15s ease-out, y 0.15s ease-out');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('cy', (d: any) => Math.max(d.radius, Math.min(height - d.radius, d.y)));
        
      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      width = entries[0].contentRect.width;
      svg.attr('width', width).attr('viewBox', [0, 0, width, height]);
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    });
    
    resizeObserver.observe(container);

    // Add pulsing effect to simulate consensus verification tasks
    const pulseInterval = setInterval(() => {
      // Pick 2 to 3 random nodes aside from hub to "verify" a task
      const numActive = 2 + Math.floor(Math.random() * 2);
      const activeIds = new Set<string>();
      
      while(activeIds.size < numActive) {
        const randomNode = NODES[1 + Math.floor(Math.random() * (NODES.length - 1))];
        activeIds.add(randomNode.id);
      }

      // Animate active nodes
      svg.selectAll('circle')
        .filter((d: any) => activeIds.has(d.id))
        .transition()
        .duration(300)
        .attr('r', (d: any) => d.radius * 1.4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', '#fff')
        .transition()
        .duration(1200)
        .attr('r', (d: any) => d.radius)
        .attr('stroke', '#0B0D13')
        .attr('stroke-width', 2)
        .attr('fill', (d: any) => color(d.group));

      // Light up lines linking active nodes to hub
      svg.selectAll('line')
        .filter((d: any) => activeIds.has(d.source.id) && d.target.id === 'hub')
        .transition()
        .duration(300)
        .attr('stroke', '#a5b4fc')
        .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 2 + 1)
        .attr('stroke-opacity', 1)
        .transition()
        .duration(1200)
        .attr('stroke', '#1E232F')
        .attr('stroke-width', (d: any) => Math.sqrt(d.value))
        .attr('stroke-opacity', 0.6);

      // Pulse mainnet hub shortly after
      svg.selectAll('circle')
        .filter((d: any) => d.id === 'hub')
        .transition()
        .delay(300)
        .duration(300)
        .attr('r', (d: any) => d.radius * 1.15)
        .attr('fill', '#818cf8')
        .transition()
        .duration(1000)
        .attr('r', (d: any) => d.radius)
        .attr('fill', (d: any) => color(d.group));

    }, 3000);

    return () => {
      clearInterval(pulseInterval);
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = d3.select(containerRef.current).select('svg');
    if (svg.empty()) return;

    svg.selectAll<SVGCircleElement, any>('circle')
      .transition()
      .duration(300)
      .style('opacity', (d) => {
        if (activeRegion === 'all') return 1;
        if (d.group === 0) return 1; // hub always opaque
        const regionMap = { na: 1, eu: 2, asia: 3 };
        return d.group === (regionMap as any)[activeRegion] ? 1 : 0.15;
      });

    svg.selectAll<SVGLineElement, any>('line')
      .transition()
      .duration(300)
      .style('opacity', (d) => {
        if (activeRegion === 'all') return 1;
        const regionMap = { na: 1, eu: 2, asia: 3 };
        const activeGroup = (regionMap as any)[activeRegion];
        // if either side is in active group or is hub (group 0)
        // actually node must be activeGroup connected to hub
        if ((d.source.group === activeGroup && d.target.group === 0) || 
            (d.target.group === activeGroup && d.source.group === 0) ||
            (d.source.group === activeGroup && d.target.group === activeGroup)) {
          return 1;
        }
        return 0.15;
      });
      
    svg.selectAll<SVGTextElement, any>('text')
      .transition()
      .duration(300)
      .style('opacity', (d) => {
        if (activeRegion === 'all') return 1;
        if (d.group === 0) return 1;
        const regionMap = { na: 1, eu: 2, asia: 3 };
        return d.group === (regionMap as any)[activeRegion] ? 1 : 0.15;
      });
      
  }, [activeRegion]);

  // Drag function
  const drag = (simulation: d3.Simulation<any, undefined>) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag<SVGCircleElement, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Validator Node Topology</h3>
        <div className="flex bg-[#0B0D13] border border-[#1E232F] rounded-lg p-1 gap-1">
          {['all', 'na', 'eu', 'asia'].map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeRegion === region 
                  ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E232F]/50'
              }`}
            >
              {region.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div 
          ref={containerRef} 
          className="w-full bg-[#07090F] border border-[#1E232F]/50 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-colors"
        />
        
        {/* Interactive Expandable Legend */}
        <div 
          className="absolute top-4 right-4 z-10"
          onMouseEnter={() => setIsLegendExpanded(true)}
          onMouseLeave={() => setIsLegendExpanded(false)}
        >
          <div className={`bg-[#0B0D13]/90 backdrop-blur-sm border border-[#1E232F] rounded-xl transition-all duration-300 ease-out overflow-hidden shadow-2xl ${
            isLegendExpanded ? 'w-64 p-3 ring-1 ring-white/10' : 'w-44 p-2'
          }`}>
            <div className="flex flex-col gap-2">
              {isLegendExpanded && (
                <div className="px-1 pb-1 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5">
                  Region Performance
                </div>
              )}
              
              {REGION_METRICS.map(region => (
                <div key={region.id} className="flex flex-col">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`w-2 h-2 rounded-full ${region.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></span>
                    <span className={`font-mono text-slate-300 transition-all ${isLegendExpanded ? 'text-[11px] font-semibold' : 'text-[10px]'}`}>
                      {isLegendExpanded ? region.name : region.name.split(' ')[0]}
                    </span>
                  </div>
                  
                  {/* Expanded Metrics Details */}
                  {isLegendExpanded && (
                    <div className="ml-4 mt-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Cases</span>
                        <span className="text-slate-300 font-mono">{region.cases}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Stake</span>
                        <span className="text-emerald-400/90 font-mono">{region.stake}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
