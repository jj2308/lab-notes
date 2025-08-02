import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RichTextEditor } from '../components/RichTextEditor'
import { TagInput } from '../components/TagInput'
import { useEntries, useNotebooks } from '../hooks/useSupabase'
import { BiSave, BiX, BiBook } from 'react-icons/bi'
import { TbFlask } from 'react-icons/tb'

export default function CreateEntry() {
  const navigate = useNavigate()
  const { createEntry } = useEntries()
  const { notebooks } = useNotebooks()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    notebook_id: '',
    tags: [] as string[]
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    try {
      setSaving(true)
      
      // Handle notebook selection
      let notebookId = formData.notebook_id
      if (!notebookId && notebooks.length > 0) {
        notebookId = notebooks[0].id
      } else if (!notebookId && notebooks.length === 0) {
        alert('Please create a notebook first before adding entries')
        return
      }

      await createEntry({
        title: formData.title,
        content: formData.content,
        summary: formData.summary || formData.content.substring(0, 200),
        notebook_id: notebookId,
        tags: formData.tags
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating entry:', error)
      alert('Failed to create entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TbFlask className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold text-blue-600">New Lab Entry</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BiX /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <BiSave /> {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. PCR Amplification of Gene X"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lab Notes *
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Document your experimental procedure, observations, results, and conclusions..."
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary (Optional)
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Brief summary of this entry..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              If left empty, will be auto-generated from content
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notebook Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
            <label className="block text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <BiBook /> Notebook
            </label>
            <select
              value={formData.notebook_id}
              onChange={(e) => setFormData(prev => ({ ...prev, notebook_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Notebook</option>
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.title}
                </option>
              ))}
            </select>
            {notebooks.length === 0 && (
              <div className="text-xs text-gray-500 mt-2">
                No notebooks yet. Entry will be saved to default notebook.
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
            <label className="block text-sm font-medium text-blue-600 mb-3">
              Tags
            </label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add experiment tags..."
            />
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-600 mb-3">💡 Lab Entry Tips</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Include experimental conditions</li>
              <li>• Document observations clearly</li>
              <li>• Add relevant tags for easy searching</li>
              <li>• Include any troubleshooting notes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}