import { useParams, useNavigate } from 'react-router-dom'
import { useNotebooks, useEntries } from '../hooks/useSupabase'
import { BiBook, BiArrowBack } from 'react-icons/bi'
import { TbFlask } from 'react-icons/tb'

export default function NotebookDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notebooks, loading: notebooksLoading, refetch: refetchNotebooks } = useNotebooks()
  const { entries, loading: entriesLoading, refetch: refetchEntries } = useEntries()

  const notebook = notebooks.find((n) => n.id === id)
  const notebookEntries = entries.filter((e) => e.notebook_id === id)

  if (notebooksLoading || entriesLoading) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-4xl text-center text-blue-600">
        Loading notebook...
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="container mx-auto px-8 py-12 max-w-4xl text-center">
        <div className="text-red-600 mb-4">Notebook not found.</div>
        <button
          onClick={() => { refetchNotebooks(); refetchEntries() }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-blue-600 hover:underline">
        <BiArrowBack /> Back to Notebooks
      </button>

      <div className="flex items-center gap-3 mb-2">
        <BiBook className="text-3xl text-blue-500" />
        <h1 className="text-3xl font-bold text-blue-600">{notebook.title}</h1>
        {notebook.color && (
          <span className="w-6 h-6 rounded-full border border-blue-200" style={{ background: notebook.color }} />
        )}
      </div>

      <div className="text-gray-600 mb-8">{notebook.description}</div>

      <div className="text-lg font-semibold mb-4">
        Entries in this notebook ({notebookEntries.length})
      </div>

      {notebookEntries.length === 0 ? (
        <div className="text-gray-500">No entries yet in this notebook.</div>
      ) : (
        <div className="space-y-4">
          {notebookEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-5 flex flex-col gap-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-2">
                <span className="text-blue-500"><TbFlask /></span>
                {entry.title}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2 mb-3">
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700 text-sm mb-3 leading-relaxed">
                {entry.summary || entry.content.substring(0, 150) + '...'}
              </div>
              <div className="flex gap-2 flex-wrap">
                {entry.tags.map((tag) => (
                  <span key={tag} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
