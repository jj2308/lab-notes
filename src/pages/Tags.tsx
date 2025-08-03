import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EntryCard } from '../components/EntryCard'
import { useEntries } from '../hooks/useSupabase'
import { BiTag, BiSearch, BiSort, BiTrendingUp, BiCalendar, BiPieChart } from 'react-icons/bi'
import { TbFlask } from 'react-icons/tb'

interface TagData {
  name: string
  count: number
  entries: any[]
  recentUsage: Date[]
  color: string
}

export default function Tags() {
  const { entries, loading } = useEntries()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent'>('count')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Handle URL filter parameter
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      setSelectedTag(filterParam)
    }
  }, [searchParams])

  // Process tags data
  const tagsData = useMemo(() => {
    const tagMap = new Map<string, TagData>()
    
    entries.forEach(entry => {
      entry.tags.forEach(tagName => {
        if (!tagMap.has(tagName)) {
          tagMap.set(tagName, {
            name: tagName,
            count: 0,
            entries: [],
            recentUsage: [],
            color: `hsl(${Math.abs(tagName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 60%, 85%)`
          })
        }
        
        const tagData = tagMap.get(tagName)!
        tagData.count++
        tagData.entries.push(entry)
        tagData.recentUsage.push(new Date(entry.created_at))
      })
    })

    return Array.from(tagMap.values())
  }, [entries])

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    let filtered = tagsData.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'count':
        return filtered.sort((a, b) => b.count - a.count)
      case 'recent':
        return filtered.sort((a, b) => {
          const aRecent = Math.max(...a.recentUsage.map(d => d.getTime()))
          const bRecent = Math.max(...b.recentUsage.map(d => d.getTime()))
          return bRecent - aRecent
        })
      default:
        return filtered
    }
  }, [tagsData, searchTerm, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const totalTags = tagsData.length
    const totalUsages = tagsData.reduce((sum, tag) => sum + tag.count, 0)
    const avgUsage = totalTags > 0 ? Math.round(totalUsages / totalTags * 10) / 10 : 0
    const mostUsed = tagsData.reduce((max, tag) => tag.count > max.count ? tag : max, { count: 0, name: '' })
    
    return { totalTags, totalUsages, avgUsage, mostUsed }
  }, [tagsData])

  // Get selected tag's entries
  const selectedTagEntries = selectedTag 
    ? tagsData.find(t => t.name === selectedTag)?.entries || []
    : []

  if (loading) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center">
          <div className="text-2xl text-blue-600">Loading tags...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BiTag className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold text-blue-600">Lab Tags</h1>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'}
          </span>
        </div>
        <Link to="/entries/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
            <TbFlask /> New Entry
          </button>
        </Link>
      </div>

      {!selectedTag ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center gap-3 text-gray-600 text-sm font-medium mb-2">
                <BiTag className="text-blue-500 text-xl" />
                <span>Total Tags</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalTags}</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center gap-3 text-gray-600 text-sm font-medium mb-2">
                <BiPieChart className="text-green-500 text-xl" />
                <span>Total Usages</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.totalUsages}</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center gap-3 text-gray-600 text-sm font-medium mb-2">
                <BiTrendingUp className="text-purple-500 text-xl" />
                <span>Avg per Tag</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{stats.avgUsage}</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center gap-3 text-gray-600 text-sm font-medium mb-2">
                <BiCalendar className="text-orange-500 text-xl" />
                <span>Most Used</span>
              </div>
              <div className="text-lg font-bold text-orange-600 truncate" title={stats.mostUsed.name}>
                {stats.mostUsed.name || 'None'}
              </div>
              <div className="text-sm text-gray-500">{stats.mostUsed.count} entries</div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <BiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <BiSort className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'recent')}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="count">Most Used</option>
                <option value="name">Alphabetical</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {/* Tags Grid */}
          {filteredTags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                  style={{ borderLeftColor: tag.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600 truncate" title={tag.name}>
                      #{tag.name}
                    </span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      {tag.count}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Used in {tag.count} {tag.count === 1 ? 'entry' : 'entries'}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last used: {tag.recentUsage.length > 0 
                      ? new Date(Math.max(...tag.recentUsage.map(d => d.getTime()))).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BiTag className="mx-auto text-6xl text-gray-300 mb-4" />
              <div className="text-xl font-semibold text-gray-500 mb-2">
                {searchTerm ? 'No tags found' : 'No tags yet'}
              </div>
              <div className="text-gray-400 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'Start adding tags to your lab entries to organize them'
                }
              </div>
              {!searchTerm && (
                <Link to="/entries/new">
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Create Your First Entry
                  </button>
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        /* Selected Tag View */
        <div>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setSelectedTag(null)}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              ← Back to all tags
            </button>
            <div className="flex items-center gap-3">
              <BiTag className="text-2xl text-blue-500" />
              <h2 className="text-2xl font-bold text-blue-600">#{selectedTag}</h2>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {selectedTagEntries.length} {selectedTagEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>

          {selectedTagEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTagEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  title={entry.title}
                  date={new Date(entry.created_at).toLocaleDateString()}
                  project={(entry as any).notebooks?.title || 'General'}
                  summary={entry.summary || entry.content.substring(0, 150) + '...'}
                  tags={entry.tags}
                  icon={<TbFlask />}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BiTag className="mx-auto text-6xl text-gray-300 mb-4" />
              <div className="text-xl font-semibold text-gray-500 mb-2">No entries found</div>
              <div className="text-gray-400">This tag is not used in any entries</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}