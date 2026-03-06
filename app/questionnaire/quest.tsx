"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  text: string;
  options: string[];
  type?: "single" | "multi";
};
class Answer {
  questionIndex: number;
  value: string; 
  constructor(questionIndex: number,value: string){
    this.questionIndex=questionIndex;
    this.value=value;
  }
}

const INTERESTS = [
  'Food & Dining',
  'Museums & Culture',
  'Outdoors & Nature',
  'Shopping',
  'Nightlife',
  'History',
  'Adventure'
];

const TRANSPORT = [
  'Rental Car',
  'public transit',
  'Trains/Trams',
  'Taxis',
  'walking',
  'I would prefer close proximity excursions only'
]

const questions: Question[] = [
  {
    text: "Are you ready to plan your trip?",
    options: ["Yes", "No"],
    type: "single",
  },
  
  {
    text: "Who will this Trip be for?",
    options: ["Children", "Family", "Adult"],
    type: "single",
  },

  {
    text: "How early do you want to start your days?",
    options: ["9am", "10am", "11am", "12pm", "1pm"],
    type: "single",
  },
  {
    text: "What is the maximum time you are willing to spend at an excursion?",
    options: ["1 Hour","1 1/2 Hours","2 Hours","3-4 Hours","5+ Hours","No Preference"],
    type: "single",
  },
  {
    text: "What is the maximum number of activities you are willing to do in a day?",
    options: ["1", "2", "3", "4", "5"],
    type: "single",
  },
  {
    text: "What modes of transportation are you comfortable with?",
    options: TRANSPORT,
    type: "multi",
  },
  {
  text: "Select all that apply: What are your interests?",
  options: INTERESTS,
  type: "multi",
  },
];

export default function TripTailorQuestionnaire() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [multiAnswers, setMultiAnswers] = useState<string[]>([]);
  const router = useRouter();

  const toggleMultiAnswer = (value: string) => {
  setMultiAnswers(prev =>
    prev.includes(value)
      ? prev.filter(v => v !== value)
      : [...prev, value]
  );
  };
  const submitMultiAnswers = () => {
  const newAnswer = new Answer(current, multiAnswers.join(", "));
  setAnswers(prev => [
    ...prev.filter(a => a.questionIndex !== current),
    newAnswer
  ]);

  setMultiAnswers([]);
  setCurrent(current + 1);
  };
  const handleAnswer = (value: string) => {
    const newAnswer=new Answer(current,value);
    setAnswers(prev=>[... prev.filter(a=>a.questionIndex!==current),
      newAnswer
    ]);
    setCurrent(current+1);
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

        const answered=answers.find(a=>a.questionIndex===index)
        if (answered) {
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

            {answered && (
              <p className="ml-6 text-sm text-gray-600">
                Answer: {answered.value}
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

      {answers.sort((a,b)=>a.questionIndex-b.questionIndex).map((ans)=>(
        <p key={ans.questionIndex}>
          Q{ans.questionIndex+1}:{ans.value}
        </p>
      ))}

      <button
        onClick={() => {
          setCurrent(0);
          setAnswers([]);
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

{questions[current].type === "multi" ? (

  <>
    {questions[current].options.map((option) => (
      <label key={option} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={multiAnswers.includes(option)}
          onChange={() => toggleMultiAnswer(option)}
        />
        {option}
      </label>
    ))}

    <button
      onClick={submitMultiAnswers}
      className="mt-4 px-6 py-3 bg-blue-600 text-black rounded-lg"
    >
      Continue
    </button>
  </>

) : (

  questions[current].options.map((option) => (
    <button
      key={option}
      onClick={() => handleAnswer(option)}
      className="px-6 py-3 bg-blue-600 text-black rounded-lg"
    >
      {option}
    </button>
  ))

)}

</div>  
    </>
  )}

</div>
  /* its composite design pattern instead */
</div>
  );
}