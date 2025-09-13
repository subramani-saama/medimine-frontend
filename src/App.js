import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>MediMine AI 🔬</h1>
        <p>AI-Powered Medical Document Analysis</p>
      </header>
      <main className="App-main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
