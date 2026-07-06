import { UploadDropzone } from '@/components/upload-dropzone'

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Generate Captions</h1>
          <p className="text-muted-foreground">
            Upload your video and get word-by-word animated captions.
          </p>
        </div>
        <UploadDropzone />
      </div>
    </main>
  )
}
