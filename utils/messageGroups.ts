/**
 * Regroupement des messages d'une conversation en "lignes" prêtes à afficher :
 * séparateurs de date + messages groupés par expéditeur et par fenêtre de temps.
 * Logique pure (aucune dépendance React / réseau) pour rester testable.
 */

export type GroupableMessage = {
  id: string
  sender_id: string
  content: string
  created_at: string
  status?: 'pending' | 'sent' | 'failed'
  clientId?: string
}

export type MessageRow<M extends GroupableMessage> =
  | { type: 'sep'; key: string; label: string }
  | { type: 'msg'; key: string; message: M; mine: boolean; firstOfGroup: boolean; lastOfGroup: boolean }

/** Deux messages du même auteur séparés de moins de 5 min sont visuellement groupés. */
export const GROUP_GAP_MS = 5 * 60 * 1000

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function dayLabel(d: Date, now: Date = new Date()): string {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, now)) return "Aujourd'hui"
  if (sameDay(d, yesterday)) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function buildMessageRows<M extends GroupableMessage>(
  messages: M[],
  currentUserId: string | null,
  now: Date = new Date(),
): MessageRow<M>[] {
  const rows: MessageRow<M>[] = []
  let lastDate: Date | null = null

  messages.forEach((message, i) => {
    const date = new Date(message.created_at)
    const prev = messages[i - 1]
    const next = messages[i + 1]

    if (!lastDate || !sameDay(lastDate, date)) {
      rows.push({ type: 'sep', key: `sep-${message.id}`, label: dayLabel(date, now) })
    }
    lastDate = date

    const mine = message.sender_id === currentUserId
    const prevDate = prev ? new Date(prev.created_at) : null
    const nextDate = next ? new Date(next.created_at) : null

    const firstOfGroup =
      !prev ||
      prev.sender_id !== message.sender_id ||
      !prevDate ||
      !sameDay(prevDate, date) ||
      date.getTime() - prevDate.getTime() > GROUP_GAP_MS

    const lastOfGroup =
      !next ||
      next.sender_id !== message.sender_id ||
      !nextDate ||
      !sameDay(nextDate, date) ||
      nextDate.getTime() - date.getTime() > GROUP_GAP_MS

    rows.push({ type: 'msg', key: message.clientId ?? message.id, message, mine, firstOfGroup, lastOfGroup })
  })

  return rows
}
