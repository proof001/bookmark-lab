const MAX_LEN = 80

export class TopicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TopicError'
  }
}

export function normalizeTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function isValidTopic(topic: string): boolean {
  if (topic.length < 1 || topic.length > MAX_LEN) return false
  return /[\p{L}\p{N}]/u.test(topic)
}

export function requireTopic(raw: string): string {
  const topic = normalizeTopic(raw)
  if (!isValidTopic(topic)) {
    throw new TopicError(
      'Enter a short topic (letters or numbers, up to 80 characters). Try “bun” or “react”.',
    )
  }
  return topic
}
