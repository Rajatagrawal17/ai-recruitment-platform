import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, File } from 'lucide-react';

const AnimatedResumeUpload = ({ file, onFileChange }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const pickFile = (nextFile) => {
    if (!nextFile) return;
    
    const isPdf = nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf');
    const isDocx =
      nextFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      nextFile.name.toLowerCase().endsWith('.docx');
    
    if (!isPdf && !isDocx) return;

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 30;
      });
    }, 300);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      onFileChange(nextFile);
      clearInterval(interval);
    }, 1500);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const dragVariants = {
    idle: { scale: 1, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
    dragging: { scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
      <motion.div
        variants={dragVariants}
        animate={isDragging ? 'dragging' : 'idle'}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className="border-2 border-dashed border-indigo-400 rounded-lg p-8 text-center cursor-pointer transition-all"
      >
        <motion.div
          animate={isDragging ? { y: -5 } : { y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={isDragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Upload
              size={48}
              className={`${isDragging ? 'text-indigo-600' : 'text-indigo-500'} mb-4 transition-colors`}
            />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isDragging ? 'Drop your resume here!' : 'Drag and drop your resume'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">PDF or DOCX format</p>

          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05, backgroundColor: '#4f46e5' }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Resume
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: 'none' }}
            onChange={(event) => pickFile(event.target.files?.[0])}
          />
        </motion.div>
      </motion.div>

      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
            <p className="text-sm text-gray-600">{Math.round(uploadProgress)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* File Display */}
      {file && !isUploading && (
        <motion.div
          variants={fileItemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex-shrink-0"
          >
            <CheckCircle className="text-green-600" size={28} />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <File size={18} className="text-green-600" />
              <p className="font-medium text-gray-800 truncate">{file.name}</p>
            </div>
            <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
          </div>

          <motion.button
            type="button"
            onClick={() => {
              onFileChange(null);
              setUploadProgress(0);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
          >
            Remove
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedResumeUpload;
