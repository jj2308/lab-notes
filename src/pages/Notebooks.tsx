import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotebooks, useEntries } from '../hooks/useSupabase'
import { BiBook, BiPlus, BiEdit, BiTrash } from 'react-icons/bi'

export default function Notebooks() {
  const { notebooks, loading, error, createNotebook, refetch, updateNotebook, deleteNotebook } = useNotebooks()
  const { entries } = useEntries()

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editNotebook, setEditNotebook] = useState<any>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteNotebookId, setDeleteNotebookId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', color: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Kick a fetch on mount; the hook will no-op if user isn’t ready yet.
  useEffect(() => { refetch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getEntryCount = (notebookId: string) =>
    entries.filter((entry) => entry.notebook_id === notebookId).length

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await createNotebook({
        title: form.title,
        description: form.description,
        color: form.color || null,
      })
      setShowCreate(false)
      setForm({ title: '', description: '', color: '' })
      refetch()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create notebook')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (notebook: any) => {
    setEditNotebook(notebook)
    setForm({
      title: notebook.title,
      description: notebook.description || '',
      color: notebook.color || '#14b8a6',
    })
    setShowEdit(true)
    setFormError(null)
  }

  const handleUpdate = async () => {
    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await updateNotebook(editNotebook.id, {
        title: form.title,
        description: form.description,
        color: form.color || null,
      })
      setShowEdit(false)
      setEditNotebook(null)
      setForm({ title: '', description: '', color: '' })
      refetch()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update notebook')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteNotebookId) return
    setSaving(true)
    try {
      await deleteNotebook(deleteNotebookId)
      setShowDelete(false)
      setDeleteNotebookId(null)
      refetch()
    } finally {
      setSaving(false)
    }
  }

  // Smarter loading: only show spinner while awaiting the first load
  const isLoading = loading && !error && notebooks.length === 0

  return (
    <div className="container mx-auto px-8 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <BiBook /> Notebooks
        </h1>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow hover:bg-blue-600 transition"
          onClick={() => setShowCreate(true)}
        >
          <BiPlus /> New Notebook
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-600">Loading notebooks...</div>
      ) : error ? (
        <div className="text-center text-red-600">
          {error}
          <div className="mt-3">
            <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 text-white rounded">
              Retry
            </button>
          </div>
        </div>
      ) : notebooks.length === 0 ? (
        <div className="text-center text-gray-500">No notebooks yet. Create your first notebook!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notebooks.map((notebook) => (
            <div key={notebook.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 flex flex-col gap-2">
              <Link to={`/notebooks/${notebook.id}`} className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-1 hover:underline">
                <BiBook /> {notebook.title}
                <span className="ml-auto bg-blue-100 text-blue-600 rounded-full px-3 py-0.5 text-xs font-semibold">
                  {getEntryCount(notebook.id)} entries
                </span>
              </Link>
              <div className="text-gray-500 text-sm mb-2">{notebook.description}</div>
              <div className="flex gap-2 mt-auto">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium"
                  onClick={() => handleEdit(notebook)}
                >
                  <BiEdit /> Edit
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium"
                  onClick={() => { setShowDelete(true); setDeleteNotebookId(notebook.id) }}
                >
                  <BiTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Notebook Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Notebook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Protein Expression Study"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Short description of this notebook..."
                  rows={2}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color (optional)</label>
                <input
                  type="color"
                  value={form.color || '#14b8a6'}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-12 h-8 p-0 border-none bg-transparent"
                  disabled={saving}
                />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded" disabled={saving}>
                  Cancel
                </button>
                <button onClick={handleCreate} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold" disabled={saving}>
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notebook Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Notebook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Protein Expression Study"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Short description of this notebook..."
                  rows={2}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color (optional)</label>
                <input
                  type="color"
                  value={form.color || '#14b8a6'}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-12 h-8 p-0 border-none bg-transparent"
                  disabled={saving}
                />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => { setShowEdit(false); setEditNotebook(null) }} className="px-4 py-2 bg-gray-200 rounded" disabled={saving}>
                  Cancel
                </button>
                <button onClick={handleUpdate} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold" disabled={saving}>
                  {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Notebook?</h2>
            <p className="mb-6">Are you sure you want to delete this notebook? This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setShowDelete(false); setDeleteNotebookId(null) }} className="px-4 py-2 bg-gray-200 rounded" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold" disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
