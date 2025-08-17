import React from 'react';

const FileUpload = ({ onFileUpload, onFileInfo, fileInfo, setMessage }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        onFileUpload(content);
        
        const info = {
          name: file.name,
          size: (file.size / 1024).toFixed(1),
          wordCount: content.split(/\s+/).length
        };
        onFileInfo(info);
      };
      
      reader.readAsText(file);
    } else {
      setMessage({ text: 'Please select a valid .txt file', type: 'error' });
    }
  };

  return (
    <section className="section">
      <h2>1. Upload Meeting Transcript</h2>
      <input 
        type="file" 
        accept=".txt" 
        onChange={handleFileChange}
        className="file-input"
      />
      {fileInfo && (
        <div className="file-info">
          <h4>File uploaded successfully!</h4>
          <p><strong>Filename:</strong> {fileInfo.name}</p>
          <p><strong>Size:</strong> {fileInfo.size} KB</p>
          <p><strong>Word count:</strong> {fileInfo.wordCount} words</p>
        </div>
      )}
    </section>
  );
};

export default FileUpload;