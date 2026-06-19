import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function DevicePlayground() {
  // 1. We keep track of messages coming from the device
  const [messages, setMessages] = useState([]);
  // 2. We keep track of the text we want to send TO the device
  const [commandText, setCommandText] = useState('');
  // 3. We keep our Socket.IO connection in state so we can use it to send data later
  const [socketInstance, setSocketInstance] = useState(null);
  // 4. Track connected devices status
  const [activeDevices, setActiveDevices] = useState([]);

  useEffect(() => {
    // Step 1: Connect to our Node.js Server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    setSocketInstance(socket);

    // Step 2: Listen for messages that the Server forwards from MQTT
    socket.on('mqtt_message', (data) => {
      console.log('Received from MQTT:', data);
      
      // Add the new message to our list (keeping only the last 10 so it doesn't get too long)
      setMessages((prevMessages) => {
        const newMessages = [data, ...prevMessages];
        return newMessages.slice(0, 10);
      });
    });

    // Listen for device status updates
    socket.on('device_status_update', (devicesArray) => {
      setActiveDevices(devicesArray);
    });

    // Step 3: Cleanup when the component is closed
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to send a command back to the device
  const sendCommand = () => {
    if (!commandText.trim() || !socketInstance) return;

    // Send the command to our Server via WebSockets
    // The Server will translate this and send it via MQTT to the device!
    socketInstance.emit('send_mqtt_command', {
      topic: 'Braude/team8/command', // The topic the device should listen to
      message: commandText
    });

    setCommandText(''); // Clear the input box
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Device Playground 🎮</h1>
        <p className="text-slate-500 mt-2">
          Real-time connection to M5Stack controllers via MQTT & WebSockets.
        </p>
      </div>

      {/* Connected Devices Status Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-2">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
          🟢 Connected Devices
        </h2>
        {activeDevices.length === 0 ? (
          <p className="text-slate-400 text-sm">No devices detected yet. Ensure your M5Stack is publishing to Braude/team8/YOUR_DEVICE_ID/...</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {activeDevices.map(device => (
              <div key={device.id} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 px-4 py-2 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{device.id}</span>
                {device.status === 'online' ? (
                  <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-2">Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Live Data Feed */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
            📡 Live Data Feed
          </h2>
          <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-4 h-64 overflow-y-auto border border-slate-100 dark:border-zinc-800">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center mt-20">Waiting for data from device...</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((msg, index) => (
                  <li key={index} className="text-sm bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-100 dark:border-zinc-700 shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Topic: {msg.topic}</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">{msg.payload}</strong>
                    <span className="text-xs text-slate-400 block mt-1">{new Date(msg.time).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: Send Command */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
              ⚡ Send Command
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Type a command (like "LED_ON" or a text message) to send it directly to your M5Stack.
            </p>
            <input 
              type="text" 
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="Enter command here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <button 
            onClick={sendCommand}
            disabled={!commandText.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to Device 🚀
          </button>
        </div>

      </div>
    </div>
  );
}
