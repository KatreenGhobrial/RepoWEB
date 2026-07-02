import { useState, useEffect, useRef } from 'react';
import Header from '../UIComponents/Header';
import LabeledInput from '../UIComponents/LabeledInput';
import { marked } from "marked";
import { detectConflicts, chat as chatBot } from './botService';
import { getAlerts } from '../IoTManagement/alertService';
import { LuTriangleAlert, LuWifi, LuShield, LuZap, LuClock, LuCpu } from 'react-icons/lu';
import { useProject } from '../hooks/ProjectContext';

const renderer = new marked.Renderer();

function parseMdText(mdText) {
  return marked(mdText, { renderer });
}

export default function SocraticBot() {
  const { selectedProjectId, selectedProject } = useProject();

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
  const [hasStarted, setHasStarted] = useState(false);
  const chatEndRef = useRef(null);

  const [projectConflicts, setProjectConflicts] = useState([]);
  const [projectAlerts, setProjectAlerts] = useState([]);

  useEffect(() => {
    setInvestigationPath([
      "Check power supply",
      "Verify network connection",
      "Inspect server logs"
    ]);
  }, []);

  // Re-fetch conflicts and alerts when the selected project changes
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!selectedProject) {
        setProjectConflicts([]);
        setProjectAlerts([]);
        return;
      }
      const p = selectedProject;
      try {
        const conflicts = await detectConflicts({
          device: p.device,
          protocol: p.protocol,
          database: p.database,
          powerSource: p.powerSource
        });
        setProjectConflicts(conflicts || []);
      } catch (e) {
        console.error("Conflicts error:", e);
        setProjectConflicts([]);
      }

      try {
        const alerts = await getAlerts(p._id);
        setProjectAlerts((alerts || []).filter(a => !a.resolved));
      } catch (e) {
        console.error("Alerts error:", e);
        setProjectAlerts([]);
      }
    };
    fetchProjectData();
  }, [selectedProjectId]);

  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleStart = async () => {
    setChatHistory([]);
    setAnswerCounter(0);
    setCurrentProblem(problem);
    setAreaText('Checking hardware, communication and server');
    setStatusText('Investigation started');
    setSessionId(`session_${Date.now()}`);

    const newChat = [
      { sender: 'bot', text: 'I am the real Socratic AI. I will not give a direct answer yet. I will ask guiding questions to help you find the source of the problem.' }
    ];
    setChatHistory(newChat);
    setBotMessage('Investigation started. Send your first message to begin.');
    setIsError(false);
    setHasStarted(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!answerInput) {
      setBotMessage('Please write an answer.');
      setIsError(true);
      return;
    }

    const userMessage = { sender: 'user', text: answerInput };
    const newChat = [...chatHistory, userMessage];
    setChatHistory(newChat);
    setAnswerInput('');
    setIsLoading(true);
    setStatusText('Thinking...');
    setBotMessage('');
    setIsError(false);

    try {
      const data = await chatBot(
        selectedProject?._id,
        `The problem I am having is: ${currentProblem}. ${answerInput}`,
        sessionId
      );

      setChatHistory([...newChat, { sender: 'bot', text: data.reply }]);
      setStatusText('Waiting for your response');
      setAreaText(data.phase || 'Investigation');
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Chat error:', error);
      setBotMessage(error.message || 'Server error. Is the backend running?');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      {selectedProject && (projectConflicts.length > 0 || projectAlerts.length > 0) && (
        <section className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2 mb-4">
            <LuTriangleAlert /> IoT Project Risks Detected ({selectedProject.name})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Render alerts first */}
            {projectAlerts.map(alert => (
              <div key={alert._id || alert.id} className="bg-white dark:bg-zinc-900 dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50">
                <p className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">{alert.title}</p>
                <p className="text-slate-600 dark:text-slate-400 dark:text-slate-400 text-xs">{alert.message}</p>
              </div>
            ))}
            {/* Render conflicts next */}
            {projectConflicts.map(conf => (
              <div key={conf.id} className="bg-white dark:bg-zinc-900 dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-900/50">
                <p className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-1">{conf.title}</p>
                <p className="text-slate-600 dark:text-slate-400 dark:text-slate-400 text-xs">{conf.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">IoT troubleshooting chat</h3>
              <p className="text-slate-500 dark:text-slate-400">Select a problem and answer the bot questions.</p>
            </div>
          </div>
         
          <div className="mb-6">
            <LabeledInput label="Select problem type">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={problem} onChange={e => setProblem(e.target.value)}>
                <option>Component does not respond</option>
                <option>No data in database</option>
                <option>Device disconnects often</option>
                <option>Slow response time</option>
              </select>
            </LabeledInput>
          </div>
         
          <button onClick={handleStart} disabled={isLoading} className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed mb-6">
            {hasStarted ? 'Restart investigation' : 'Start investigation'}
          </button>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={msg.sender === 'bot' ? 'bg-slate-100 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 max-w-xl' : 'bg-slate-950 text-white rounded-2xl p-5 max-w-xl ml-auto'}>
                <p className={`text-sm mb-1 ${msg.sender === 'bot' ? 'text-slate-400' : 'text-slate-300'}`}>{msg.sender === 'bot' ? '🤖 IoT HelpBot' : '👤 Student'}</p>
                <div
                    className={msg.sender === 'bot' ? 'text-slate-900 dark:text-white' : 'text-white'}
                    dangerouslySetInnerHTML={{
                      __html: parseMdText(msg.text, msg.sender),
                    }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="bg-slate-100 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 max-w-xl">
                <p className="text-sm mb-1 text-slate-400">🤖 IoT HelpBot</p>
                <p className="font-bold text-slate-500 dark:text-slate-400 animate-pulse">Thinking...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              className="flex-1 border border-slate-300 rounded-2xl px-4 py-3"
              placeholder={!hasStarted ? 'Click "Start investigation" first' : isLoading ? 'Waiting for bot response...' : 'Write your answer here'}
              value={answerInput}
              onChange={e => setAnswerInput(e.target.value)}
              disabled={isLoading || !hasStarted}
            />
            <button
              type="submit"
              disabled={isLoading || !hasStarted || !answerInput.trim()}
              className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳' : 'Send'}
            </button>
          </form>
          {botMessage && <p className={`text-sm mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{botMessage}</p>}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Current diagnosis</h3>
          <div className="space-y-4">
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Problem</p>
              <p className="font-bold text-slate-900 dark:text-white">{currentProblem}</p>
            </div>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Possible area</p>
              <p className="font-bold text-slate-900 dark:text-white">{areaText}</p>
            </div>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Bot status</p>
              <p className="font-bold text-slate-900 dark:text-white">{statusText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🧭</div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Suggested investigation path</h3>
          </div>
          <ol className="space-y-4 text-slate-600 dark:text-slate-400 list-decimal list-inside">
            {investigationPath.map((path, idx) => (
              <li key={idx} className="text-lg">{path}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}