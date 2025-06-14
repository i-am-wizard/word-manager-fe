import { useEffect, useState } from 'react';

export default function App() {
  const [word, setWord] = useState('');
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    fetch('/api/word')
      .then(res => res.json())
      .then(data => setWord(data.word));
  }, []);

  const updateWord = async () => {
    if (!newWord.trim()) return;

    await fetch('/api/word', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: newWord })
    });

    setNewWord('');
    fetch('/api/word')
      .then(res => res.json())
      .then(data => setWord(data.word));
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-lime-300 mb-6 text-center">Word Manager</h1>

        <p className="text-gray-700 text-center mb-4">
          Current word: <span className="font-semibold text-gray-950">{word || '...'}</span>
        </p>

        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Enter new word"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <button
          onClick={updateWord}
          disabled={!newWord.trim()}
          className={`w-full text-black font-semibold py-2 rounded-lg transition ${
            newWord.trim()
              ? 'bg-gray-400 hover:border-b-gray-400'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Update Word
        </button>
      </div>
    </div>
  );
}
