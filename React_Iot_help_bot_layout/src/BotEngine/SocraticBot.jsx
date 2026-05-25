import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function SocraticBot() {
  const [botQuestions, setBotQuestions] = useState([]);
  const [investigationPath, setInvestigationPath] = useState([]);
  
  const [problem, setProblem] = useState('Component does not respond');
  const [currentProblem, setCurrentProblem] = useState('Not selected yet');
  const [areaText, setAreaText] = useState('Waiting for answers');
  const [statusText, setStatusText] = useState('Ready');
  
  const [chatHistory, setChatHistory] = useState([]);
  const [answerInput, setAnswerInput] = useState('');
  const [answerCounter, setAnswerCounter] = useState(0);
  const [botMessage, setBotMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const data = fakeData.socraticBot;
    setBotQuestions(data.questions);
    setInvestigationPath(data.path);
  }, []);

  const handleStart = () => {
    setChatHistory([]);
    setAnswerCounter(0);
    setCurrentProblem(problem);
    setAreaText('Checking hardware, communication and server');
    setStatusText('Investigation started');

    const newChat = [
      { sender: 'bot', text: 'I will not give a direct answer yet. I will ask guiding questions to help you find the source of the problem.' },
      { sender: 'bot', text: botQuestions[0] }
    ];
    setChatHistory(newChat);
    setBotMessage('Investigation started.');
    setIsError(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!answerInput) {
      setBotMessage('Please write an answer.');
      setIsError(true);
      return;
    }

    const newChat = [...chatHistory, { sender: 'user', text: answerInput }];
    const nextCounter = answerCounter + 1;
    
    if (nextCounter < botQuestions.length) {
      newChat.push({ sender: 'bot', text: botQuestions[nextCounter] });
      setStatusText('Asking guiding questions');
    } else {
      newChat.push({ sender: 'bot', text: "Based on your answers, start by checking power, then communication, then server and database connection." });
      setAreaText('Power / Communication / Server');
      setStatusText('Initial diagnosis ready');
    }

    setChatHistory(newChat);
    setAnswerCounter(nextCounter);
    setAnswerInput('');
    setBotMessage('Answer saved in demo chat.');
    setIsError(false);
  };

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-2xl font-bold text-slate-950">IoT troubleshooting chat</h3>
              <p className="text-slate-500">Select a problem and answer the bot questions.</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Select problem type</label>
            <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={problem} onChange={e => setProblem(e.target.value)}>
              <option>Component does not respond</option>
              <option>No data in database</option>
              <option>Device disconnects often</option>
              <option>Slow response time</option>
            </select>
          </div>
          
          <button onClick={handleStart} className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 mb-6">
            Start investigation
          </button>

          <div className="space-y-4 mb-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={msg.sender === 'bot' ? 'bg-slate-100 border border-slate-200 rounded-2xl p-5 max-w-xl' : 'bg-slate-950 text-white rounded-2xl p-5 max-w-xl ml-auto'}>
                <p className={`text-sm mb-1 ${msg.sender === 'bot' ? 'text-slate-400' : 'text-slate-400'}`}>{msg.sender === 'bot' ? 'IoT HelpBot' : 'Student'}</p>
                <p className={`font-bold ${msg.sender === 'bot' ? 'text-slate-900' : ''}`}>{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <input type="text" className="flex-1 border border-slate-300 rounded-2xl px-4 py-3" placeholder="Write your answer here" value={answerInput} onChange={e => setAnswerInput(e.target.value)} />
            <button type="submit" className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800">Send</button>
          </form>
          {botMessage && <p className={`text-sm mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{botMessage}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Current diagnosis</h3>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Problem</p>
              <p className="font-bold text-slate-900">{currentProblem}</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Possible area</p>
              <p className="font-bold text-slate-900">{areaText}</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Bot status</p>
              <p className="font-bold text-slate-900">{statusText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">❓</div>
            <h3 className="text-2xl font-bold text-slate-950">Bot questions</h3>
          </div>
          <div className="space-y-4">
            {botQuestions.map((q, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
                <p className="text-sm text-slate-400 mb-1">Bot question {idx + 1}</p>
                <p className="font-bold text-slate-900">{q}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🧭</div>
            <h3 className="text-2xl font-bold text-slate-950">Suggested investigation path</h3>
          </div>
          <ol className="space-y-4 text-slate-600 list-decimal list-inside">
            {investigationPath.map((path, idx) => (
              <li key={idx} className="text-lg">{path}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
