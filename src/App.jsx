import { useState } from "react";
import { ethers } from "ethers";
import { SnackbarProvider, useSnackbar } from "notistack";
import "./App.css";
import abi from "./abi.json";

const App = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [contract, setContract] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const contractAddress = "0x94a39Ee9df7823312b869b8d81E152493B1df810"; // Replace with deployed contract address

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        enqueueSnackbar("Please install Metamask!", { variant: "error" });
        return;
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
  
      // Request wallet connection (wait for user approval)
      await provider.send("eth_requestAccounts", []);
  
      // Ensure the signer and contract are properly set
      const signer = provider.getSigner();
      const deployedContract = new ethers.Contract(contractAddress, abi, signer);
      setContract(deployedContract);
  
      // Wallet connected successfully
      enqueueSnackbar("Wallet connected successfully!", { variant: "success" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to connect wallet. Please try again.", { variant: "error" });
    }
  };
  

  const fetchBalance = async () => {
    if (contract) {
      try {
        const balance = await contract.getBalance();
        setBalance(balance.toString());
        enqueueSnackbar(`Balance fetched: ${balance.toString()} ETH`, { variant: "info" });
      } catch (err) {
        enqueueSnackbar("Failed to fetch balance", { variant: "error" });
        console.error(err);
      }
    }
  };

  const handleDeposit = async () => {
    if (contract) {
      try {
        const tx = await contract.deposit(amount, { value: ethers.parseEther(amount) });
        await tx.wait();
        setAmount("");
        fetchBalance();
        enqueueSnackbar("Deposit successful!", { variant: "success" });
      } catch (err) {
        enqueueSnackbar("Deposit failed", { variant: "error" });
        console.error(err);
      }
    }
  };

  const handleWithdraw = async () => {
    if (contract) {
      try {
        const tx = await contract.withdraw(amount);
        await tx.wait();
        setAmount("");
        fetchBalance();
        enqueueSnackbar("Withdrawal successful!", { variant: "success" });
      } catch (err) {
        setErrorMessage(err.reason || "Transaction failed");
        enqueueSnackbar(err.reason || "Withdrawal failed", { variant: "error" });
        console.error(err);
      }
    }
  };

  return (
    <div className="app bg-gray-100 min-h-screen flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-5">Assessment DApp</h1>
        <button
          className="w-full py-2 mb-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>

        <div className="balance text-center mb-6">
          <h2 className="text-lg font-medium">Contract Balance:</h2>
          <p className="text-xl font-semibold text-blue-500">{balance} ETH</p>
          <button
            className="mt-2 py-1 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            onClick={fetchBalance}
          >
            Refresh Balance
          </button>
        </div>

        <div className="actions">
          <input
            type="number"
            className="w-full p-3 border rounded-lg mb-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button
            className="w-full py-2 mb-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            onClick={handleDeposit}
          >
            Deposit
          </button>
          <button
            className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        </div>

        {errorMessage && (
          <p className="error text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

const WrappedApp = () => (
  <SnackbarProvider maxSnack={3}>
    <App />
  </SnackbarProvider>
);

export default WrappedApp;
