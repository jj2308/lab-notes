// auth.tsx
import {createContext,useContext,useEffect,useMemo,useState} from 'react'
import {supabase} from '../lib/supabase'
import type {Session,User} from '@supabase/supabase-js'

type AuthCtx={user:User|null;session:Session|null;userId:string|null;loading:boolean;signInOAuth:(provider:'google'|'github'|'apple'|'discord'|'azure'|'facebook')=>Promise<void>;signOut:()=>Promise<void>}
const AuthContext=createContext<AuthCtx|undefined>(undefined)

export function AuthProvider({children}:{children:React.ReactNode}){
  const [session,setSession]=useState<Session|null>(null)
  const [user,setUser]=useState<User|null>(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let mounted=true
    supabase.auth.getSession().then(({data})=>{
      if(!mounted)return
      setSession(data.session||null)
      setUser(data.session?.user||null)
      setLoading(false)
    })
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>{
      setSession(s||null)
      setUser(s?.user||null)
      setLoading(false)
    })
    return ()=>{mounted=false;sub.subscription.unsubscribe()}
  },[])

  const signInOAuth=async(provider:Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'])=>{
    await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin}})
  }
  const signOut=async()=>{await supabase.auth.signOut()}

  const value=useMemo<AuthCtx>(()=>({user,session,userId:user?.id??null,loading,signInOAuth,signOut}),[user,session,loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx=useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
