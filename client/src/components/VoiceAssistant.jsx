import { useState, useEffect, useContext, useRef } from "react";
import { Mic } from "lucide-react";
import { toast } from "react-toastify";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function VoiceAssistant({ setShouldFetch }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const recognitionRef = useRef(null);

//   // 🧹 Helper to safely show toasts and auto-clean previous ones
// const safeToast = {
//   success: (msg) => {
//     toast.dismiss(); // clear any active toasts
//     toast.success(msg, { autoClose: 3000 });
//   },
//   error: (msg) => {
//     toast.dismiss();
//     toast.error(msg, { autoClose: 4000 });
//   },
// };
// 🔍 Fetch category or subcategory details from backend
const getCategoryAndSubcategory = async (name) => {
  try {
    const res = await fetch(`http://localhost:3000/api/categories/subcategory-info?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch category info");
    console.log("res",res);
    
    return await res.json();
  } catch (err) {
    console.error("Error fetching category/subcategory:", err);
    return null;
  }
};


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Your browser does not support voice recognition",{ autoClose: 3000 });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Command detected:", command);
      handleVoiceCommand(command);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  // 🔹 Convert natural date phrases to ISO format
  const parseDate = (dateStr) => {
    const today = new Date();
    if (!dateStr || dateStr.trim() === "" || dateStr.toLowerCase().includes("today")) {
      return today.toISOString().split("T")[0];
    }

    // ✅ Handle "yesterday"
    if (dateStr.toLowerCase().includes("yesterday")) {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return y.toISOString().split("T")[0];
    }

    // ✅ Handle "day before yesterday"
    if (dateStr.toLowerCase().includes("day before yesterday")) {
      const y2 = new Date(today);
      y2.setDate(today.getDate() - 2);
      return y2.toISOString().split("T")[0];
    }

    // 🧩 Match patterns like "4th Nov", "4 November", "25th December 2024"
    const regex = /(\d{1,2})(?:st|nd|rd|th)?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*(\d{4}))?/i;
    const match = dateStr.match(regex);

    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase().slice(0, 3);
      const year = match[3] ? parseInt(match[3]) : today.getFullYear();

      const monthIndex = [
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec"
      ].indexOf(monthName);

      if (monthIndex !== -1) {
        const parsedDate = new Date(year, monthIndex, day);
        return parsedDate.toISOString().split("T")[0];
      }
    }

    // fallback
    return today.toISOString().split("T")[0];
  };

  const numberToIndianWords = (num) => {
    if (num === 0) return "zero";
    const a = [
      "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
      "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
      "seventeen", "eighteen", "nineteen"
    ];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      const tens = b[Math.floor(n / 10)];
      const ones = a[n % 10];
      return `${tens}${ones ? " " + ones : ""}`;
    };

    let result = "";
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    if (crore) result += numToWords(crore) + " crore ";
    if (lakh) result += numToWords(lakh) + " lakh ";
    if (thousand) result += numToWords(thousand) + " thousand ";
    if (hundred) result += a[hundred] + " hundred ";
    if (remainder) result += (result ? "and " : "") + numToWords(remainder);

    return result.trim();
  };

  const formatSpokenDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = async (command) => {
  if (!userId) {
    toast.error("You must be logged in to use voice commands.",{ autoClose: 3000 });
    speak("Please log in to use voice commands.");
    return;
  }

  try {
    command = command.replace(/^(and|then|please|uh|um|hey|ok)\s+/i, "").trim();

    const expenseRegex = /(add|and|record)?\s*expense\s*(of)?\s*(\d+(?:\.\d+)?)\s*(for|on)?\s*([\w\s&-]+?)(?:\s+(today|yesterday|day before yesterday|(\d{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*\d{4})?)))?$/i;

    const incomeRegex = /(add|and|record)?\s*income\s*(of)?\s*(\d+(?:\.\d+)?)\s*(for|from)?\s*([\w\s]+?)(?:\s*(?:on|for)\s*(.+))?$/i;
    const goalRegex = /(add|and|record)?\s*goal\s*(of)?\s*(\d+(?:\.\d+)?)\s*(for)?\s*([\w\s]+?)(?:\s*(?:by|on)\s*(.+))?$/i;

    let match;

    // 🧾 EXPENSE
    if ((match = command.match(expenseRegex))) {
  const amount = Number(match[3]);
  const rawCategory = match[5]?.trim() || "general";
  const date = parseDate(match[6]?.trim() || "");
  const spokenAmount = numberToIndianWords(amount);
  const spokenDate = formatSpokenDate(date);
  console.log("match",match);
  console.log(rawCategory);

  
  

  const { category_id, subcategory_id } = (await getCategoryAndSubcategory(rawCategory)) || {};
  console.log("category",category_id);
  console.log("sub",subcategory_id);
  
  

  await fetch("http://localhost:3000/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, amount, category: rawCategory, date, category_id, subcategory_id }),
  });

  toast.success(`Added expense of ₹${amount} for ${rawCategory} on ${date}`, { autoClose: 3000 });
  speak(`Added expense of ${spokenAmount} rupees for ${rawCategory} on ${spokenDate}`);
}


    // 💰 INCOME
    else if ((match = command.match(incomeRegex))) {
      const amount = Number(match[3]);
      const source = match[5]?.trim() || "income";
      const datePhrase = match[6]?.trim() || "";
      const date = parseDate(datePhrase);
      const spokenAmount = numberToIndianWords(amount);
      const spokenDate = formatSpokenDate(date);

      await fetch("http://localhost:3000/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, amount, source, date }),
      });

      toast.success(`Added income of ₹${amount} for ${source} on ${date}`,{ autoClose: 3000 });
      speak(`Added income of ${spokenAmount} rupees for ${source} on ${spokenDate}`);
    }

    // 🎯 GOAL
    else if ((match = command.match(goalRegex))) {
      const amount = Number(match[3]);
      const goalName = match[5]?.trim() || "goal";
      const deadlinePhrase = match[6]?.trim() || "";
      const deadline = parseDate(deadlinePhrase);
      const spokenAmount = numberToIndianWords(amount);
      const spokenDate = formatSpokenDate(deadline);

      await fetch("http://localhost:3000/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: goalName,
          target_amount: amount,
          deadline,
        }),
      });

      toast.success(`Added goal of ₹${amount} for ${goalName} by ${deadline}`,{ autoClose: 3000 });
      speak(`Added goal of ${spokenAmount} rupees for ${goalName} by ${spokenDate}`);
    }

    // ❌ Unrecognized command
    else {
      console.warn("⚠️ Unrecognized command:", command);
      toast.error("Sorry, I could not understand your command.",{ autoClose: 3000 });
      speak("Sorry, I could not understand your command. Please try again.");
    }

    setShouldFetch((prev) => !prev);
  } catch (err) {
    console.error(err);
    toast.error("Failed to process voice command.",{ autoClose: 3000 });
    speak("Failed to process your command.");
  }
};


  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className={`p-2 rounded-full transition-transform duration-200 ${
          listening
            ? "bg-green-400 scale-110"
            : theme === "dark"
            ? "bg-white/10 hover:bg-white/20"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        onClick={startListening}
        title={listening ? "Listening..." : "Click to speak"}
      >
        <Mic size={22} className={theme === "dark" ? "text-green-300" : "text-gray-700"} />
      </button>

      {showTooltip && (
        <div
          className={`absolute mt-8 w-64 text-sm rounded-xl shadow-lg p-3 text-center z-10 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border border-gray-700"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          🎙 Try commands like:<br />
          • “Add expense of 2000 for groceries today”<br />
          • “Add expense of 500 for groceries yesterday”<br />
          • “Add income of 5000 for salary”<br />
          • “Add goal of 10000 for vacation by 31 December”
        </div>
      )}
    </div>
  );
}
