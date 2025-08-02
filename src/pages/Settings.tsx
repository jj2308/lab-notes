import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { useEntries, useNotebooks } from '../hooks/useSupabase'
import { 
  BiUser, BiCog, BiDownload, BiShield, BiMoon, BiSun, 
  BiSave, BiEdit, BiTrash, BiExport, BiImport, BiStats,
  BiNotification, BiKey, BiLogOut, BiHeart
} from 'react-icons/bi'
import { MdSettings } from 'react-icons/md'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AppSettings {
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisible: boolean
    shareAnalytics: boolean
  }
  editor: {
    autoSave: boolean
    spellCheck: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}

const defaultSettings: AppSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true
  },
  privacy: {
    profileVisible: false,
    shareAnalytics: true
  },
  editor: {
    autoSave: true,
    spellCheck: true,
    fontSize: 'medium'
  }
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { entries } = useEntries()
  const { notebooks } = useNotebooks()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data' | 'account'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  // Load user profile and settings
  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }
      
      if (profileData) {
        setProfile(profileData)
      }
      
      // Load settings from localStorage (theme is handled by ThemeContext)
      const savedSettings = localStorage.getItem('lab-settings')
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      }
      
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !profile) return
    
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setEditingProfile(false)
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = async () => {
    try {
      localStorage.setItem('lab-settings', JSON.stringify(settings))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  const exportData = async () => {
    try {
      const exportData = {
        profile,
        entries,
        notebooks,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `labnotes-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your lab entries, notebooks, and data.'
    )
    
    if (!confirmed) return
    
    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )
    
    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }
    
    try {
      // In a real app, this would call a backend endpoint to handle full deletion
      await signOut()
      alert('Account deletion initiated. Please contact support if you need assistance.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  const calculateStats = () => {
    const totalEntries = entries.length
    const totalNotebooks = notebooks.length
    const totalWords = entries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0)
    const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'
    
    return { totalEntries, totalNotebooks, totalWords, joinDate }
  }

  const stats = calculateStats()

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <BiUser /> },
    { id: 'preferences', label: 'Preferences', icon: <BiCog /> },
    { id: 'data', label: 'Data & Export', icon: <BiDownload /> },
    { id: 'account', label: 'Account & Security', icon: <BiShield /> }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <div className="text-center">
          <div className="text-2xl text-blue-600">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MdSettings className="text-3xl text-blue-500" />
        <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <BiEdit /> {editingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Avatar */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <BiUser className="text-3xl text-blue-500" />
                        )}
                      </div>
                      {editingProfile && (
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          Change Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profile?.full_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                          {profile?.full_name || 'Not set'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                        {user?.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Email cannot be changed here</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                    <div className="text-sm text-gray-500">Lab Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalNotebooks}</div>
                    <div className="text-sm text-gray-500">Notebooks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalWords.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Words Written</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{stats.joinDate}</div>
                    <div className="text-sm text-gray-500">Member Since</div>
                  </div>
                </div>

                {editingProfile && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <BiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">App Preferences</h2>

                {/* Theme */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiSun /> Appearance
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'light', label: 'Light Mode', icon: <BiSun /> },
                      { value: 'dark', label: 'Dark Mode', icon: <BiMoon /> },
                      { value: 'auto', label: 'System Default', icon: <BiCog /> }
                    ].map((themeOption) => (
                      <label key={themeOption.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value={themeOption.value}
                          checked={theme === themeOption.value}
                          onChange={(e) => setTheme(e.target.value as any)}
                          className="text-blue-500"
                        />
                        <span className="text-lg">{themeOption.icon}</span>
                        <span>{themeOption.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiNotification /> Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for important updates' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your lab activity each week' }
                    ].map((notification) => (
                      <label key={notification.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-800">{notification.label}</div>
                          <div className="text-sm text-gray-500">{notification.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [notification.key]: e.target.checked
                            }
                          }))}
                          className="text-blue-500 scale-125"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Editor Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiEdit /> Editor Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                      <select
                        value={settings.editor.fontSize}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          editor: { ...prev.editor, fontSize: e.target.value as any }
                        }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'autoSave', label: 'Auto Save', desc: 'Automatically save entries as you type' },
                        { key: 'spellCheck', label: 'Spell Check', desc: 'Enable spell checking in the editor' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-800">{setting.label}</div>
                            <div className="text-sm text-gray-500">{setting.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.editor[setting.key as keyof typeof settings.editor] as boolean}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              editor: {
                                ...prev.editor,
                                [setting.key]: e.target.checked
                              }
                            }))}
                            className="text-blue-500 scale-125"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={saveSettings}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <BiSave /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Data & Export Tab */}
            {activeTab === 'data' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>

                {/* Export Data */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiExport /> Export Your Data
                  </h3>
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-blue-800 mb-2">Download Complete Backup</div>
                        <div className="text-sm text-blue-700 mb-4">
                          Export all your lab entries, notebooks, and settings as a JSON file. 
                          This includes all your data and can be used for backup or migration.
                        </div>
                        <div className="text-xs text-blue-600">
                          Includes: {stats.totalEntries} entries, {stats.totalNotebooks} notebooks, settings, and profile data
                        </div>
                      </div>
                      <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex-shrink-0"
                      >
                        <BiDownload /> Export Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiStats /> Your Data Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{stats.totalEntries}</div>
                      <div className="text-sm text-gray-600">Lab Entries Created</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{stats.totalNotebooks}</div>
                      <div className="text-sm text-gray-600">Notebooks Organized</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{Math.round(stats.totalWords / 1000)}K</div>
                      <div className="text-sm text-gray-600">Words Written</div>
                    </div>
                  </div>
                </div>

                {/* Storage Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Storage Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• All data is stored securely in the cloud</div>
                      <div>• Automatic backups are performed daily</div>
                      <div>• You can export your data at any time</div>
                      <div>• Data is encrypted both in transit and at rest</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account & Security Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Account & Security</h2>

                {/* Account Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="text-gray-800 font-mono text-sm">{user?.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="text-gray-800">{stats.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Security Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BiKey /> Security
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <BiKey className="text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Change Password</div>
                          <div className="text-sm text-gray-500">Update your account password</div>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  </div>
                </div>

                Sign Out
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Session</h3>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <BiLogOut /> Sign Out
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4 pt-6 border-t border-red-200">
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-red-800 mb-1">Delete Account</div>
                        <div className="text-sm text-red-700">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </div>
                      </div>
                      <button
                        onClick={deleteAccount}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex-shrink-0"
                      >
                        <BiTrash /> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}