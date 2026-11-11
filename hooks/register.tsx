import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

import type { Limits, Window } from '../types'

const limits = atom({ plugin: 'usage-bar', key: 'limits' } as const, {
  fiveHour: null,
  weekly: null,
} as Limits)

const pick = (list: SessionRateLimit[], kind: string): Window | null => {
  const w = list.find(r => r.kind === kind)
  return w ? { percentUsed: w.percentUsed, resetsAt: w.resetsAt } : null
}

const bar = (pct: number) => {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)))
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

const resetIn = (iso: string | undefined, now: number) => {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.parse(iso) - now) / 60000))
  if (mins >= 1440) return ` (${Math.floor(mins / 1440)}g ${Math.floor((mins % 1440) / 60)}s)`
  if (mins >= 60) return ` (${Math.floor(mins / 60)}s ${mins % 60}dk)`
  return ` (${mins}dk)`
}

const line = (label: string, w: Window | null, now: number) =>
  w ? `${label} ${bar(w.percentUsed)} %${w.percentUsed}${resetIn(w.resetsAt, now)}` : `${label} –`

const text = (l: Limits, now: number) =>
  `${line('5s', l.fiveHour, now)}   ${line('Hafta', l.weekly, now)}`

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const list = (await $.session.usage()).rateLimits
    const l: Limits = { fiveHour: pick(list, 'five_hour'), weekly: pick(list, 'seven_day') }
    await update($, limits, () => l)
    $.ui.status(text(l, await $.clock.now()))
    return result
  })

  on('session.measure', async ($, e, next) => {
    const l: Limits = { fiveHour: pick(e.rateLimits, 'five_hour'), weekly: pick(e.rateLimits, 'seven_day') }
    await update($, limits, () => l)
    $.ui.status(text(l, await $.clock.now()))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const l = await read($, limits)
    if (!l.fiveHour && !l.weekly) return next(e)
    const now = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)
    const color = (w: Window | null) =>
      !w ? undefined : w.percentUsed >= 90 ? 'red' : w.percentUsed >= 70 ? 'yellow' : 'green'
    return (
      <Box>
        <Text color={color(l.fiveHour)}>{line('5 saat', l.fiveHour, now)}</Text>
        <Text>{'   '}</Text>
        <Text color={color(l.weekly)}>{line('Haftalık', l.weekly, now)}</Text>
      </Box>
    )
  })
}
