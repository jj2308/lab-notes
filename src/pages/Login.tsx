import {useAuth} from '../context/AuthContext'
import { TbFlask } from 'react-icons/tb'

export default function Login(){
  const {signInOAuth}=useAuth()
  return(
    <div className="min-h-screen flex items-center justify-center bg-lab-gradient">
      <div className="bg-white/90 rounded-xl shadow-lg p-12 flex flex-col items-center gap-6 max-w-md">
        {/* App Logo and Title */}
        <div className="flex items-center gap-3 mb-2">
          <TbFlask className="text-4xl text-blue-500" />
          <div className="text-3xl font-bold text-teal-600">LabNotes</div>
        </div>
        
        {/* Welcome Message */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to LabNotes</h1>
          <p className="text-gray-600 leading-relaxed">
            Your digital lab notebook for organizing experiments, protocols, and research notes. 
            Track your scientific journey with ease.
          </p>
        </div>
        
        {/* Features Preview */}
        <div className="bg-blue-50 rounded-lg p-4 w-full">
          <div className="text-sm text-blue-800 font-medium mb-2">What you can do:</div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• 📝 Create detailed lab entries with rich text</div>
            <div>• 🏷️ Organize with tags and notebooks</div>
            <div>• 🔍 Search across all your research data</div>
            <div>• 📊 Track experiments and protocols</div>
          </div>
        </div>
        
        {/* Sign In Button */}
        <div className="w-full">
          <button 
            onClick={()=>signInOAuth('google')} 
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
        
        {/* Privacy Note */}
        <div className="text-xs text-gray-500 text-center">
          Your data is secure and private. We only use your email for authentication.
        </div>
      </div>
    </div>
  )
}
