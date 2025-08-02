import {createContext,useContext,useEffect,useMemo,useState} from 'react'
import {supabase, ensureProfile} from '../lib/supabase'
import type {Session,User} from '@supabase/supabase-js'

type AuthCtx={
  user:User|null
  session:Session|null
  userId:string|null
  loading:boolean
  signInOAuth:(p:'google'|'github'|'apple'|'discord'|'azure'|'facebook')=>Promise<void>
  signOut:()=>Promise<void>
}
const AuthContext=createContext<AuthCtx|undefined>(undefined)

export function AuthProvider({children}:{children:React.ReactNode}){
  const [session,setSession]=useState<Session|null>(null)
  const [user,setUser]=useState<User|null>(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s)=>{
      // event can be 'INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED',...
      console.log('Auth state change:', event, s?.user?.id || 'no user')
      setSession(s ?? null)
      setUser(s?.user ?? null)
      setLoading(false)
    })
    return ()=>subscription.unsubscribe()
  },[])

  // Optional: ensure profile exists after sign-in (prevents FK errors later)
  useEffect(()=>{
    if(!loading && user) { ensureProfile().catch(()=>{}) }
  },[loading,user])

  const signInOAuth=async(p:Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'])=>{
    await supabase.auth.signInWithOAuth({provider:p,options:{redirectTo:window.location.origin}})
  }
  const doSignOut=async()=>{ await supabase.auth.signOut() }

  const value=useMemo(()=>({
    user, session, userId:user?.id ?? null, loading, signInOAuth, signOut:doSignOut
  }),[user,session,loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx=useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
