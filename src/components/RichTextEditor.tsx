import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { BiBold, BiItalic, BiListUl, BiListOl, BiCode, BiUndo, BiRedo } from 'react-icons/bi'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing your lab entry..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex gap-1 bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
          type="button"
        >
          <BiBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
          type="button"
        >
          <BiItalic />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
          type="button"
        >
          <BiListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
          type="button"
        >
          <BiListOl />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : ''}`}
          type="button"
        >
          <BiCode />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          disabled={!editor.can().undo()}
        >
          <BiUndo />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          disabled={!editor.can().redo()}
        >
          <BiRedo />
        </button>
      </div>
      
      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus-within:outline-none"
      />
    </div>
  )
}