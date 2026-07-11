import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getBrokers, addBroker, deleteBroker, deleteAllBrokers } from './iotService';

// DevicePlayground — lets users connect custom MQTT brokers and view live device messages
export default function DevicePlayground() {
  // last 15 incoming MQTT messages
  const [messages, setMessages] = useState([]);
  // the active socket.io connection instance
  const [socketInstance, setSocketInstance] = useState(null);
  // list of devices with their online/offline status
  const [activeDevices, setActiveDevices] = useState([]);

  // Dynamic Brokers State (Transient)
  // list of saved MQTT broker configs fetched from the server
  const [brokers, setBrokers] = useState([]);
  // form fields for adding a new custom broker
  const [newBroker, setNewBroker] = useState({ name: '', url: '', port: '', username: '', password: '', topic: '#' });
  // true while a broker add/connect request is in progress
  const [brokerLoading, setBrokerLoading] = useState(false);
  // status/feedback message for broker operations
  const [brokerMsg, setBrokerMsg] = useState('');

  // fetch the current list of saved brokers from the server
  const fetchBrokers = async () => {
    try {
      const data = await getBrokers();
      setBrokers(data);
    } catch (err) {
      console.error('Failed to fetch brokers', err);
    }
  };

  // on mount: load brokers and open a socket.io connection for live data
  useEffect(() => {
    fetchBrokers();

    // connect to the backend WebSocket server
    // VITE_SOCKET_URL points to the root of the backend (no /api/) so Socket.io can connect correctly
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    setSocketInstance(socket);

    // append each incoming MQTT message to the top of the list, keeping max 15
    socket.on('mqtt_message', (data) => {
      setMessages((prevMessages) => {
        const newMessages = [data, ...prevMessages];
        return newMessages.slice(0, 15);
      });
    });

    // update the active devices list when the server broadcasts a status change
    socket.on('device_status_update', (devicesArray) => {
      setActiveDevices(devicesArray);
    });

    socket.on('mqtt_broker_status', () => {
      // Whenever a broker connects, disconnects, or errors, refetch the list
      fetchBrokers();
    });

    // disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // send the new broker form data to the server to establish an MQTT connection
  const handleAddBroker = async (e) => {
    e.preventDefault();
    setBrokerLoading(true);
    setBrokerMsg('');
    try {
      await addBroker(newBroker);
      setBrokerMsg('✅ Broker connected successfully!');
      // reset form fields after successful addition
      setNewBroker({ name: '', url: '', port: '', username: '', password: '', topic: '#' });
      fetchBrokers();
    } catch (err) {
      setBrokerMsg(`❌ Error: ${err.message || 'Failed to connect to server.'}`);
    } finally {
      setBrokerLoading(false);
    }
  };

  // remove a specific broker by ID and refresh the list
  const handleDeleteBroker = async (id) => {
    try {
      await deleteBroker(id);
      setBrokerMsg('✅ Broker disconnected and removed.');
      fetchBrokers();
    } catch (err) {
      setBrokerMsg(`❌ ${err.message || 'Error connecting to server.'}`);
    }
  };

  // remove all brokers and close the socket.io connection
  const handleDisconnect = async () => {
    try {
      await deleteAllBrokers();
      setBrokers([]);
    } catch (err) {
      console.error('Failed to disconnect brokers', err);
    }
    
    if (socketInstance) {
      socketInstance.disconnect();
    }
    
    setBrokerMsg('🔌 Disconnected from playground and stopped all custom brokers.');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto mt-6 px-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 dark:text-white mb-3">Device Playground 🎮</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Real-time connection to your IoT devices and custom MQTT brokers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: MQTT Connections & Devices */}
        <div className="flex flex-col gap-6 lg:col-span-1">

          {/* Add MQTT Broker Panel */}
          <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 dark:text-white flex items-center gap-2">
              🔗 Add Custom MQTT Broker
            </h2>
            <form onSubmit={handleAddBroker} className="flex flex-col gap-3">
              <input type="text" placeholder="Broker Name (e.g., Factory Sensor A)" required value={newBroker.name} onChange={e => setNewBroker({...newBroker, name: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
              <input type="text" placeholder="URL (e.g., mqtt://test.mosquitto.org)" required value={newBroker.url} onChange={e => setNewBroker({...newBroker, url: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
              <input type="number" placeholder="Port (e.g. 1883 or 8883)" value={newBroker.port} onChange={e => setNewBroker({...newBroker, port: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
              <div className="flex gap-3">
                <input type="text" placeholder="Username (Optional)" value={newBroker.username} onChange={e => setNewBroker({...newBroker, username: e.target.value})} className="w-1/2 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
                <input type="password" placeholder="Password (Optional)" value={newBroker.password} onChange={e => setNewBroker({...newBroker, password: e.target.value})} className="w-1/2 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
              </div>
              <input type="text" placeholder="Topic (Default: #)" value={newBroker.topic} onChange={e => setNewBroker({...newBroker, topic: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 text-sm" />
              <button disabled={brokerLoading} type="submit" className="mt-2 bg-slate-900 hover:bg-slate-800 dark:hover:bg-cyan-700 dark:bg-cyan-600 text-white font-bold py-2 rounded-xl transition-colors text-sm disabled:opacity-50">
                {brokerLoading ? 'Connecting...' : 'Connect (Temporary)'}
              </button>
              {/* disconnect button removes all brokers and closes the socket */}
              <button type="button" onClick={handleDisconnect} className="mt-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 rounded-xl transition-colors text-sm">
                Disconnect
              </button>
              {brokerMsg && <p className="text-xs mt-1 font-semibold text-slate-600 dark:text-slate-400">{brokerMsg}</p>}
            </form>

            {/* Active Connections List */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Active Custom Brokers</h3>
              {brokers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No custom brokers added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {brokers.map(b => (
                    <li key={b._id} className="text-sm bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-zinc-700 flex justify-between items-center group">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">{b.name}</span>
                      <div className="flex items-center gap-3">
                        {/* show connection status indicator for each broker */}
                        {b.status === 'connecting' ? (
                           <span className="text-xs text-slate-400 animate-pulse">Connecting...</span>
                        ) : b.status === 'error' ? (
                           <span className="text-xs font-bold text-red-500" title="Connection Error">Failed</span>
                        ) : !b.connected ? (
                           <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" title="Offline"></span>
                        ) : (
                           <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" title="Connected"></span>
                        )}
                        <button 
                          onClick={() => handleDeleteBroker(b._id)} 
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" 
                          title="Disconnect"
                        >
                          ✖
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Connected Devices Status Panel */}
          <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-grow">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 dark:text-white flex items-center gap-2">
              🟢 Connected Devices
            </h2>
            {activeDevices.length === 0 ? (
              <p className="text-slate-400 text-sm">No devices detected. Waiting for data...</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeDevices.map(device => (
                  <div key={device.id} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 px-4 py-3 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-200">{device.id}</span>
                    {/* show online/offline badge per device */}
                    {device.status === 'online' ? (
                      <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-500 text-sm font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Offline
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Feed and Commands */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Live Data Feed */}
          <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-grow">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 dark:text-white flex items-center gap-2">
              📡 Live Data Feed
            </h2>
            <div className="bg-slate-50 dark:bg-zinc-800/50 dark:bg-zinc-950 rounded-xl p-4 h-96 overflow-y-auto border border-slate-100 dark:border-zinc-800 font-mono text-sm shadow-inner">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400 italic">Listening for MQTT messages...</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((msg, index) => (
                    <li key={index} className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm transition-all hover:border-sky-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">Topic: {msg.topic}</span>
                        <span className="text-xs text-slate-400">{new Date(msg.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 dark:text-slate-200 mt-2 break-all whitespace-pre-wrap font-medium">
                        {msg.payload}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
