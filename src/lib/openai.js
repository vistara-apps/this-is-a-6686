import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export const generateSummary = async (content, title) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content summarizer. Create concise, actionable summaries of Reddit discussions. Focus on key insights, practical advice, and main points. Keep it under 300 words but ensure all important information is captured.'
        },
        {
          role: 'user',
          content: `Please summarize this Reddit discussion titled "${title}": ${content}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('Failed to generate summary')
  }
}

export const extractInsights = async (content) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'Extract 3-5 key actionable insights from this content. Format as a bulleted list. Focus on practical tips, important facts, or valuable advice that users can apply.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 300,
      temperature: 0.2
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error extracting insights:', error)
    throw new Error('Failed to extract insights')
  }
}