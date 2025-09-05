import React, { useState } from 'react'
import { Trash2, Edit3, Save, X, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function InsightItem({ insight, onDelete, variant = 'preview' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(insight.content)

  const handleSave = () => {
    // In a real app, you'd call an update API here
    setIsEditing(false)
    // onUpdate(insight.id, editedContent)
  }

  const handleCancel = () => {
    setEditedContent(insight.content)
    setIsEditing(false)
  }

  return (
    <div className="insight-item">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {insight.content}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
          </span>
          {insight.tags && insight.tags.length > 0 && (
            <div className="flex space-x-1">
              {insight.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {insight.source_thread_id && (
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ExternalLink size={14} />
            </button>
          )}
          
          {variant === 'editable' && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-1 text-accent-600 hover:text-accent-700"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 size={14} />
                </button>
              )}
              
              <button
                onClick={() => onDelete(insight.id)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InsightItem