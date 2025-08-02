import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import type { SearchResult } from '../hooks/useGlobalSearch'
import { BiSearch, BiBook, BiTag, BiCalendar, BiFilter } from 'react-icons/bi'
import { TbFlask } from 'react-icons/tb'

export default function SearchResults() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { search, searchResults, searchQuery, isSearching } = useGlobalSearch()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'entry' | 'notebook' | 'tag'>('all')

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      search(query)
    }
  }, [searchParams, search])

  // Filter results by type
  const filteredResults = selectedFilter === 'all' 
    ? searchResults 
    : searchResults.filter(result => result.type === selectedFilter)

  // Group results by type
  const groupedResults = {
    entries: searchResults.filter(r => r.type === 'entry'),
    notebooks: searchResults.filter(r => r.type === 'notebook'),
    tags: searchResults.filter(r => r.type === 'tag')
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry': return <TbFlask className="text-blue-500" />
      case 'notebook': return <BiBook className="text-green-500" />
      case 'tag': return <BiTag className="text-purple-500" />
      default: return <BiSearch className="text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entry': return 'border-blue-200 bg-blue-50'
      case 'notebook': return 'border-green-200 bg-green-50'
      case 'tag': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (!isSearching) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <div className="text-center">
          <BiSearch className="mx-auto text-6xl text-gray-300 mb-4" />
          <div className="text-xl font-semibold text-gray-500 mb-2">Start Searching</div>
          <div className="text-gray-400 mb-6">Use the search bar above or try searching for entries, notebooks, or tags</div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Try searching for:</span>
            <button onClick={() => search('PCR')} className="text-blue-500 hover:underline text-sm">PCR</button>
            <button onClick={() => search('experiment')} className="text-blue-500 hover:underline text-sm">experiment</button>
            <button onClick={() => search('protocol')} className="text-blue-500 hover:underline text-sm">protocol</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BiSearch className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold text-blue-600">Search Results</h1>
          {searchQuery && (
            <span className="text-lg text-gray-600">for "{searchQuery}"</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{filteredResults.length} results found</span>
          <span>•</span>
          <span>{((Date.now() - Date.now()) / 1000).toFixed(2)}s</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <BiFilter className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600 mr-2">Filter by:</span>
        {[
          { key: 'all', label: 'All Results', count: searchResults.length },
          { key: 'entry', label: 'Entries', count: groupedResults.entries.length },
          { key: 'notebook', label: 'Notebooks', count: groupedResults.notebooks.length },
          { key: 'tag', label: 'Tags', count: groupedResults.tags.length }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === filter.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Results */}
      {filteredResults.length > 0 ? (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className={`p-6 rounded-xl border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${getTypeColor(result.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-1">
                  {getTypeIcon(result.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 
                      className="text-lg font-semibold text-gray-900 truncate"
                      dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
                    />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      result.type === 'entry' ? 'bg-blue-100 text-blue-600' :
                      result.type === 'notebook' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                  
                  <p 
                    className="text-gray-600 text-sm mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.highlightedContent || result.content }}
                  />
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {result.metadata?.date && (
                      <div className="flex items-center gap-1">
                        <BiCalendar />
                        <span>{result.metadata.date}</span>
                      </div>
                    )}
                    {result.metadata?.project && (
                      <div className="flex items-center gap-1">
                        <BiBook />
                        <span>{result.metadata.project}</span>
                      </div>
                    )}
                    {result.metadata?.entryCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <TbFlask />
                        <span>{result.metadata.entryCount} entries</span>
                      </div>
                    )}
                    {result.metadata?.tags && result.metadata.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <BiTag />
                        <span>{result.metadata.tags.slice(0, 2).map(tag => `#${tag}`).join(', ')}</span>
                        {result.metadata.tags.length > 2 && <span>+{result.metadata.tags.length - 2}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 font-medium">
                  {result.relevanceScore}% match
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BiSearch className="mx-auto text-6xl text-gray-300 mb-4" />
          <div className="text-xl font-semibold text-gray-500 mb-2">No results found</div>
          <div className="text-gray-400 mb-6">
            Try different keywords or check your spelling
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 mb-2">Search Tips:</div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>• Use specific keywords from your entries</div>
              <div>• Try searching for tag names with #</div>
              <div>• Search for notebook or project names</div>
              <div>• Use partial words if exact matches don't work</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}