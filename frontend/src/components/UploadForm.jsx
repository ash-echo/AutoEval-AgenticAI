import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, User, BookOpen, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const UploadForm = ({ onUpload }) => {
  const [answerSheet, setAnswerSheet] = useState(null);
  const [questionKey, setQuestionKey] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [dragOver, setDragOver] = useState({ answerSheet: false, questionKey: false });
  const [uploadProgress, setUploadProgress] = useState({ answerSheet: 0, questionKey: 0 });
  const [errors, setErrors] = useState({});

  const answerSheetRef = useRef(null);
  const questionKeyRef = useRef(null);

  const uploadFile = async (file, endpoint, progressKey) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`http://localhost:8000/${endpoint}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [progressKey]: percentCompleted }));
      }
    });
    return response.data.file_id;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!answerSheet) newErrors.answerSheet = 'Answer sheet is required';
    if (!questionKey) newErrors.questionKey = 'Question key is required';
    if (!studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      // Upload answer sheet
      const answerId = await uploadFile(answerSheet, 'upload/answer_sheet', 'answerSheet');

      // Upload question key
      const questionId = await uploadFile(questionKey, 'upload/question_key', 'questionKey');

      setFileId(answerId);

      // Process the submission
      const formData = new FormData();
      formData.append('answer_sheet_id', answerId);
      formData.append('question_key_id', questionId);
      formData.append('student_name', studentName.trim());
      formData.append('subject', subject.trim());

      const processResponse = await axios.post('http://localhost:8000/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUpload(processResponse.data);

    } catch (error) {
      console.error('Upload failed:', error);
      setErrors({ submit: error.response?.data?.detail || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
      setUploadProgress({ answerSheet: 0, questionKey: 0 });
    }
  };

  const handleFileSelect = (file, setter, ref) => {
    if (file) {
      setter(file);
      // Clear errors for the specific field
      if (setter === setAnswerSheet) {
        setErrors(prev => ({ ...prev, answerSheet: null }));
      } else if (setter === setQuestionKey) {
        setErrors(prev => ({ ...prev, questionKey: null }));
      }
    }
  };

  const FileUploadCard = ({ title, icon: Icon, file, onClick, progress, error, accept, inputRef, dragKey }) => (
    <motion.div
      className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-500 cursor-pointer glass-card hover-lift overflow-hidden ${
        file
          ? 'border-green-400 bg-green-500/20 shadow-2xl'
          : dragOver[dragKey]
          ? 'border-purple-400 bg-purple-500/20 shadow-2xl animate-glow'
          : 'border-purple-400/50 hover:border-purple-300'
      } ${error ? 'border-red-400 bg-red-500/20' : ''}`}
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [dragKey]: true }));
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [dragKey]: false }));
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [dragKey]: false }));
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
          handleFileSelect(droppedFile, dragKey === 'answerSheet' ? setAnswerSheet : setQuestionKey, inputRef);
        }
      }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="text-center relative z-10">
        <motion.div
          className={`mx-auto mb-6 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
            file 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 animate-glow' 
              : 'bg-gradient-to-r from-purple-500 to-pink-600'
          }`}
          animate={file ? { 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {file ? (
            <CheckCircle className="w-10 h-10 text-white" />
          ) : (
            <Icon className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/80 mb-6 font-medium">
          {file ? (
            <span className="flex items-center justify-center space-x-2">
              <span>✅ {file.name}</span>
              <span className="text-green-300">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </span>
          ) : (
            `🚀 Drag & drop or click to upload ${title.toLowerCase()}`
          )}
        </p>

        <AnimatePresence>
          {progress > 0 && progress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="w-full glass rounded-full h-3 mb-4 overflow-hidden"
            >
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-400 text-sm flex items-center justify-center mt-3 font-medium"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
                onChange={(e) => handleFileSelect(e.target.files[0], dragKey === 'answerSheet' ? setAnswerSheet : setQuestionKey, inputRef)}
        className="hidden"
      />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass-card rounded-3xl p-8 shadow-2xl hover-lift relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="flex items-center mb-8 relative z-10">
            <motion.div 
              className="w-14 h-14 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center mr-5 shadow-lg animate-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <User className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-cyan-100 mb-1">Student Information</h2>
              <p className="text-cyan-200/70">Enter student details for personalized evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="block text-sm font-bold text-white/90 mb-3">Student Name</label>
              <motion.input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setErrors(prev => ({ ...prev, studentName: null }));
                }}
                className={`w-full px-5 py-4 glass border-2 rounded-2xl focus:outline-none transition-all duration-300 text-white placeholder-white/60 font-medium ${
                  errors.studentName
                    ? 'border-red-400 focus:border-red-500 bg-red-500/20'
                    : 'border-purple-400/50 focus:border-purple-400 hover:border-purple-300'
                }`}
                placeholder="Enter student name"
                whileFocus={{ scale: 1.02 }}
              />
              {errors.studentName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 flex items-center font-medium"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.studentName}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="block text-sm font-bold text-white/90 mb-3">Subject</label>
              <motion.select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setErrors(prev => ({ ...prev, subject: null }));
                }}
                className={`w-full px-5 py-4 glass border-2 rounded-2xl focus:outline-none transition-all duration-300 text-white font-medium ${
                  errors.subject
                    ? 'border-red-400 focus:border-red-500 bg-red-500/20'
                    : 'border-purple-400/50 focus:border-purple-400 hover:border-purple-300'
                }`}
                whileFocus={{ scale: 1.02 }}
              >
                <option value="" className="bg-purple-900 text-white">Select subject</option>
                <option value="Mathematics" className="bg-purple-900 text-white">Mathematics</option>
                <option value="Physics" className="bg-purple-900 text-white">Physics</option>
                <option value="Chemistry" className="bg-purple-900 text-white">Chemistry</option>
                <option value="Biology" className="bg-purple-900 text-white">Biology</option>
                <option value="English" className="bg-purple-900 text-white">English</option>
                <option value="History" className="bg-purple-900 text-white">History</option>
                <option value="Geography" className="bg-purple-900 text-white">Geography</option>
                <option value="Computer Science" className="bg-purple-900 text-white">Computer Science</option>
                <option value="General" className="bg-purple-900 text-white">General</option>
              </motion.select>
              {errors.subject && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 flex items-center font-medium"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* File Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <FileUploadCard
            title="Answer Sheet"
            icon={FileText}
            file={answerSheet}
            onClick={() => answerSheetRef.current?.click()}
            progress={uploadProgress.answerSheet}
            error={errors.answerSheet}
            accept=".pdf,.jpg,.jpeg,.png"
            inputRef={answerSheetRef}
            dragKey="answerSheet"
          />

          <FileUploadCard
            title="Question Key"
            icon={BookOpen}
            file={questionKey}
            onClick={() => questionKeyRef.current?.click()}
            progress={uploadProgress.questionKey}
            error={errors.questionKey}
            accept=".pdf,.docx"
            inputRef={questionKeyRef}
            dragKey="questionKey"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <motion.button
            type="submit"
            disabled={loading || !answerSheet || !questionKey || !studentName.trim() || !subject}
            className={`px-16 py-5 rounded-2xl font-bold text-xl transition-all duration-500 flex items-center justify-center space-x-4 mx-auto relative overflow-hidden ${
              loading || !answerSheet || !questionKey || !studentName.trim() || !subject
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 animate-glow'
            }`}
            whileHover={!loading && answerSheet && questionKey && studentName.trim() && subject ? { 
              scale: 1.05, 
              y: -3,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)"
            } : {}}
            whileTap={!loading && answerSheet && questionKey && studentName.trim() && subject ? { scale: 0.95 } : {}}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1
              }}
            />
            
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-7 h-7" />
                </motion.div>
                <span>Processing Magic...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="w-7 h-7" />
                </motion.div>
                <span>🚀 Start Evaluation</span>
              </>
            )}
          </motion.button>

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 glass-card rounded-2xl border border-red-400"
            >
              <p className="text-red-400 text-lg flex items-center justify-center font-medium">
                <AlertCircle className="w-5 h-5 mr-3" />
                {errors.submit}
              </p>
            </motion.div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default UploadForm;