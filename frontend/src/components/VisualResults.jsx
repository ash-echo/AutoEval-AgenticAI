import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Brain, ArrowLeft, Download, Share } from 'lucide-react';

const VisualResults = ({ data, onBack }) => {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No visual analysis results available.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  const { status, total_questions, questions, full_image_analysis, error } = data;

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-4">Analysis Failed</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const questionsList = Object.entries(questions || {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </motion.button>

        <div className="flex space-x-2">
          <motion.button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 border border-green-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visual Question Analysis</h1>
              <p className="text-gray-600 mt-1">AI-powered visual reasoning and analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{total_questions}</div>
            <div className="text-sm text-gray-600">Questions Detected</div>
          </div>
        </div>
      </motion.div>

      {/* Full Image Analysis */}
      {full_image_analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
        >
          <div className="flex items-center mb-6">
            <Eye className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Full Image Overview</h2>
          </div>
          
          <div className="space-y-4">
            {full_image_analysis.visual_description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Visual Description</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{full_image_analysis.visual_description}</p>
              </div>
            )}
            
            {full_image_analysis.reasoning && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Overall Analysis</h3>
                <p className="text-gray-700 bg-blue-50 rounded-lg p-4">{full_image_analysis.reasoning}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Individual Questions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Individual Question Analysis</h2>
        
        <AnimatePresence>
          {questionsList.map(([questionId, questionData], index) => {
            const analysis = questionData.analysis || {};
            const hasError = analysis.error || analysis.status === 'failed';
            
            return (
              <motion.div
                key={questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
              >
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{questionId}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{questionId}</h3>
                        <p className="text-sm text-gray-600">
                          {analysis.question_type ? `Type: ${analysis.question_type}` : 'Question Analysis'}
                        </p>
                      </div>
                    </div>
                    
                    {analysis.confidence && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{analysis.confidence}/10</div>
                        <div className="text-sm text-gray-600">Confidence</div>
                      </div>
                    )}
                  </div>

                  {hasError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-800">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Analysis Error</span>
                      </div>
                      <p className="text-red-700 mt-2">{analysis.error || 'Question analysis failed'}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Question Text */}
                      {analysis.question_text && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Question</h4>
                          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{analysis.question_text}</p>
                        </div>
                      )}

                      {/* Visual Description */}
                      {analysis.visual_description && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Visual Elements</h4>
                          <p className="text-gray-700 bg-blue-50 rounded-lg p-4">{analysis.visual_description}</p>
                        </div>
                      )}

                      {/* Options (for MCQ) */}
                      {analysis.options && Object.keys(analysis.options).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Answer Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(analysis.options).map(([optionKey, optionText]) => (
                              <div
                                key={optionKey}
                                className={`p-3 rounded-lg border ${
                                  analysis.answer && analysis.answer.toLowerCase().includes(optionKey.toLowerCase())
                                    ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-700">{optionKey.toUpperCase()}.</span>
                                  <span className="text-gray-800">{optionText}</span>
                                  {analysis.answer && analysis.answer.toLowerCase().includes(optionKey.toLowerCase()) && (
                                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer */}
                      {analysis.answer && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">AI Answer</h4>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-green-800 mb-2">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Suggested Answer</span>
                            </div>
                            <p className="text-green-900 font-medium">{analysis.answer}</p>
                          </div>
                        </div>
                      )}

                      {/* Reasoning */}
                      {analysis.reasoning && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">AI Reasoning</h4>
                          <p className="text-gray-700 bg-purple-50 rounded-lg p-4">{analysis.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{total_questions}</div>
            <div className="text-sm text-gray-600">Questions Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {questionsList.filter(([_, data]) => data.analysis && !data.analysis.error).length}
            </div>
            <div className="text-sm text-gray-600">Successfully Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {questionsList.filter(([_, data]) => data.analysis && data.analysis.question_type === 'mcq').length}
            </div>
            <div className="text-sm text-gray-600">MCQ Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {questionsList.filter(([_, data]) => data.analysis && data.analysis.confidence >= 8).length}
            </div>
            <div className="text-sm text-gray-600">High Confidence (8+)</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisualResults;