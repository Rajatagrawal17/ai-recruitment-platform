import React, { useRef } from "react";

const ResumeUpload = ({ file, onFileChange }) => {
  const fileInputRef = useRef(null);

  const pickFile = (nextFile) => {
    if (!nextFile) return;
    const isPdf = nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf");
    const isDocx =
      nextFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      nextFile.name.toLowerCase().endsWith(".docx");
    if (!isPdf && !isDocx) return;
    onFileChange(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    pickFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        style={{
          border: "1px dashed #94a3b8",
          borderRadius: 10,
          padding: 16,
          textAlign: "center",
        }}
      >
        <p style={{ marginTop: 0 }}>Drag and drop a PDF or DOCX resume here</p>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Browse Resume
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={(event) => pickFile(event.target.files?.[0])}
        />
      </div>
      {file && (
        <p style={{ marginBottom: 0 }}>
          Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
};

export default ResumeUpload;
