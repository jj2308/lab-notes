import {StatsCard} from "../components/StatsCard"
import {EntryCard} from "../components/EntryCard"
import {BiBook,BiGrid,BiCalendar,BiTime,BiPlus} from "react-icons/bi"
import {TbFlask} from "react-icons/tb"
import {useEntries,useStats,useNotebooks} from "../hooks/useSupabase" // <-- add useNotebooks
import {useAuth} from "../context/AuthContext"
import {useNavigate} from "react-router-dom" // <-- for redirect (optional)
import {useState,useEffect} from "react"

export default function Dashboard(){
  const navigate=useNavigate()
  const {user,loading:authLoading}=useAuth()
  const {entries,loading:entriesLoading,error:entriesError}=useEntries()
  const {stats,loading:statsLoading}=useStats()
  const {createNotebook,refetch}=useNotebooks() // <-- get creators
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Debug logging
  console.log('Dashboard loading states:', {
    authLoading,
    entriesLoading, 
    statsLoading,
    user: user?.id || 'no user',
    entriesError
  })

  // Timeout fallback - if loading takes more than 10 seconds, show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || entriesLoading || statsLoading) {
        setLoadingTimeout(true)
        console.error('Loading timeout - one of the loading states is stuck')
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [authLoading, entriesLoading, statsLoading])

  if((authLoading||entriesLoading||statsLoading) && !loadingTimeout){
    return(
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center">
          <div className="text-2xl text-blue-600">Loading your lab data...</div>
          <div className="mt-4 text-sm text-gray-500">
            Auth: {authLoading ? 'Loading...' : '✓'} | 
            Entries: {entriesLoading ? 'Loading...' : '✓'} | 
            Stats: {statsLoading ? 'Loading...' : '✓'}
          </div>
          {entriesError && (
            <div className="mt-4 text-red-500 text-sm">
              Error: {entriesError}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show timeout error with bypass option
  if(loadingTimeout && (authLoading||entriesLoading||statsLoading)){
    return(
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">Loading Timeout</div>
          <div className="text-gray-600 mb-6">
            Something is preventing the app from loading properly.
          </div>
          <div className="mb-4 text-sm text-gray-500">
            Auth: {authLoading ? '❌ Stuck' : '✓'} | 
            Entries: {entriesLoading ? '❌ Stuck' : '✓'} | 
            Stats: {statsLoading ? '❌ Stuck' : '✓'}
          </div>
          {entriesError && (
            <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded">
              Error: {entriesError}
            </div>
          )}
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Check browser console for detailed error messages
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <div className="text-xs text-gray-500">
              If this persists, check your Supabase credentials in .env file
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!user){
    return(
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center text-blue-600 text-2xl">Please sign in to view your dashboard</div>
      </div>
    )
  }

  const handleCreateEntry=()=>{navigate('/entries/new')}
  const handleBrowseNotebooks=()=>{navigate('/notebooks')}

  async function handleCreateNotebook(){
    try{
      const nb=await createNotebook({
        title:'New Project',
        description:'',
        color:'#14b8a6'
      })
      // keep local list fresh if needed
      await refetch()
      // optional: jump to the new notebook
      navigate(`/notebooks/${nb.id}`)
    }catch(e:any){
      alert(e.message||'Failed to create notebook')
    }
  }

  return(
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <div className="text-6xl font-extrabold text-blue-600 mb-4">Welcome to LabNotes</div>
        <div className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Your modern digital lab notebook for seamless research documentation and collaboration</div>
        <div className="flex gap-4 justify-center">
          <button onClick={handleCreateEntry} className="bg-blue-500 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:bg-blue-600 hover:scale-105 transition-all">
            <BiPlus/>Create New Entry
          </button>
          <button onClick={handleBrowseNotebooks} className="bg-white/80 backdrop-blur-sm border border-blue-200 px-8 py-4 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:bg-white hover:scale-105 transition-all">
            <BiBook/>Browse Notebooks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Entries" value={stats.totalEntries} icon={<BiBook/>} delta="+12% from last month"/>
        <StatsCard title="Active Projects" value={stats.activeProjects} icon={<BiGrid/>} delta="+1% from last month"/>
        <StatsCard title="This Week" value={stats.thisWeek} icon={<BiCalendar/>} delta="+25% from last month"/>
        <StatsCard title="Lab Time" value={stats.labTime} icon={<BiTime/>} delta="+8% from last month"/>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600">
            <TbFlask className="text-2xl"/>Recent Lab Entries
          </div>
          <div className="space-y-4">
            {entries.length>0?(
              entries.slice(0,3).map((entry)=>(
                <EntryCard
                  key={entry.id}
                  title={entry.title}
                  date={new Date(entry.created_at).toLocaleDateString()}
                  project={(entry as any).notebooks?.title||'General'}
                  summary={entry.summary||entry.content.slice(0,150)+'...'}
                  tags={entry.tags}
                  icon={<TbFlask/>}
                  onTagClick={(tag) => navigate(`/tags?filter=${encodeURIComponent(tag)}`)}
                />
              ))
            ):(
              <div className="text-center py-12 text-gray-500">
                <TbFlask className="mx-auto text-4xl mb-4"/>
                <div className="text-lg font-semibold mb-2">No entries yet</div>
                <div>Start documenting your lab work by creating your first entry.</div>
              </div>
            )}
            <button className="mt-6 w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-100 transition">View All Entries</button>
          </div>
        </div>

        <div>
          <div className="text-xl font-bold mb-6 text-blue-600">Quick Actions</div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 mb-6">
            <div className="flex flex-col gap-3">
              <button onClick={handleCreateNotebook} className="bg-white border border-gray-200 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <BiGrid className="text-blue-500"/>Create Project
              </button>
              <button className="bg-white border border-gray-200 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <BiTime className="text-blue-500"/>Start Timer
              </button>
              <button onClick={handleBrowseNotebooks} className="bg-white border border-gray-200 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <BiBook className="text-blue-500"/>View Analytics
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
            <div className="font-bold mb-4 text-blue-600">Lab Activity</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>Entry completed: PCR Analysis</span></li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span>New project: Cell Culture Study</span></li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><span>Reminder: Check incubator</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
