import { buildMessageRows, dayLabel, GroupableMessage, sameDay } from '../messageGroups'

const NOW = new Date('2026-03-10T12:00:00Z')

function msg(id: string, sender: string, iso: string, extra: Partial<GroupableMessage> = {}): GroupableMessage {
  return { id, sender_id: sender, content: `msg ${id}`, created_at: iso, ...extra }
}

describe('sameDay', () => {
  // Dates locales (sans "Z") et éloignées de minuit -> insensible au fuseau CI.
  test('vrai le même jour, faux sinon', () => {
    expect(sameDay(new Date('2026-03-10T09:00:00'), new Date('2026-03-10T20:00:00'))).toBe(true)
    expect(sameDay(new Date('2026-03-10T20:00:00'), new Date('2026-03-11T09:00:00'))).toBe(false)
  })
})

describe('dayLabel', () => {
  test('Aujourd\'hui / Hier / date longue', () => {
    expect(dayLabel(new Date('2026-03-10T08:00:00Z'), NOW)).toBe("Aujourd'hui")
    expect(dayLabel(new Date('2026-03-09T08:00:00Z'), NOW)).toBe('Hier')
    expect(dayLabel(new Date('2026-03-01T08:00:00Z'), NOW)).toMatch(/mars/)
  })
})

describe('buildMessageRows', () => {
  test('insère un séparateur de date en tête', () => {
    const rows = buildMessageRows([msg('1', 'u1', '2026-03-10T09:00:00Z')], 'me', NOW)
    expect(rows[0]).toMatchObject({ type: 'sep' })
    expect(rows[1]).toMatchObject({ type: 'msg', mine: false })
  })

  test('marque mine=true pour l\'utilisateur courant', () => {
    const rows = buildMessageRows([msg('1', 'me', '2026-03-10T09:00:00Z')], 'me', NOW)
    expect(rows[1]).toMatchObject({ type: 'msg', mine: true })
  })

  test('groupe deux messages rapprochés du même auteur', () => {
    const rows = buildMessageRows(
      [msg('1', 'u1', '2026-03-10T09:00:00Z'), msg('2', 'u1', '2026-03-10T09:02:00Z')],
      'me',
      NOW,
    ).filter((r) => r.type === 'msg') as Extract<ReturnType<typeof buildMessageRows>[number], { type: 'msg' }>[]

    expect(rows[0]).toMatchObject({ firstOfGroup: true, lastOfGroup: false })
    expect(rows[1]).toMatchObject({ firstOfGroup: false, lastOfGroup: true })
  })

  test('ne groupe pas au-delà de 5 minutes', () => {
    const rows = buildMessageRows(
      [msg('1', 'u1', '2026-03-10T09:00:00Z'), msg('2', 'u1', '2026-03-10T09:10:00Z')],
      'me',
      NOW,
    ).filter((r) => r.type === 'msg') as any[]
    expect(rows[0]).toMatchObject({ lastOfGroup: true })
    expect(rows[1]).toMatchObject({ firstOfGroup: true })
  })

  test('un séparateur par jour', () => {
    const rows = buildMessageRows(
      [msg('1', 'u1', '2026-03-09T09:00:00Z'), msg('2', 'u1', '2026-03-10T09:00:00Z')],
      'me',
      NOW,
    )
    expect(rows.filter((r) => r.type === 'sep')).toHaveLength(2)
  })

  test('utilise clientId comme clé quand présent', () => {
    const rows = buildMessageRows(
      [msg('local-1', 'me', '2026-03-10T09:00:00Z', { clientId: 'local-1', status: 'pending' })],
      'me',
      NOW,
    )
    const m = rows.find((r) => r.type === 'msg') as any
    expect(m.key).toBe('local-1')
  })
})
