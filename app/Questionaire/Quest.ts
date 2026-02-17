"use client";

import { useState } from "react";

type Question = {
  text: string;
  options: string[];
};

const questions: Question[] = [
  {
    text: "Are you ready to plan your trip?",
    options: ["Yes", "No"],
  },
  {
    text: "What kind of trip do you envision?",
    options: ["Relaxing", "High-Octane", "Somewhere in-between"],
  },
  {
    text: "What would you like to do more on this trip?",
    options: ["Sightseeing", "Interact", "Both"],
  },
  {
    text: "How far are you willing to travel?",
    options: ["1 - 500 miles", "In the continent", "Overseas"],
  },
];

export default function TripTailor() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    setCurrent(current + 1);
  };

  if (current >= questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">Trip Summary</h1>
        {answers.map((ans, i) => (
          <p key={i} className="mb-2">
            Q{i + 1}: {ans}
          </p>
        ))}
      </div>
    );
  }

  const question = questions[current];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">
        Question {current + 1}
      </h1>

      <p className="mb-6 text-lg">{question.text}</p>

      <div className="flex flex-col gap-4">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
