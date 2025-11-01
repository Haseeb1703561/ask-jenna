import { Video } from 'lucide-react'
import AvatarCall from './components/AvatarCall.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg shadow-purple-500/50">
              <Video className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Ask Jenna</h1>
              <p className="text-sm text-purple-200">Live Interactive AI Avatar</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AvatarCall />
      </main>
    </div>
  )
}

export default App
