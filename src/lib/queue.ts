import { Queue } from 'bullmq'
import { getRedisBullMQOptions } from './redis'

export const QUEUE_NAME = 'render'

let _queue: Queue | null = null

export function getRenderQueue(): Queue {
  if (_queue) return _queue
  _queue = new Queue(QUEUE_NAME, { connection: getRedisBullMQOptions() })
  return _queue
}
