import React, { useState } from 'react'
import { Check, Plus } from 'lucide-react'

function TopicSelector({ topics, selectedTopics, onSelectionChange, variant = 'multi-select' }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTopicToggle = (topicId) => {
    if (variant === 'single-select') {
      onSelectionChange([topicId])
      setIsOpen(false)
    } else {
      const newSelection = selectedTopics.includes(topicId)
        ? selectedTopics.filter(id => id !== topicId)
        : [...selectedTopics, topicId]
      onSelectionChange(newSelection)
    }
  }

  const selectedCount = selectedTopics.length
  const buttonText = variant === 'single-select' 
    ? (selectedCount > 0 ? topics.find(t => t.id === selectedTopics[0])?.name : 'Select topic')
    : (selectedCount > 0 ? `${selectedCount} topics selected` : 'Select topics')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full btn-secondary text-left flex items-center justify-between"
      >
        <span>{buttonText}</span>
        <Plus 
          size={16} 
          className={`transform transition-transform ${isOpen ? 'rotate-45' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border rounded-md shadow-card z-10 max-h-64 overflow-y-auto">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id)
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicToggle(topic.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium text-gray-900">{topic.name}</div>
                  <div className="text-sm text-gray-500">{topic.description}</div>
                </div>
                {isSelected && (
                  <Check size={16} className="text-primary-600" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TopicSelector