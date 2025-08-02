import { useState, useMemo, useCallback } from 'react'
import { useEntries, useNotebooks } from './useSupabase'

export interface SearchResult {
  id: string
  type: 'entry' | 'notebook' | 'tag'
  title: string
  content: string
  url: string
  relevanceScore: number
  highlightedTitle?: string
  highlightedContent?: string
  metadata?: {
    date?: string
    project?: string
    tags?: string[]
    entryCount?: number
  }
}

export function useGlobalSearch() {
  const { entries } = useEntries()
  const { notebooks } = useNotebooks()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('lab-search-history') || '[]')
    } catch {
      return []
    }
  })

  // Highlight function for search terms
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
  }, [])

  // Calculate relevance score
  const calculateRelevance = useCallback((text: string, query: string): number => {
    if (!query.trim()) return 0
    
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    
    let score = 0
    
    // Exact phrase match (highest score)
    if (lowerText.includes(lowerQuery)) {
      score += 100
    }
    
    // Word matches
    const queryWords = lowerQuery.split(/\s+/)
    queryWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 10
      }
    })
    
    // Title match bonus
    if (lowerText.startsWith(lowerQuery)) {
      score += 50
    }
    
    return score
  }, [])

  // Search across all content
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return []
    
    const results: SearchResult[] = []
    const query = searchQuery.trim()
    
    // Search entries
    entries.forEach(entry => {
      const searchableText = `${entry.title} ${entry.content} ${entry.summary || ''} ${entry.tags.join(' ')}`
      const relevance = calculateRelevance(searchableText, query)
      
      if (relevance > 0) {
        results.push({
          id: entry.id,
          type: 'entry',
          title: entry.title,
          content: entry.summary || entry.content.substring(0, 200) + '...',
          url: `/entries/${entry.id}`, // We'll create this route later
          relevanceScore: relevance,
          highlightedTitle: highlightText(entry.title, query),
          highlightedContent: highlightText(entry.summary || entry.content.substring(0, 200) + '...', query),
          metadata: {
            date: new Date(entry.created_at).toLocaleDateString(),
            project: (entry as any).notebooks?.title || 'General',
            tags: entry.tags
          }
        })
      }
    })
    
    // Search notebooks
    notebooks.forEach(notebook => {
      const searchableText = `${notebook.title} ${notebook.description || ''}`
      const relevance = calculateRelevance(searchableText, query)
      
      if (relevance > 0) {
        const notebookEntries = entries.filter(e => e.notebook_id === notebook.id)
        results.push({
          id: notebook.id,
          type: 'notebook',
          title: notebook.title,
          content: notebook.description || 'No description',
          url: `/notebooks/${notebook.id}`,
          relevanceScore: relevance + 20, // Boost notebooks slightly
          highlightedTitle: highlightText(notebook.title, query),
          highlightedContent: highlightText(notebook.description || 'No description', query),
          metadata: {
            date: new Date(notebook.created_at).toLocaleDateString(),
            entryCount: notebookEntries.length
          }
        })
      }
    })
    
    // Search tags
    const allTags = [...new Set(entries.flatMap(entry => entry.tags))]
    allTags.forEach(tag => {
      const relevance = calculateRelevance(tag, query)
      
      if (relevance > 0) {
        const tagEntries = entries.filter(entry => entry.tags.includes(tag))
        results.push({
          id: tag,
          type: 'tag',
          title: `#${tag}`,
          content: `Tag used in ${tagEntries.length} ${tagEntries.length === 1 ? 'entry' : 'entries'}`,
          url: `/tags?filter=${encodeURIComponent(tag)}`,
          relevanceScore: relevance,
          highlightedTitle: highlightText(`#${tag}`, query),
          highlightedContent: `Tag used in ${tagEntries.length} ${tagEntries.length === 1 ? 'entry' : 'entries'}`,
          metadata: {
            entryCount: tagEntries.length
          }
        })
      }
    })
    
    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [searchQuery, entries, notebooks, calculateRelevance, highlightText])

  // Search suggestions (autocomplete)
  const searchSuggestions = useMemo((): string[] => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []
    
    const suggestions = new Set<string>()
    const query = searchQuery.toLowerCase()
    
    // Entry titles
    entries.forEach(entry => {
      if (entry.title.toLowerCase().includes(query)) {
        suggestions.add(entry.title)
      }
    })
    
    // Notebook titles
    notebooks.forEach(notebook => {
      if (notebook.title.toLowerCase().includes(query)) {
        suggestions.add(notebook.title)
      }
    })
    
    // Tags
    const allTags = [...new Set(entries.flatMap(entry => entry.tags))]
    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        suggestions.add(`#${tag}`)
      }
    })
    
    return Array.from(suggestions).slice(0, 5) // Limit to 5 suggestions
  }, [searchQuery, entries, notebooks])

  // Add to search history
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    
    try {
      localStorage.setItem('lab-search-history', JSON.stringify(newHistory))
    } catch {
      // Ignore localStorage errors
    }
  }, [searchHistory])

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem('lab-search-history')
  }, [])

  // Perform search
  const search = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      addToHistory(query)
    }
  }, [addToHistory])

  return {
    searchQuery,
    searchResults,
    searchSuggestions,
    searchHistory,
    search,
    setSearchQuery,
    clearHistory,
    isSearching: searchQuery.length > 0,
    hasResults: searchResults.length > 0
  }
}