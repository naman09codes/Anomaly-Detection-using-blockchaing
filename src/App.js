import React, { useState } from 'react';
import { ethers } from 'ethers';

// Contract and Node Details (Verify with your setup)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = ["function transferMoney(uint256 amount) public payable"];

function App() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState('');
  const [threshold, setThreshold] = useState(5); 
  const [history, setHistory] = useState([]); 

  // Wallet Connection
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setStatus('Wallet Connected ✅');
      } catch (err) {
        setStatus('Connection Error ❌');
      }
    } else {
      alert("Please Install MetaMask Wallet!");
    }
  };

  // Transfer and Anomaly Logic
  const handleTransfer = async () => {
    if (!account) return alert("Connect Wallet First!");
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid ETH Amount");

    try {
      setStatus('Pre-Scan Active...');
      
      // 1. Anomaly Check
      if (parseFloat(amount) > threshold) {
        const flagLog = { 
          amt: amount, 
          type: 'Anomaly Blocked 🚩', 
          time: new Date().toLocaleTimeString(),
          msg: `Threshold Exceeded (${threshold} ETH)`
        };
        // Using function-based state update to prevent loss of logs
        setHistory(prev => [flagLog, ...prev]);
        setStatus('Anomaly Blocked 🚩');
        return;
      }

      // 2. Blockchain Execution
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const amountWei = ethers.parseEther(amount);
      
      setStatus('Waiting for User Confirmation...');
      const tx = await contract.transferMoney(amountWei, {
        value: amountWei,
        gasLimit: 120000
      });

      setStatus('Processing on Ledger...');
      const receipt = await tx.wait(); // Confirm transaction
      
      // 3. Success Log Generation (Green Tick)
      if (receipt) {
        const successLog = { 
          amt: amount, 
          type: 'Verified Transfer ✅', 
          time: new Date().toLocaleTimeString(),
          msg: 'Verified on Blockchain'
        };
        setHistory(prev => [successLog, ...prev]);
        setStatus('Transaction Successful! ✅');
        setAmount(''); 
      }

    } catch (err) {
      console.error(err);
      if (err.code === "ACTION_REJECTED") {
        setStatus('Error: Transaction Rejected ❌');
      } else {
        setStatus('Error: Check MetaMask Balance/Node');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/20">
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center p-5 bg-slate-800 border-b border-slate-700 shadow-xl sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/10 p-2.5 rounded-full border border-blue-500/30 text-3xl">🛡️</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">ANOMALYSHIELD</h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 -mt-1">Anomaly Detection Console</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-xs text-green-400 px-3 py-1 bg-green-900/20 rounded-full border border-green-700/50">Hardhat: 8545</span>
            <button onClick={connectWallet} className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg active:scale-95 text-sm">
              {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "Connect Wallet"}
            </button>
        </div>
      </nav>

      {/* --- DASHBOARD --- */}
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Transfer Panel */}
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <h2 className="text-xl font-bold mb-7 text-slate-200">Secure Transfer Gateway</h2>
            <div className="space-y-6 relative">
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-2 block text-left">Amount to Transfer (ETH)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-5 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-3xl font-mono transition-all" placeholder="0.00" />
              </div>
              <button onClick={handleTransfer} className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-900/30 hover:shadow-blue-500/20 active:scale-95 transition-all">
                Scan & Execute Payment
              </button>
              {status && (
                <div className={`mt-5 p-4 rounded-2xl border-l-4 font-medium transition-all ${status.includes('Blocked') || status.includes('Error') ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-blue-900/20 border-blue-500 text-blue-400'}`}>
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Audit Log / History */}
          <div className="bg-slate-800/60 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-200">Security Audit Trail</h3>
              <span className="text-xs text-slate-500 font-mono">{history.length} Logs</span>
            </div>
            <div className="p-2 max-h-[350px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-20 opacity-30"><span className="text-5xl block">📄</span> No activity logged</div>
              ) : (
                history.map((log, index) => (
                  <div key={index} className="flex justify-between items-center p-4 hover:bg-slate-700/20 rounded-2xl border-b border-slate-700/50 last:border-b-0 transition-colors">
                    <div>
                      <p className="font-mono font-black text-2xl text-blue-400">{log.amt} ETH</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{log.msg}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${log.type.includes('🚩') ? 'bg-red-900/20 text-red-400 border-red-800/50' : 'bg-green-900/20 text-green-400 border-green-800/50'}`}>
                        {log.type}
                      </span>
                      <p className="text-[10px] text-slate-600 mt-2 font-mono">{log.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Engines */}
        <div className="space-y-6 text-left">
          <div className="bg-slate-800 p-7 rounded-3xl border border-slate-700">
            <h3 className="text-md font-bold mb-8 flex items-center">⚙️ Detection Parameters</h3>
            <div className="space-y-9">
              <div>
                <div className="flex justify-between mb-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Threshold Gate</span>
                  <span>{threshold} ETH</span>
                </div>
                <input type="range" min="0.1" max="20" step="0.1" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
                <span className="text-xs font-bold">Real-time Heuristics</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full p-1 flex justify-end animate-pulse shadow-lg shadow-blue-500/50">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-xs font-bold text-blue-300">SCAN STATUS: ACTIVE</p>
            </div>
            <p className="text-[10px] text-slate-600 font-mono leading-relaxed uppercase">
              [Log] Monitoring Localnode...
              Threshold gate active...
              Waiting for incoming hash...
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 border-t border-slate-700 text-center opacity-30">
        <p className="text-[10px] uppercase tracking-[0.2em]">ANOMALYSHIELD v1.0 | Blockchain Security Console</p>
      </footer>
    </div>
  );
}

export default App;