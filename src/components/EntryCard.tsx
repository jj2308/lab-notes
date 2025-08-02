type EntryCardProps = {
  title: string;
  date: string;
  project: string;
  summary: string;
  tags: string[];
  icon?: React.ReactNode;
  onTagClick?: (tag: string) => void;
};
export function EntryCard({ title, date, project, summary, tags, icon, onTagClick }: EntryCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-2">
        <span className="text-blue-500">{icon}</span>
        {title}
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-2 mb-3">
        <span>{date}</span> • <span className="text-blue-600 font-medium">{project}</span>
      </div>
      <div className="text-gray-700 text-sm mb-3 leading-relaxed">{summary}</div>
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => (
          <span 
            key={tag} 
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className={`bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 ${
              onTagClick ? 'cursor-pointer hover:bg-blue-100 hover:scale-105 transition-all' : ''
            }`}
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}