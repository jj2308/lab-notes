import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EntryCard } from '../components/EntryCard'
import { useEntries } from '../hooks/useSupabase'
import { BiPlus, BiSearch, BiFilter } from 'react-icons/bi'
import { TbFlask } from 'react-icons/tb'

export default function AllEntries() {
  const { entries, loading } = useEntries()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  // Get all unique tags from entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags))].sort()

  // Filter entries based on search and tag filter
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = selectedTag === '' || entry.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  if (loading) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center">
          <div className="text-2xl text-blue-600">Loading entries...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TbFlask className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold text-blue-600">All Lab Entries</h1>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <Link to="/entries/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
            <BiPlus /> New Entry
          </button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <BiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries by title, content, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <BiFilter className="text-gray-400" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.title}
              date={new Date(entry.created_at).toLocaleDateString()}
              project={(entry as any).notebooks?.title || 'General'}
              summary={entry.summary || entry.content.substring(0, 150) + '...'}
              tags={entry.tags}
              icon={<TbFlask />}
              onTagClick={(tag) => navigate(`/tags?filter=${encodeURIComponent(tag)}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <TbFlask className="mx-auto text-6xl text-gray-300 mb-4" />
          <div className="text-xl font-semibold text-gray-500 mb-2">
            {searchTerm || selectedTag ? 'No entries found' : 'No entries yet'}
          </div>
          <div className="text-gray-400 mb-6">
            {searchTerm || selectedTag 
              ? 'Try adjusting your search or filters'
              : 'Start documenting your lab work by creating your first entry'
            }
          </div>
          {!searchTerm && !selectedTag && (
            <Link to="/entries/new">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Create Your First Entry
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}