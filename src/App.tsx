import { useEffect, useState } from 'react'
import { loadObservations } from './services/observations'
import type { ObservationManifest } from './types/observations'

type LoadState =
  | { status: 'loading' }
  | { status: 'loaded'; manifest: ObservationManifest }
  | { status: 'error' }

export default function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    loadObservations(controller.signal)
      .then((manifest) => setState({ status: 'loaded', manifest }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [])

  const readyCount = state.status === 'loaded'
    ? state.manifest.targets.reduce(
        (count, target) => count + target.observations.filter((frame) => frame.status === 'ready').length,
        0,
      )
    : 0

  return (
    <main>
      <header>
        <p className="eyebrow">NASA Space Apps Challenge 2026 · Team Phys***</p>
        <h1>SPHEREx Motion Explorer</h1>
        <p>A foundation for exploring observations of the same sky region over time.</p>
      </header>
      <section aria-labelledby="observations-heading">
        <h2 id="observations-heading">Astronomical observations</h2>
        <div role="status" aria-live="polite">
          {state.status === 'loading' && <p>Loading observation manifest…</p>}
          {state.status === 'error' && (
            <p>The observation manifest could not be loaded or is invalid. Reload to try again.</p>
          )}
          {state.status === 'loaded' && readyCount === 0 && (
            <>
              <p>No displayable astronomical observations are available yet.</p>
              <p>Validated images and provenance will be added by the team. No synthetic observations are displayed.</p>
            </>
          )}
          {state.status === 'loaded' && readyCount > 0 && (
            <p>{readyCount} processed observation(s) listed. The image viewer is planned for a later milestone.</p>
          )}
        </div>
      </section>
      <footer>
        <p>Phase 1: engineering foundation. Coordinate search, playback and image differencing are not implemented.</p>
      </footer>
    </main>
  )
}
