import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, User, BookOpen, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import VisualUploadForm from './VisualUploadForm';

const UploadForm = ({ onUpload, mode = 'text' }) => {
  // If mode is visual, render the VisualUploadForm
  if (mode === 'visual') {
    return <VisualUploadForm onUpload={onUpload} />;
  }
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
      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer ${
        file
          ? 'border-green-300 bg-green-50'
          : dragOver[dragKey]
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      } ${error ? 'border-red-300 bg-red-50' : ''}`}
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-center">
        <motion.div
          className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
            file ? 'bg-green-100' : 'bg-gray-100'
          }`}
          animate={file ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {file ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Icon className="w-8 h-8 text-gray-600" />
          )}
        </motion.div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : `Drag & drop or click to upload ${title.toLowerCase()}`}
        </p>

        <AnimatePresence>
          {progress > 0 && progress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-gray-200 rounded-full h-2 mb-2"
            >
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm flex items-center justify-center mt-2"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setErrors(prev => ({ ...prev, studentName: null }));
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.studentName
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter student name"
              />
              {errors.studentName && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.studentName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setErrors(prev => ({ ...prev, subject: null }));
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.subject
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Select subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Computer Science">Computer Science</option>
                <option value="General">General</option>
              </select>
              {errors.subject && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subject}
                </p>
              )}
            </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            type="submit"
            disabled={loading || !answerSheet || !questionKey || !studentName.trim() || !subject}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 mx-auto ${
              loading || !answerSheet || !questionKey || !studentName.trim() || !subject
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            }`}
            whileHover={!loading && answerSheet && questionKey && studentName.trim() && subject ? { scale: 1.05 } : {}}
            whileTap={!loading && answerSheet && questionKey && studentName.trim() && subject ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span>Evaluate Exam</span>
              </>
            )}
          </motion.button>

          {errors.submit && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm mt-4 flex items-center justify-center"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {errors.submit}
            </motion.p>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default UploadForm;