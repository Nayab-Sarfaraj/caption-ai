import path from 'path'
import { bundle } from '@remotion/bundler'

// Cached across worker job invocations — recomputing bundle takes 10-30s
let bundleCache: string | undefined

export async function getBundle(): Promise<string> {
  if (bundleCache) return bundleCache

  const remotionRoot = path.resolve(process.cwd(), 'remotion', 'Root.tsx')

  bundleCache = await bundle({
    entryPoint: remotionRoot,
    webpackOverride: (config: object) => config,
  })

  return bundleCache
}

export function clearBundleCache(): void {
  bundleCache = undefined
}
