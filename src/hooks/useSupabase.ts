import {useState,useEffect,useCallback,useRef} from 'react'
import {supabase,type Entry,type Notebook} from '../lib/supabase'
import {useAuth} from '../context/AuthContext'

function useInFlight(){
  const inFlight = useRef<AbortController|null>(null)
  const reset = ()=>{ if(inFlight.current){ inFlight.current.abort(); inFlight.current=null } }
  const next = ()=>{ reset(); inFlight.current = new AbortController(); return inFlight.current }
  return { next, reset, signal: ()=>inFlight.current?.signal ?? undefined }
}

/* -------- Entries -------- */
export function useEntries(){
  const {user,loading:authLoading}=useAuth()
  const inflight = useInFlight()
  const [entries,setEntries]=useState<Entry[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  const fetchEntries=useCallback(async()=>{
    if(!user){ setEntries([]); setLoading(false); return }
    const ac = inflight.next()
    try{
      setLoading(true)
      const {data,error} = await supabase
        .from('entries')
        .select('*, notebooks:notebook_id (title,color)')
        .eq('user_id',user.id)
        .order('created_at',{ascending:false})
      if(ac.signal.aborted) return
      if(error) throw error
      setEntries(data || [])
      setError(null)
    }catch(err:any){
      if(ac.signal.aborted) return
      setError(err?.message || 'Error')
    }finally{
      if(!ac.signal.aborted) setLoading(false)
    }
  },[user])

  useEffect(()=>{
    if(!authLoading) fetchEntries()
    return ()=>inflight.reset()
  },[authLoading,fetchEntries])

  const createEntry=async(entry:Omit<Entry,'id'|'created_at'|'updated_at'|'user_id'>)=>{
    if(!user) throw new Error('Not authenticated')
    const {data,error}=await supabase.from('entries').insert([{...entry,user_id:user.id}]).select().single()
    if(error) throw error
    setEntries(p=>[data as Entry,...p])
    return data as Entry
  }

  return {entries,loading:authLoading||loading,error,createEntry,refetch:fetchEntries}
}

/* -------- Notebooks -------- */
export function useNotebooks(){
  const {user,loading:authLoading}=useAuth()
  const inflight = useInFlight()
  const [notebooks,setNotebooks]=useState<Notebook[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  const fetchNotebooks=useCallback(async()=>{
    if(!user){ setNotebooks([]); setLoading(false); return }
    const ac = inflight.next()
    try{
      setLoading(true)
      const {data,error}=await supabase
        .from('notebooks').select('*')
        .eq('user_id',user.id)
        .order('created_at',{ascending:false})
      if(ac.signal.aborted) return
      if(error) throw error
      setNotebooks(data || [])
      setError(null)
    }catch(err:any){
      if(ac.signal.aborted) return
      setError(err?.message || 'Error')
    }finally{
      if(!ac.signal.aborted) setLoading(false)
    }
  },[user])

  useEffect(()=>{
    if(!authLoading) fetchNotebooks()
    return ()=>inflight.reset()
  },[authLoading,fetchNotebooks])

  const createNotebook=async(n:Omit<Notebook,'id'|'created_at'|'updated_at'|'user_id'>)=>{
    if(!user) throw new Error('Not authenticated')
    const {data,error}=await supabase.from('notebooks').insert([{...n,user_id:user.id}]).select().single()
    if(error) throw error
    setNotebooks(p=>[data as Notebook,...p])
    return data as Notebook
  }
  const updateNotebook=async(id:string,updates:Partial<Notebook>)=>{
    if(!user) throw new Error('Not authenticated')
    const {error}=await supabase.from('notebooks').update(updates).eq('id',id).eq('user_id',user.id)
    if(error) throw error
  }
  const deleteNotebook=async(id:string)=>{
    if(!user) throw new Error('Not authenticated')
    const {error}=await supabase.from('notebooks').delete().eq('id',id).eq('user_id',user.id)
    if(error) throw error
    setNotebooks(p=>p.filter(nb=>nb.id!==id))
  }

  return {notebooks,loading:authLoading||loading,error,createNotebook,updateNotebook,deleteNotebook,refetch:fetchNotebooks}
}

/* -------- Stats -------- */
export function useStats(){
  const {user,loading:authLoading}=useAuth()
  const inflight = useInFlight()
  const [stats,setStats]=useState({totalEntries:0,activeProjects:0,thisWeek:0,labTime:'0h'})
  const [loading,setLoading]=useState(true)

  const fetchStats=useCallback(async()=>{
    if(!user){ setStats({totalEntries:0,activeProjects:0,thisWeek:0,labTime:'0h'}); setLoading(false); return }
    const ac = inflight.next()
    try{
      setLoading(true)
      const {count:totalEntries}=await supabase.from('entries').select('*',{count:'exact',head:true}).eq('user_id',user.id)
      const {count:activeProjects}=await supabase.from('notebooks').select('*',{count:'exact',head:true}).eq('user_id',user.id)
      const d=new Date(); d.setDate(d.getDate()-7)
      const {count:thisWeek}=await supabase.from('entries').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',d.toISOString())
      if(ac.signal.aborted) return
      const te=totalEntries||0
      setStats({totalEntries:te,activeProjects:activeProjects||0,thisWeek:thisWeek||0,labTime:`${Math.round(te*2.5)}h`})
    }finally{
      if(!ac.signal.aborted) setLoading(false)
    }
  },[user])

  useEffect(()=>{
    if(!authLoading) fetchStats()
    return ()=>inflight.reset()
  },[authLoading,fetchStats])

  return {stats,loading:authLoading||loading,refetch:fetchStats}
}
