import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import CustomPrompt from './components/CustomPrompt';
import SummaryGenerator from './components/SummaryGenerator';
import SummaryEditor from './components/SummaryEditor';
import EmailShare from './components/EmailShare';
import MessageDisplay from './components/MessageDisplay';
import './styles/App.css';

function App() {
  // State management for the entire app
  const [transcript, setTranscript] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  return (
    <div className="container">
      <Header />
      
      <FileUpload 
        onFileUpload={setTranscript}
        onFileInfo={setFileInfo}
        fileInfo={fileInfo}
        setMessage={setMessage}
      />
      
      <CustomPrompt 
        prompt={customPrompt}
        setPrompt={setCustomPrompt}
      />
      
      <SummaryGenerator 
        transcript={transcript}
        customPrompt={customPrompt}
        setSummary={setSummary}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setMessage={setMessage}
      />
      
      <SummaryEditor 
  initialSummary={summary}
/>

{/* Add a simple display for now */}
{summary && (
  <section className="section">
    <h3>Generated Summary:</h3>
    <textarea
      value={summary}
      onChange={(e) => setSummary(e.target.value)}
      rows="10"
      style={{ width: '100%', marginBottom: '10px' }}
    />
  </section>
)}
      
      <EmailShare 
        summary={summary}
        setMessage={setMessage}
      />
      
      <MessageDisplay message={message} />
    </div>
  );
}

export default App;