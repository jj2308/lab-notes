import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BiBook, BiGrid, BiTag, BiSearch, BiPlus, BiLogOut, BiTime } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { TbFlask } from "react-icons/tb";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { useAuth } from "../context/AuthContext";


export function Navbar() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { searchQuery, searchSuggestions, searchHistory, search, setSearchQuery } = useGlobalSearch()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      search(searchQuery)
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
      searchInputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    search(suggestion)
    navigate(`/search?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
    searchInputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.length > 0)
  }

  const handleInputFocus = () => {
    setIsSearchFocused(true)
    if (searchQuery.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setIsSearchFocused(false)
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const combinedSuggestions = [
    ...searchSuggestions,
    ...(searchHistory.filter(h => !searchSuggestions.includes(h)).slice(0, 3))
  ].slice(0, 5)

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-100 relative z-50">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-2xl font-extrabold text-teal-600 flex items-center gap-2 hover:text-teal-700 transition-colors">
          <TbFlask className="text-blue-500" /> LabNotes
        </Link>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }: { isActive: boolean }) => `nav-link flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ml-4 transition-colors ${
            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BiGrid /> Dashboard
        </NavLink>
        <NavLink 
          to="/notebooks" 
          className={({ isActive }: { isActive: boolean }) => `nav-link flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BiBook /> Notebooks
        </NavLink>
        <NavLink 
          to="/entries" 
          className={({ isActive }: { isActive: boolean }) => `nav-link flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TbFlask /> All Entries
        </NavLink>
        <NavLink 
          to="/tags" 
          className={({ isActive }: { isActive: boolean }) => `nav-link flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BiTag /> Tags
        </NavLink>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit}>
            <input 
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className={`rounded-full px-4 py-2 pr-10 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                isSearchFocused ? 'w-80' : 'w-64'
              }`}
              placeholder="Search entries, notebooks, tags... (⌘K)"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <BiSearch />
            </button>
          </form>
          
          {/* Search Suggestions */}
          {showSuggestions && combinedSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 search-suggestions">
              {combinedSuggestions.map((suggestion, index) => {
                const isFromHistory = searchHistory.includes(suggestion) && !searchSuggestions.includes(suggestion)
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    {isFromHistory ? (
                      <BiTime className="text-gray-400 text-xs" />
                    ) : (
                      <BiSearch className="text-gray-400 text-xs" />
                    )}
                    <span className="truncate">{suggestion}</span>
                    {isFromHistory && (
                      <span className="text-xs text-gray-400 ml-auto">recent</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        <Link to="/entries/new">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow hover:bg-blue-600 transition-colors">
            <BiPlus /> New Entry
          </button>
        </Link>
        <Link to="/settings">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MdSettings />
          </button>
        </Link>
        <button 
          onClick={signOut}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-red-500 hover:text-red-600"
          title="Sign out"
        >
          <BiLogOut />
        </button>
      </div>
    </nav>
  );
}