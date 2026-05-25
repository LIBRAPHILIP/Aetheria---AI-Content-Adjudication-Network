import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, Tooltip, Area } from 'recharts';

export default function ChartWrapper({ data }: { data: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="disputesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#161B28" vertical={false} opacity={0.5} />
        <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#090D16', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#94a3b8' }} />
        <Area type="monotone" dataKey="disputes" stroke="#818cf8" fill="url(#disputesGradient)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
