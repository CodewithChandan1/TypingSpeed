import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, RefreshCw, Trophy, History, Settings,  Keyboard, BarChart2, Crown } from 'lucide-react';

// Extended sample texts with different difficulty levels
const sampleTexts = {
  easy: [
    "The quick brown fox jumps over the lazy dog",
    "Pack my box with five dozen liquor jugs",
    "How vexingly quick daft zebras jump"
  ],
  medium: [
    "The five boxing wizards jump quickly over the lazy brown fox",
    "Sphinx of black quartz, judge my vow while playing jazz",
    "Two driven jocks help fax my big quiz while playing sports"
  ],
  hard: [
    "Waltz, nymph, for quick jigs vex Bud in a sophisticated maze of words",
    "The job requires extra pluck and zeal from every young wage earner",
    "Amazingly few discotheques provide jukeboxes worthy of your amazing skills"
  ]
};

type Difficulty = 'easy' | 'medium' | 'hard';
type TestHistory = {
  date: Date;
  wpm: number;
  accuracy: number;
  difficulty: Difficulty;
};

function App() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showSettings, setShowSettings] = useState(false);
  const [testDuration, setTestDuration] = useState(60);
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [personalBest, setPersonalBest] = useState({ wpm: 0, accuracy: 0 });
  const [instantSpeed, setInstantSpeed] = useState(0);
  const [keystrokes, setKeystrokes] = useState({ correct: 0, incorrect: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUpdateTime = useRef(Date.now());

  const generateNewText = useCallback(() => {
    const texts = sampleTexts[difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    setText(texts[randomIndex]);
  }, [difficulty]);

  useEffect(() => {
    generateNewText();
  }, [generateNewText]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const finishTest = () => {
    setIsFinished(true);
    setIsActive(false);
    const newHistory: TestHistory = {
      date: new Date(),
      wpm,
      accuracy,
      difficulty
    };
    setHistory(prev => [...prev, newHistory]);
    
    if (wpm > personalBest.wpm) {
      setPersonalBest(prev => ({ ...prev, wpm }));
    }
    if (accuracy > personalBest.accuracy) {
      setPersonalBest(prev => ({ ...prev, accuracy }));
    }
  };

  const startTest = () => {
    setIsActive(true);
    setUserInput('');
    setTimer(testDuration);
    setWPM(0);
    setAccuracy(100);
    setIsFinished(false);
    setInstantSpeed(0);
    setKeystrokes({ correct: 0, incorrect: 0, total: 0 });
    generateNewText();
    inputRef.current?.focus();
    lastUpdateTime.current = Date.now();
  };

  const calculateInstantSpeed = (value: string) => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - lastUpdateTime.current) / 1000;
    if (timeElapsed > 0) {
      const words = value.trim().split(/\s+/).length;
      const instantWPM = Math.round((words / timeElapsed) * 60);
      setInstantSpeed(instantWPM);
      lastUpdateTime.current = currentTime;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      setIsActive(true);
    }
    
    const value = e.target.value;
    setUserInput(value);

    // Update keystrokes
    const prevCorrect = keystrokes.correct;
    let correctChars = 0;
    const minLength = Math.min(value.length, text.length);
    for (let i = 0; i < minLength; i++) {
      if (value[i] === text[i]) correctChars++;
    }
    
    setKeystrokes(prev => ({
      correct: correctChars,
      incorrect: value.length - correctChars,
      total: prev.total + 1
    }));

    // Calculate accuracy
    const accuracyValue = (correctChars / value.length) * 100;
    setAccuracy(Math.round(accuracyValue) || 100);

    // Calculate WPM
    const words = value.trim().split(/\s+/).length;
    const minutes = (testDuration - timer) / 60;
    if (minutes > 0) {
      setWPM(Math.round(words / minutes));
    }

    // Calculate instant speed
    calculateInstantSpeed(value);

    // Check if completed
    if (value === text) {
      finishTest();
    }
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 98) return 'text-green-600';
    if (acc >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="md:flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-indigo-600">Typing Speed Test</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  title="History"
                >
                  <History size={20} />
                </button>
              </div>
            </div>
            <button
              onClick={startTest}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw size={20} />
              Restart Test
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full p-2 border rounded-md"
                    disabled={isActive}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Duration (seconds)
                  </label>
                  <select
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    disabled={isActive}
                  >
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="120">120</option>
                    <option value="300">300</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Test History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">WPM</th>
                      <th className="px-4 py-2 text-left">Accuracy</th>
                      <th className="px-4 py-2 text-left">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {entry.date.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{entry.wpm}</td>
                        <td className="px-4 py-2">{entry.accuracy}%</td>
                        <td className="px-4 py-2 capitalize">{entry.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Timer size={20} />
                <span className="font-semibold">Time</span>
              </div>
              <span className="text-2xl font-bold">{timer}s</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Trophy size={20} />
                <span className="font-semibold">WPM</span>
              </div>
              <span className="text-2xl font-bold">{wpm}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <BarChart2 size={20} />
                <span className="font-semibold">Accuracy</span>
              </div>
              <span className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
                {accuracy}%
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Keyboard size={20} />
                <span className="font-semibold">Keystrokes</span>
              </div>
              <span className="text-2xl font-bold">{keystrokes.total}</span>
            </div>
          </div>

          {/* Personal Best */}
          {(personalBest.wpm > 0 || personalBest.accuracy > 0) && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Crown size={20} />
                <h3 className="font-semibold">Personal Best</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Best WPM:</span>
                  <span className="ml-2 font-bold">{personalBest.wpm}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Best Accuracy:</span>
                  <span className="ml-2 font-bold">{personalBest.accuracy}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Typing Area */}
          <div className="mb-6">
            <p className="text-lg leading-relaxed bg-gray-50 p-4 rounded-lg">
              {text.split('').map((char, index) => {
                let color = 'text-gray-700';
                if (index < userInput.length) {
                  color = userInput[index] === char ? 'text-green-600' : 'text-red-600';
                }
                return (
                  <span key={index} className={color}>
                    {char}
                  </span>
                );
              })}
            </p>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            className="w-full p-4 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-600 text-lg"
            placeholder="Start typing..."
          />

          {/* Results */}
          {isFinished && (
            <div className="mt-6">
              <div className="bg-green-100 text-green-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Test Complete!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-green-600">Final Speed</p>
                    <p className="text-2xl font-bold">{wpm} WPM</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Accuracy</p>
                    <p className="text-2xl font-bold">{accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Keystrokes</p>
                    <p className="text-2xl font-bold">{keystrokes.total}</p>
                    <p className="text-sm">
                      (Correct: {keystrokes.correct}, Incorrect: {keystrokes.incorrect})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;