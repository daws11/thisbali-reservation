/** Logical SVG canvas for the seating map (4:3 — the container must match). */
export const BASE_W = 400
export const BASE_H = 300

export function px(pct: number, axis: 'x' | 'y'): number {
  return (pct / 100) * (axis === 'x' ? BASE_W : BASE_H)
}
