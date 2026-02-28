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
    text: "What kind of Trip do you envision?",
    options: ["Relaxing", "High-Octane", "Somewhere in-between"],
  },
  {
    text: "What would you like to do more in this trip?",
    options: ["Sightseeing", "Interact", "Both"],
  },
  
  {
    text: "How close to nature would you like this trip to be?",
    options: ["Very-close", "Mixed", "Indoor only"],
  },
  {
    text: "Who will this Trip be for?",
    options: ["Children", "Family", "Adult"],
  },
  {
    text: "How much energy level are you willing to spend on this event?",
    options: ["1", "2", "3", "4", "5"],
  },
  {
    text: "How long do you want to spend on each site?",
    options: ["0","1","2","3","4","5","6","7","8"],
  },
  {
    text: "How many sites do you want to go to on the day of the trip?",
    options: ["1", "2", "3", "4", "5"],
  },
  {
    text: "Do you, or anyone you're with, need disability accommodation?",
    options: ["Yes", "No"],
  },
];

export default function TripTailor() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{[key:number]:string}>({});


  const handleAnswer = (answer: string) => {
    setAnswers({...answers,[current]: answer,});
    setCurrent(current + 1);
  };

  if (current >= questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6 text-black">Trip Summary</h1>
        {Object.entries(answers).map(([qIndex,ans])=>(
          <p key={qIndex}>
            Q{Number(qIndex)+1}:{ans}
          </p>
        ))}

        <button
          onClick={() => {
            setCurrent(0);
            setAnswers([]);
          }}
          className="mt-6 px-6 py-3 bg-green-600 text-gray-900 rounded-lg hover:bg-white-700 transition"
        >
          Restart Questionnaire
        </button>
      </div>
    );
  }

  const question = questions[current];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Question {current + 1}
      </h1>

      <p className="mb-6 text-lg text-gray-900">{question.text}</p>

      <div className="flex flex-col gap-4">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="px-6 py-3 bg-blue-600 text-gray-900 rounded-lg hover:bg-white-700 transition"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}