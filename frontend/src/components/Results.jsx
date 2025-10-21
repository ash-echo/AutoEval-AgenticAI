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
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div
            className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${getScoreColor(scorePercentage)} flex items-center justify-center shadow-lg`}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <ScoreIcon className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Evaluation Complete!</h2>
          <p className="text-gray-600">Here's your detailed assessment breakdown</p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          >
            <div className={`w-48 h-48 rounded-full bg-gradient-to-r ${getScoreColor(scorePercentage)} flex items-center justify-center shadow-2xl`}>
              <div className="text-center text-white">
                <div className="text-5xl font-bold">{data.total_score || 0}</div>
                <div className="text-xl opacity-90">/ {data.max_score || 0}</div>
              </div>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-8 border-white/30"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: scorePercentage / 100 }}
              transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
              style={{
                background: `conic-gradient(from 0deg, rgba(255,255,255,0.8) ${scorePercentage}%, transparent ${scorePercentage}%)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))'
              }}
            />
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {scorePercentage.toFixed(1)}%
            </div>
            <div className={`text-lg font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
              {isPassing ? 'Passing Grade' : 'Needs Improvement'}
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
              const evaluationData = data.evaluation && data.evaluation[qKey.replace('Q', '')] || {};
              const questionScore = evaluationData.score || 0;
              const maxMarks = questionData.marks || 1;
              const questionPercentage = (questionScore / maxMarks) * 100;
              const isCorrect = questionPercentage >= 80;

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
              {Object.values(data.evaluation || {}).filter(e => (e.score || 0) / (e.marks || 1) >= 0.8).length}
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