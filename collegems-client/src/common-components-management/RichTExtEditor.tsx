import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // Configures the toolbar options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'] // Removes formatting
    ],
  };

  return (
    <div className="bg-white">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="rounded-lg overflow-hidden [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-gray-300 [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-gray-300 [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-gray-900"
      />
    </div>
  );
}