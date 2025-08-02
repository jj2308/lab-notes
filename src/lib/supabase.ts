import {createClient} from '@supabase/supabase-js'

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey=import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config check:', {
  url: supabaseUrl ? `${supabaseUrl.slice(0,20)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.slice(0,20)}...` : 'MISSING'
})

if(!supabaseUrl||!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')

export type Database={
  public:{Tables:{
    profiles:{Row:{id:string;email:string;full_name:string|null;avatar_url:string|null;created_at:string;updated_at:string};Insert:{id:string;email:string;full_name?:string|null;avatar_url?:string|null;created_at?:string;updated_at?:string};Update:{id?:string;email?:string;full_name?:string|null;avatar_url?:string|null;created_at?:string;updated_at?:string}}
    notebooks:{Row:{id:string;title:string;description:string|null;color:string|null;user_id:string;created_at:string;updated_at:string};Insert:{id?:string;title:string;description?:string|null;color?:string|null;user_id:string;created_at?:string;updated_at?:string};Update:{id?:string;title?:string;description?:string|null;color?:string|null;user_id?:string;created_at?:string;updated_at?:string}}
    entries:{Row:{id:string;title:string;content:string;summary:string|null;notebook_id:string;user_id:string;tags:string[];created_at:string;updated_at:string};Insert:{id?:string;title:string;content:string;summary?:string|null;notebook_id:string;user_id:string;tags?:string[];created_at?:string;updated_at?:string};Update:{id?:string;title?:string;content?:string;summary?:string|null;notebook_id?:string;user_id?:string;tags?:string[];created_at?:string;updated_at?:string}}
  }}
}

export type Profile=Database['public']['Tables']['profiles']['Row']
export type Notebook=Database['public']['Tables']['notebooks']['Row']
export type Entry=Database['public']['Tables']['entries']['Row']

export const supabase=createClient<Database>(supabaseUrl,supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true}})

export const getSession=async()=> (await supabase.auth.getSession()).data.session
export const getUser=async()=> (await supabase.auth.getUser()).data.user

export const signInOAuth=(provider:'google'|'github'|'apple'|'discord'|'azure'|'facebook')=>{
  const redirect=window.location.origin
  return supabase.auth.signInWithOAuth({provider,options:{redirectTo:redirect}})
}
export const signOut=()=>supabase.auth.signOut()

export const ensureProfile=async()=>{
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return null
  const {data,error}=await supabase.from('profiles').upsert({id:user.id,email:user.email||''}).select().single()
  if(error) throw error
  return data as Profile
}

export const fromEntries=()=>supabase.from('entries')
export const fromNotebooks=()=>supabase.from('notebooks')
export const fromProfiles=()=>supabase.from('profiles')
