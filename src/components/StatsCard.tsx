type StatsCardProps = {

  title: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
};
export function StatsCard({ title, value, icon, delta }: StatsCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200">
      <div className="flex items-center gap-3 text-gray-600 text-sm font-medium mb-2">
        <span className="text-blue-500 text-xl">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">{value}</div>
      {delta && <div className="text-green-600 text-sm font-medium">{delta}</div>}
    </div>
  );
}