import { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  loading?: boolean;
  color: 'indigo' | 'emerald' | 'amber' | 'pink';
  icon: any;
}

export default function MetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  description,
  loading,
  color,
  icon: Icon
}: MetricCardProps) {
  const [startCounting, setStartCounting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCounting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const colorMap = {
    indigo: 'from-indigo-600/15 via-indigo-600/5 to-transparent text-indigo-400 border-indigo-500/20 hover:border-indigo-400/40 shadow-indigo-950/20',
    emerald: 'from-emerald-600/15 via-emerald-600/5 to-transparent text-emerald-400 border-emerald-500/20 hover:border-emerald-400/40 shadow-emerald-950/20',
    pink: 'from-pink-600/15 via-pink-600/5 to-transparent text-pink-400 border-pink-500/20 hover:border-pink-400/40 shadow-pink-950/20',
    amber: 'from-amber-600/15 via-amber-600/5 to-transparent text-amber-400 border-amber-500/20 hover:border-amber-400/40 shadow-amber-950/20',
  };

  const glowMap = {
    indigo: 'rgba(99,102,241,0.06)',
    emerald: 'rgba(16,185,129,0.06)',
    pink: 'rgba(236,72,153,0.06)',
    amber: 'rgba(245,158,11,0.06)',
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 animate-pulse">
        <div className="h-4 w-3/5 bg-[#1e293b] rounded mb-3"></div>
        <div className="h-8 w-4/5 bg-[#1e293b] rounded"></div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={cn(
        "bg-gradient-to-br px-5 py-5 border rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-visible backdrop-blur-md shadow-lg group", 
        colorMap[color]
      )}
      style={{
        boxShadow: `0 4px 20px rgba(0,0,0,0.45), 0 0 15px ${glowMap[color]}`
      }}
    >
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-current blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2.5 relative">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">{title}</span>
        <div className="p-1.5 bg-[#0F111A]/80 rounded-lg border border-white/5 transition-all duration-300 relative group/tooltip">
          {description ? (
            <Tooltip content={description}>
              <Icon className="w-4 h-4 leading-none text-current opacity-70 hover:opacity-100" aria-hidden="true" />
            </Tooltip>
          ) : (
            <Icon className="w-4 h-4 leading-none text-current" aria-hidden="true" />
          )}
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-white mb-1.5 leading-none font-sans flex items-baseline">
        {prefix}
        {startCounting ? (
          <CountUp end={value} duration={2} separator="," decimals={value % 1 !== 0 ? 1 : 0} />
        ) : (
          value
        )}
        {suffix && <span className="ml-1 text-base font-medium">{suffix}</span>}
      </div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
        {description}
      </p>
    </div>
  );
}
