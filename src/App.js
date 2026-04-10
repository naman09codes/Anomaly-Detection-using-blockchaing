import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = ["function transferMoney(uint256 amount) public payable"];

function App() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setStatus('Connected ✅');
      } catch (err) {
        setStatus('Connection Error ❌');
      }
    } else {
      alert("MetaMask Install Karo!");
    }
  };

  const handleTransfer = async () => {
    if (!account) return alert("Pehle Wallet Connect Button dabao!");
    if (!amount) return alert("Amount toh daalo bhai!");

    try {
      setStatus('Scanning...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // Anomaly Detection Logic
      if (parseFloat(amount) > 5) {
        setStatus('Anomaly Detected! Transaction Flagged 🚩');
        return;
      }

    
      const tx = await contract.transferMoney(ethers.parseEther(amount), {
        value: ethers.parseEther(amount),
        gasLimit: 120000
      });

      setStatus('Processing...');
      await tx.wait();
      setStatus('Transaction Successful! ✅');
    } catch (err) {
      console.error(err);
      setStatus('Error: Check MetaMask Balance');
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '450px', border: '1px solid #334155' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#38bdf8', fontSize: '2.5rem', fontWeight: 'bold' }}>BankGuard AI</h1>
          <p style={{ color: '#94a3b8' }}>Blockchain Anomaly Detection</p>
        </div>

        <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #334155' }}>
          <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>ACTIVE WALLET</p>
          {account ? (
            <p style={{ fontSize: '0.8rem', color: '#10b981', wordBreak: 'break-all' }}>{account}</p>
          ) : (
            <button onClick={connectWallet} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>CONNECT WALLET</button>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>TRANSFER AMOUNT (ETH)</p>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" 
            style={{ width: '100%', padding: '1rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', color: 'white' }} 
          />
        </div>

        <button onClick={handleTransfer} style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          Transfer & Scan
        </button>

        {status && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', backgroundColor: status.includes('Anomaly') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${status.includes('Anomaly') ? '#ef4444' : '#10b981'}`, color: status.includes('Anomaly') ? '#fca5a5' : '#6ee7b7' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;