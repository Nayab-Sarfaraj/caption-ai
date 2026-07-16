import { Polar } from '@polar-sh/sdk'
import { env } from '@/config/env'

declare global {
  var _polar: Polar | undefined
}

export function getPolar(): Polar {
  if (global._polar) return global._polar

  global._polar = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_SERVER,
  })

  return global._polar
}
