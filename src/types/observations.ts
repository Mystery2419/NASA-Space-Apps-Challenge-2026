/** Provisional application contract, not an archive response type. See docs/DATA_CONTRACT.md. */
export interface Provenance {
  datasetId: string
  productId: string
  sourceUrl: string
}

export interface SpectralSelection {
  description: string
  wavelengthMinMicrometers: number
  wavelengthMaxMicrometers: number
}

export interface Processing {
  description: string
  pipelineVersion: string
  comparisonGroup: string
}

interface ObservationBase {
  id: string
  observedAt: string | null
  provenance: Provenance[]
}

export type Observation =
  | (ObservationBase & {
      status: 'ready'
      observedAt: string
      imagePath: string
      spectral: SpectralSelection
      processing: Processing
    })
  | (ObservationBase & {
      status: 'unavailable' | 'incompatible'
      reason: string
    })

export interface Target {
  id: string
  name: string
  raDegrees: number
  decDegrees: number
  coordinateFrame: 'ICRS'
  observations: Observation[]
}

export interface ObservationManifest {
  schemaVersion: 1
  targets: Target[]
}
