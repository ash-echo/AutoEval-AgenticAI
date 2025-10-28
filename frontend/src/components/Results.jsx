import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Award, CheckCircle, XCircle, AlertTriangle, ArrowLeft, User, BookOpen } from 'lucide-react';

const Results = ({ data, onBack }) => {
  if (!data) return null;

  const scorePercentage = data.total_score && data.max_score ? (data.total_score / data.max_score) * 100 : 0;
  const isPassing = scorePercentage >= 60;

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 80) return 'from-blue-500 to-cyan-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-600';
    if (percentage >= 60) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return Trophy;
    if (percentage >= 80) return Award;
    if (percentage >= 70) return Target;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(scorePercentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Upload</span>
      </motion.button>

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="glass-card rounded-3xl p-10 shadow-2xl hover-lift relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="text-center mb-10 relative z-10">
          <motion.div
            className={`w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-r ${getScoreColor(scorePercentage)} flex items-center justify-center shadow-2xl animate-glow`}
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <ScoreIcon className="w-14 h-14 text-white" />
          </motion.div>

          <motion.h2 
            className="text-5xl font-bold text-white mb-4 font-['Orbitron']"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(139, 92, 246, 0.5)",
                "0 0 30px rgba(168, 85, 247, 0.7)",
                "0 0 20px rgba(139, 92, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Evaluation Complete! 🎉
          </motion.h2>
          <p className="text-white/90 text-xl font-medium">✨ Here's your detailed assessment breakdown</p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center mb-12 relative z-10">
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 1.2, type: "spring" }}
          >
            <div className={`w-56 h-56 rounded-full bg-gradient-to-r ${getScoreColor(scorePercentage)} flex items-center justify-center shadow-2xl animate-glow relative overflow-hidden`}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-center text-white relative z-10">
                <motion.div 
                  className="text-6xl font-bold font-['Orbitron']"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {data.total_score || 0}
                </motion.div>
                <div className="text-2xl opacity-90 font-semibold">/ {data.max_score || 0}</div>
              </div>
            </div>
            
            {/* Animated ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-8 border-purple-400/50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0, 0.8, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            className="text-center glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.div 
              className="text-4xl font-bold text-white mb-2 font-['Orbitron']"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(255, 255, 255, 0.5)",
                  "0 0 20px rgba(168, 85, 247, 0.8)",
                  "0 0 10px rgba(255, 255, 255, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {scorePercentage.toFixed(1)}%
            </motion.div>
            <div className={`text-xl font-bold flex items-center justify-center space-x-2 ${
              isPassing ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPassing ? '🎉' : '💪'}
              <span>{isPassing ? 'Excellent Performance!' : 'Keep Improving!'}</span>
            </div>
          </motion.div>
        </div>

        {/* Student Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-blue-600 font-medium">Student</div>
            <div className="text-lg font-bold text-blue-900">{data.student_name || 'Anonymous'}</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-purple-600 font-medium">Subject</div>
            <div className="text-lg font-bold text-purple-900">{data.subject || 'General'}</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-green-600 font-medium">Status</div>
            <div className="text-lg font-bold text-green-900">{data.status || 'Completed'}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Question-by-Question Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="w-6 h-6 mr-3 text-blue-600" />
          Question-by-Question Analysis
        </h3>

        <div className="space-y-6">
          {data.parsed_question_key && data.parsed_question_key.questions && 
            Object.entries(data.parsed_question_key.questions).map(([qKey, questionData], index) => {
              const studentAnswer = data.student_answers && data.student_answers[qKey.replace('Q', '')] || 'No answer extracted';
              const evaluationData = data.evaluation && data.evaluation[qKey] || {};
              const maxMarks = questionData.marks || 1;
              const questionScore = evaluationData.score === 1 ? maxMarks : 0;
              const questionPercentage = (questionScore / maxMarks) * 100;
              const isCorrect = evaluationData.score === 1;

              return (
                <motion.div
                  key={qKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                  className={`rounded-xl p-6 border-l-4 ${
                    isCorrect
                      ? 'bg-green-50 border-green-500'
                      : questionPercentage >= 50
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h4 className="text-xl font-bold text-gray-900">{qKey}</h4>
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium">
                        {maxMarks} marks
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {questionScore}/{maxMarks}
                      </div>
                      <div className={`text-sm font-medium ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {questionPercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Parsed Question */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Question:</div>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <p className="text-gray-800 font-medium">{questionData.question || 'Question not parsed'}</p>
                      {questionData.ideal_answer && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Expected Answer:</span> {questionData.ideal_answer}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OCR'd Student Answer */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Your Answer (OCR Extracted):</div>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                      <p className="text-gray-800 italic">
                        {studentAnswer && studentAnswer.trim() ? studentAnswer : 'No answer extracted from handwriting'}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation Feedback */}
                  {evaluationData.feedback && (
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-700 mb-1">AI Feedback:</div>
                      <p className="text-gray-800 bg-white/50 rounded-lg p-3">{evaluationData.feedback}</p>
                    </div>
                  )}

                  {evaluationData.strengths && (
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-green-700 mb-1">Strengths:</div>
                      <p className="text-green-800 bg-green-50 rounded-lg p-3">{evaluationData.strengths}</p>
                    </div>
                  )}

                  {evaluationData.improvements && (
                    <div>
                      <div className="text-sm font-semibold text-blue-700 mb-1">Areas for Improvement:</div>
                      <p className="text-blue-800 bg-blue-50 rounded-lg p-3">{evaluationData.improvements}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Performance Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {Object.keys(data.evaluation || {}).length}
            </div>
            <div className="text-gray-600">Questions Answered</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Object.values(data.evaluation || {}).filter(e => e.score === 1).length}
            </div>
            <div className="text-gray-600">Questions Correct</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {scorePercentage.toFixed(1)}%
            </div>
            <div className="text-gray-600">Overall Score</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Results;