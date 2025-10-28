import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadForm from './components/UploadForm';
import Results from './components/Results';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'results', 'analytics'

  const handleUpload = (data) => {
    setResults(data);
    setCurrentView('results');
  };

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  // Animated particles component
  const Particles = () => (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-cyber-gradient relative overflow-hidden">
      <Particles />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/15 to-blue-400/15 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/15 to-indigo-400/15 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ top: '60%', right: '10%' }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-teal-400/15 to-cyan-400/15 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -75, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ bottom: '20%', left: '50%' }}
        />
      </div>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-header relative z-50"
      >
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg hover-glow"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(0, 212, 255, 0.5)",
                    "0 0 30px rgba(0, 255, 255, 0.7)",
                    "0 0 20px rgba(0, 212, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-bold text-cyber-gradient font-['Orbitron']"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  AI Exam Evaluator
                </motion.h1>
                <p className="text-sm text-cyan-300/90 font-medium">⚡ Intelligent Assessment Platform</p>
              </div>
            </motion.div>

            <nav className="flex space-x-3">
              {[
                { id: 'upload', label: 'Upload', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
                { id: 'results', label: 'Results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { id: 'analytics', label: 'Analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 relative overflow-hidden ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg animate-glow'
                      : 'text-cyan-300/80 hover:text-cyan-200 glass hover-lift'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentView !== item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="hidden sm:inline relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Hero Section */}
              <motion.div 
                className="text-center mb-16 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 blur-3xl opacity-30"
                  animate={{
                    background: [
                      "radial-gradient(circle, #8b5cf6 0%, transparent 50%)",
                      "radial-gradient(circle, #a855f7 0%, transparent 50%)",
                      "radial-gradient(circle, #c084fc 0%, transparent 50%)",
                      "radial-gradient(circle, #8b5cf6 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <motion.div
                  className="inline-block mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl animate-glow mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-6xl md:text-7xl font-bold text-white mb-6 font-['Orbitron'] tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <span className="inline-block animate-float" style={{ animationDelay: '0s' }}>E</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.1s' }}>v</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.2s' }}>a</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.3s' }}>l</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.4s' }}>u</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.5s' }}>a</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.6s' }}>t</span>
                  <span className="inline-block animate-float" style={{ animationDelay: '0.7s' }}>e</span>
                  <br />
                  <span className="text-cyber-gradient animate-pulse-slow">with AI</span>
                </motion.h2>

                <motion.p
                  className="text-2xl text-cyan-100/90 max-w-3xl mx-auto leading-relaxed font-light"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Transform your exam evaluation with{' '}
                  <span className="font-semibold text-cyan-300">advanced AI technology</span>
                  {' '}• Upload answer sheets and question keys for instant, intelligent assessment
                </motion.p>

                <motion.div
                  className="flex flex-wrap justify-center gap-4 mt-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {['⚡ Instant Results', '🎯 High Accuracy', '📊 Deep Analytics', '🔥 Lightning Fast'].map((feature, index) => (
                    <motion.div
                      key={feature}
                      className="glass px-6 py-3 rounded-full text-cyan-100/90 font-medium border border-cyan-400/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.1, y: -2, borderColor: 'rgba(0, 255, 255, 0.6)' }}
                    >
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              <UploadForm onUpload={handleUpload} />
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Results data={results} onBack={() => navigateTo('upload')} />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Analytics />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="glass-header mt-20 relative z-10"
      >
        <div className="container mx-auto px-6 py-10">
          <div className="text-center">
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <span className="text-cyan-100/90 font-semibold text-lg">Powered by Advanced AI</span>
            </motion.div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-cyan-200/70">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-slow"></div>
                <span>Built with React & FastAPI</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
                <span>Enhanced with Framer Motion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <span>Styled with Tailwind CSS</span>
              </div>
            </div>

            <motion.div 
              className="mt-6 text-cyan-300/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              © 2025 AI Exam Evaluator • Transforming Education with Intelligence
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
