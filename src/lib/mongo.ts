import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache
}

const cache: MongooseCache = global._mongoose ?? { conn: null, promise: null }
global._mongoose = cache

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI environment variable is not set')

  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false })
  }

  cache.conn = await cache.promise
  return cache.conn
}
