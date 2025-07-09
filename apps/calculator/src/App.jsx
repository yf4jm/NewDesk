import { useState } from 'react'
import './App.css'

function App() {
  const [calc, setCalc] = useState("");
  const [result, setResult] = useState("");

  const ops = ['/', '*', '+', '-', '.'];

  const safeCalculate = (expression) => {
    // Remove any non-allowed characters
    expression = expression.replace(/[^0-9+\-*/.]/g, '');
    
    try {
      // Split by operators while keeping them
      const tokens = expression.split(/([+\-*\/])/).filter(Boolean);
      let currentNumber = parseFloat(tokens[0]);
      
      for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextNumber = parseFloat(tokens[i + 1]);
        
        switch (operator) {
          case '+':
            currentNumber += nextNumber;
            break;
          case '-':
            currentNumber -= nextNumber;
            break;
          case '*':
            currentNumber *= nextNumber;
            break;
          case '/':
            if (nextNumber === 0) throw new Error('Division by zero');
            currentNumber /= nextNumber;
            break;
          default:
            throw new Error('Invalid operator');
        }
      }
      
      return currentNumber.toString();
    } catch (error) {
      return "";
    }
  }

  const updateCalc = (value) => {
    if (
      (ops.includes(value) && calc === '') || 
      (ops.includes(value) && ops.includes(calc.slice(-1)))
    ) {
      return;
    }
    const newCalc = calc + value;
    setCalc(newCalc);

    if (!ops.includes(value)) {
      const result = safeCalculate(newCalc);
      setResult(result);
    }
  }

  const calculate = () => {
    const result = safeCalculate(calc);
    if (result) {
      setCalc(result);
    }
  }

  const deleteLast = () => {
    if (calc === '') {
      return;
    }
    const value = calc.slice(0, -1);
    setCalc(value);
  }

  const clear = () => {
    setCalc("");
    setResult("");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="h-24 bg-gray-50 rounded-lg mb-4 flex flex-col items-end justify-between p-4">
            <div className="text-gray-400 text-sm">{result || "0"}</div>
            <div className="text-2xl font-semibold">{calc || "0"}</div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <button onClick={clear} className="col-span-2 p-4 text-white bg-red-500 rounded-lg hover:bg-red-600">AC</button>
            <button onClick={deleteLast} className="p-4 text-white bg-gray-500 rounded-lg hover:bg-gray-600">DEL</button>
            <button onClick={() => updateCalc('/')} className="p-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600">/</button>

            <button onClick={() => updateCalc('7')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">7</button>
            <button onClick={() => updateCalc('8')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">8</button>
            <button onClick={() => updateCalc('9')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">9</button>
            <button onClick={() => updateCalc('*')} className="p-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600">×</button>

            <button onClick={() => updateCalc('4')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">4</button>
            <button onClick={() => updateCalc('5')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">5</button>
            <button onClick={() => updateCalc('6')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">6</button>
            <button onClick={() => updateCalc('-')} className="p-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600">-</button>

            <button onClick={() => updateCalc('1')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">1</button>
            <button onClick={() => updateCalc('2')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">2</button>
            <button onClick={() => updateCalc('3')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">3</button>
            <button onClick={() => updateCalc('+')} className="p-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600">+</button>

            <button onClick={() => updateCalc('0')} className="col-span-2 p-4 bg-gray-100 rounded-lg hover:bg-gray-200">0</button>
            <button onClick={() => updateCalc('.')} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">.</button>
            <button onClick={calculate} className="p-4 text-white bg-green-500 rounded-lg hover:bg-green-600">=</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
