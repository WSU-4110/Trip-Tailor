"use client";
//this page is used after the generation page so user can give the database variable to use to generate trips
//the variable is such as interests, energy level
//disability accomodation //age // indoor/outdoorness
import { useState,useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    text: "What kind of trip do you envision?",
    options: ["Relaxing", "Somewhere In-Between", "High Octane"],
    type: "single",
  },
  {
    text: "Who will this Trip be for?",
    options: ["Children", "all-ages", "Adult"],
    type: "single",
  },
   {
    text: "What would you like to do in this trip?",
    options: ["see/hear only", "both", "active"],
    type: "single",
  },
  {
    text: "Do you prefer to be outside or inside?",
    options: ["inside", "mixed", "outside"],
    type: "single",
  },
  
  {
    text: "How many locations do you want to visit in a day?",
    options: ["1", "2", "3", "4", "5"],
    type: "single",
  },
   //deleted time in place, because user can decide it on their own
  {
    text: "What interests you?",
    options: INTERESTS,
    type: "multi",
  },
   {
    text: "Do you, or anyone you're with needed disability accomodation?",
    options: ["Yes","No"],
    type: "single",
  },

 
];

export default function TripTailorQuestionnaire() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [multiAnswers, setMultiAnswers] = useState<string[]>([]);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/Login");
    }
  }, [router]);

  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const destination = searchParams.get("destination") || "Detroit";
  const state = searchParams.get("state") || ""
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

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

  const getAnswerValue = (questionIndex: number) => {
  return answers.find((a) => a.questionIndex === questionIndex)?.value;
};

  const buildPayload = () => {
    const tripStyle = getAnswerValue(0);
    const audience = getAnswerValue(1);
    const activityMode = getAnswerValue(2);
    const indoorOutdoor = getAnswerValue(3);
    const locationsPerDay = getAnswerValue(4);
    const interestsRaw = getAnswerValue(5);
    const accessibility = getAnswerValue(6);

    const preferredCategories: string[] = [];
    const excludedCategories: string[] = [];

    const interests = interestsRaw
      ? interestsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    if (interests.includes("Museums & Culture")) preferredCategories.push("museum");
    if (interests.includes("Outdoors & Nature")) preferredCategories.push("park");
    if (interests.includes("Nightlife")) preferredCategories.push("nightlife", "bar");
    if (interests.length <= 2 && interests.includes("Nightlife")) {
      excludedCategories.push("museum", "park", "movie_theater", "cafe");
    }
    if (interests.includes("History")) preferredCategories.push("museum");
    if (interests.includes("Adventure")) preferredCategories.push("outdoor", "entertainment");

    if (!interests.includes("Nightlife")) excludedCategories.push("bar");

    let maxEffortLevel = 3;
    if (tripStyle === "Relaxing") maxEffortLevel = 2;
    if (tripStyle === "Somewhere In-Between") maxEffortLevel = 3;
    if (tripStyle === "High Octane") maxEffortLevel = 5;

    let indoorOutdoorPreference = "either";
    if (indoorOutdoor === "inside") indoorOutdoorPreference = "indoor";
    if (indoorOutdoor === "outside") indoorOutdoorPreference = "outdoor";

    const hasKids = audience === "Children" || audience === "all-ages";
    const goodForKidsRequired = audience === "Children";
    const familyFriendlyRequired = audience === "Children" || audience === "all-ages";

    return {
      user_id: null,
      title: `${destination} Trip`,
      destination_city: destination,
      destination_region: null,
      destination_country: "US",
      start_date: startDate,
      end_date: endDate,
      budget_level: "medium",
      group_size: 2,
      has_kids: hasKids,
      family_friendly_required: familyFriendlyRequired,
      good_for_groups_required: true,
      good_for_kids_required: goodForKidsRequired,
      indoor_outdoor_preference: indoorOutdoorPreference,
      max_effort_level: maxEffortLevel,
      preferred_categories: preferredCategories,
      excluded_categories: excludedCategories,
      activities_per_day: Number(locationsPerDay || "3"),
      accessibility_requested: accessibility === "Yes",
      questionnaire_answers: answers,
      activity_mode: activityMode,
    };
  };

  const handleGenerateTrip = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = buildPayload();

      const res = await fetch("http://localhost:5050/api/v1/trips/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate trip");
      }

      const data = await res.json();
      router.push(`/trip/${data.trip.id}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  
    return (
  <div className="min-h-screen bg-white flex p-6 gap-10"
  style={{ backgroundImage: "url('/bridge.png')" }}
  >

    {/* Progress Sidebar */}
    <div className="w-1/3">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Progress</h2>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-4 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {questions.map((_, index) => {
        let statusIcon = "•";
        let textColor = "text-gray-400 dark:text-gray-500";

        const answered=answers.find(a=>a.questionIndex===index)
        if (answered) {
          statusIcon = "✓";
          textColor = "text-green-600 dark:text-green-500";
        } else if (index === current) {
          statusIcon = "➤";
          textColor = "text-blue-600 dark:text-blue-400";
        }

        return (
          <div key={index} className="mb-3">
            <p className={`font-semibold ${textColor}`}>
              {statusIcon} Step {index + 1}
            </p>

            {answered && (
              <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">
                Answer: {answered.value}
              </p>
            )}
          </div>
        );
      })}
    </div>

    {/* Question Area */}
  <div className="flex-1 flex flex-col items-center justify-center text-black dark:text-white">

  {current >= questions.length ? (

    /* SUMMARY SCREEN */
    <>
      <h1 className="mb-4 rounded-lg border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 px-4 py-3 text-blue-700 dark:text-white">
        Trip Summary
      </h1>
      {isSubmitting && (
        <div className="mb-4 rounded-lg border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 px-4 py-3 text-blue-700 dark:text-white">
          Generating your itinerary and saving your trip...
        </div>
      )}

      {answers.sort((a,b)=>a.questionIndex-b.questionIndex).map((ans)=>(
        <p key={ans.questionIndex} className="text-gray-700 dark:text-gray-200">
          <span className="font-semibold">Q{ans.questionIndex + 1}:</span> {ans.value}
        </p>
      ))}

            <div className="mt-6 flex flex-col gap-4">
        <button
          onClick={handleGenerateTrip}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Generating trip your..." : "Generate Trip"}
        </button>

        {submitError && (
          <div className="rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            Failed to generate your trip. Please try again.
          <div className="text-red-600 dark:text-red-300 text-sm">{submitError}</div>
        </div>
        )}

        <button
          onClick={() => {
            setCurrent(0);
            setAnswers([]);
            setMultiAnswers([]);
            setSubmitError(null);
          }}
          disabled={isSubmitting}
          className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          Restart Questionnaire
        </button>

        <button
          onClick={() => router.push("/")}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-800 dark:bg-slate-700 text-white rounded-lg disabled:opacity-50"
        >
          Return to Home Page
        </button>
      </div>
    </>

  ) : (

    /*  QUESTION SCREEN */
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Question {current + 1}
      </h1>

      <p className="mb-6 text-lg text-gray-900 dark:text-gray-200">
        {questions[current].text}
      </p>

    <div className="flex flex-col gap-4">

{questions[current].type === "multi" ? (

  <>
    {questions[current].options.map((option) => (
      <label key={option} className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
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
      className="mt-4 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-black dark:text-white rounded-lg"
    >
      Continue
    </button>
  </>

) : (

  questions[current].options.map((option) => (
    <button
      key={option}
      onClick={() => handleAnswer(option)}
      className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-black dark:text-white rounded-lg"
    >
      {option}
    </button>
  ))

)}

</div>  
    </>
  )}

</div>
</div>
  );
}