import type { ObservationManifest } from '../types/observations'

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid observation manifest: ${message}`)
}

function object(value: unknown): Record<string, unknown> {
  requireValid(typeof value === 'object' && value !== null && !Array.isArray(value), 'expected object')
  return value as Record<string, unknown>
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function utcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) return false
  const milliseconds = Date.parse(value)
  return Number.isFinite(milliseconds)
    && new Date(milliseconds).toISOString() === value.replace(/(?<=:\d{2})Z$/, '.000Z')
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Keep checks in sync with the provisional contract; JSON is untrusted at runtime. */
export function parseManifest(value: unknown): ObservationManifest {
  const manifest = object(value)
  requireValid(manifest.schemaVersion === 1, 'unsupported schemaVersion')
  requireValid(Array.isArray(manifest.targets), 'targets must be an array')
  const targetIds = new Set<string>()
  for (const entry of manifest.targets) {
    const target = object(entry)
    requireValid(nonempty(target.id) && !targetIds.has(target.id), 'target IDs must be unique and nonempty')
    targetIds.add(target.id)
    requireValid(nonempty(target.name), 'target name required')
    requireValid(finiteNumber(target.raDegrees) && target.raDegrees >= 0 && target.raDegrees < 360, 'RA out of range')
    requireValid(finiteNumber(target.decDegrees) && target.decDegrees >= -90 && target.decDegrees <= 90, 'Dec out of range')
    requireValid(target.coordinateFrame === 'ICRS', 'coordinateFrame must be ICRS')
    requireValid(Array.isArray(target.observations), 'observations must be an array')
    const observationIds = new Set<string>()
    let previousTime = -Infinity
    let previousId = ''
    let unknownTimeSeen = false
    for (const entry of target.observations) {
      const frame = object(entry)
      requireValid(nonempty(frame.id) && !observationIds.has(frame.id), 'observation IDs must be unique within a target')
      observationIds.add(frame.id)
      requireValid(frame.observedAt === null || utcTimestamp(frame.observedAt), 'observedAt must be UTC or null')
      if (frame.observedAt === null) {
        unknownTimeSeen = true
      } else {
        const time = Date.parse(frame.observedAt)
        requireValid(!unknownTimeSeen && (time > previousTime || (time === previousTime && frame.id > previousId)), 'frames must be chronological, then ID ordered; unknown times last')
        previousTime = time
        previousId = frame.id
      }
      requireValid(Array.isArray(frame.provenance), 'provenance must be an array')
      for (const item of frame.provenance) {
        const source = object(item)
        requireValid(nonempty(source.datasetId) && nonempty(source.productId), 'source identifiers required')
        requireValid(typeof source.sourceUrl === 'string' && /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(source.sourceUrl), 'HTTPS source URL required')
      }
      if (frame.status === 'ready') {
        requireValid(frame.observedAt !== null && frame.provenance.length > 0, 'ready frames need time and provenance')
        requireValid(typeof frame.imagePath === 'string'
          && /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:png|webp|jpg|jpeg)$/.test(frame.imagePath), 'imagePath must be a relative browser image path')
        const spectral = object(frame.spectral)
        requireValid(nonempty(spectral.description)
          && finiteNumber(spectral.wavelengthMinMicrometers) && spectral.wavelengthMinMicrometers > 0
          && finiteNumber(spectral.wavelengthMaxMicrometers)
          && spectral.wavelengthMaxMicrometers >= spectral.wavelengthMinMicrometers, 'spectral selection invalid')
        const processing = object(frame.processing)
        requireValid(nonempty(processing.description) && nonempty(processing.pipelineVersion)
          && nonempty(processing.comparisonGroup), 'processing metadata required')
      } else {
        requireValid(frame.status === 'unavailable' || frame.status === 'incompatible', 'unknown observation status')
        requireValid(nonempty(frame.reason), 'excluded observation needs a reason')
        requireValid(!('imagePath' in frame) && !('spectral' in frame) && !('processing' in frame), 'excluded observation must omit display metadata')
      }
    }
  }
  // All required fields have been checked above; extra fields are tolerated for additive metadata.
  return value as ObservationManifest
}

export async function loadObservations(signal?: AbortSignal): Promise<ObservationManifest> {
  const response = await fetch(`${import.meta.env.BASE_URL}observations/manifest.json`, { signal })
  if (!response.ok) throw new Error(`Manifest request failed: HTTP ${response.status}`)
  return parseManifest(await response.json())
}
