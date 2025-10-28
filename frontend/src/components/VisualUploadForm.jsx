import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Eye, CheckCircle, AlertCircle, Loader, Brain } from 'lucide-react';
import axios from 'axios';

const VisualUploadForm = ({ onUpload }) => {
  const [questionPaper, setQuestionPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const questionPaperRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file) {
      setQuestionPaper(file);
      setErrors(prev => ({ ...prev, questionPaper: null }));
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!questionPaper) newErrors.questionPaper = 'Question paper is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      // Upload the visual question paper
      const formData = new FormData();
      formData.append('file', questionPaper);

      const response = await axios.post('http://localhost:8000/process_visual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      onUpload(response.data);

    } catch (error) {
      console.error('Visual processing failed:', error);
      setErrors({ submit: error.response?.data?.detail || 'Processing failed. Please try again.' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Visual Question Processing Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 border border-green-200"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Visual Question Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">AI-powered visual reasoning for diagrams and MCQs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Visual Recognition</h3>
                <p className="text-sm text-gray-600">Detects diagrams, charts, and images</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">MCQ Detection</h3>
                <p className="text-sm text-gray-600">Finds options a,b,c,d or i,ii,iii,iv</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Reasoning</h3>
                <p className="text-sm text-gray-600">Analyzes and provides answers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <motion.div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
                questionPaper
                  ? 'border-green-300 bg-green-50'
                  : dragOver
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              } ${errors.questionPaper ? 'border-red-300 bg-red-50' : ''}`}
              onClick={() => questionPaperRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileSelect(droppedFile);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <motion.div
                  className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
                    questionPaper ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                  animate={questionPaper ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {questionPaper ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                  )}
                </motion.div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Question Paper</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {questionPaper 
                    ? `${questionPaper.name} (${(questionPaper.size / 1024 / 1024).toFixed(2)} MB)` 
                    : 'Drag & drop or click to upload question paper with diagrams'
                  }
                </p>

                <div className="text-xs text-gray-500 mb-4">
                  Supports: Images (JPG, PNG), PDF files
                </div>

                <AnimatePresence>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full bg-gray-200 rounded-full h-2 mb-2"
                    >
                      <motion.div
                        className="bg-green-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.questionPaper && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-sm flex items-center justify-center mt-2"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.questionPaper}
                  </motion.p>
                )}
              </div>

              <input
                ref={questionPaperRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </motion.div>

            {/* Preview Area */}
            {preview && (
              <div className="flex flex-col items-center justify-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preview</h4>
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={preview}
                  alt="Question paper preview"
                  className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </div>
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
            disabled={loading || !questionPaper}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 mx-auto ${
              loading || !questionPaper
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            }`}
            whileHover={!loading && questionPaper ? { scale: 1.05 } : {}}
            whileTap={!loading && questionPaper ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Analyzing Visual Questions...</span>
              </>
            ) : (
              <>
                <Brain className="w-6 h-6" />
                <span>Analyze Visual Questions</span>
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

export default VisualUploadForm;