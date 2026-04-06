export interface Hotspot {
  id: string
  label: string
  x: number  // % of image width
  y: number  // % of image height
  w: number
  h: number
}

export interface HotspotMap {
  instrument: string
  controls: Hotspot[]
}

// Fuzzy match extracted control names to hotspot IDs
// Returns IDs of hotspots that match any of the given control names
export function matchControls(
  controlNames: string[],
  hotspots: Hotspot[]
): string[] {
  const matched: string[] = []

  for (const name of controlNames) {
    const normalized = name.toLowerCase().trim()

    for (const hotspot of hotspots) {
      const hotspotNormalized = hotspot.label.toLowerCase()

      // Exact match
      if (hotspotNormalized === normalized) {
        matched.push(hotspot.id)
        break
      }

      // One contains the other
      if (
        hotspotNormalized.includes(normalized) ||
        normalized.includes(hotspotNormalized)
      ) {
        matched.push(hotspot.id)
        break
      }

      // Word-level overlap (>= 50% of words match)
      const nameWords = normalized.split(/\s+/)
      const hotspotWords = hotspotNormalized.split(/\s+/)
      const overlap = nameWords.filter((w) => hotspotWords.includes(w)).length
      if (overlap > 0 && overlap / nameWords.length >= 0.5) {
        matched.push(hotspot.id)
        break
      }
    }
  }

  return Array.from(new Set(matched))
}
