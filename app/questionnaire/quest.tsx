"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleAnswer = (answer: string) => {
    setAnswers({...answers,[current]: answer,});
    setCurrent(current + 1);
  };

  
    return (
  <div className="min-h-screen bg-white flex p-6 gap-10">

    {/* Progress Sidebar */}
    <div className="w-1/3">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Progress</h2>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {questions.map((q, index) => {
        let statusIcon = "•";
        let textColor = "text-gray-400";

        if (answers[index]) {
          statusIcon = "✓";
          textColor = "text-green-600";
        } else if (index === current) {
          statusIcon = "➤";
          textColor = "text-blue-600";
        }

        return (
          <div key={index} className="mb-3">
            <p className={`font-semibold ${textColor}`}>
              {statusIcon} Step {index + 1}
            </p>

            {answers[index] && (
              <p className="ml-6 text-sm text-gray-600">
                Answer: {answers[index]}
              </p>
            )}
          </div>
        );
      })}
    </div>

    {/* Question Area */}
<div className="flex-1 flex flex-col items-center justify-center text-black">

  {current >= questions.length ? (

    /* SUMMARY SCREEN */
    <>
      <h1 className="text-3xl font-bold mb-6 text-black">
        Trip Summary
      </h1>

      {Object.entries(answers).map(([qIndex, ans]) => (
        <p key={qIndex}>
          Q{Number(qIndex) + 1}: {ans}
        </p>
      ))}

      <button
        onClick={() => {
          setCurrent(0);
          setAnswers({});
        }}
        className="mt-6 px-6 py-3 bg-green-600 text-black rounded-lg"
      >
        Restart Questionnaire
      </button>
      
      <button
      onClick={() => router.push("/")}
      className="mt-4 px-6 py-3 bg-gray-800 text-white rounded-lg"
    >
      Return to Home Page
    </button>
    </>

  ) : (

    /*  QUESTION SCREEN */
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Question {current + 1}
      </h1>

      <p className="mb-6 text-lg text-gray-900">
        {questions[current].text}
      </p>

      <div className="flex flex-col gap-4">
        {questions[current].options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="px-6 py-3 bg-blue-600 text-black rounded-lg"
          >
            {option}
          </button>
        ))}
      </div>
    </>
  )}

</div>
  
</div>
  );
}