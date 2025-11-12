import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function EditGoalModal({ goal, isOpen, onClose, fetchGoals }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  // Update state when goal changes
  useEffect(() => {
    if (goal) {
      setName(goal.name || "");
      setTarget(goal.target_amount || "");
      setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
    }
  }, [goal]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      const formattedDeadline = deadline ? new Date(deadline).toISOString().split("T")[0] : null;

      await axios.put(`http://localhost:3000/api/goals/${goal.goal_id}`, {
        name,
        target_amount: target,
        deadline: formattedDeadline,
      });

      toast.success("Goal updated successfully!");
      fetchGoals();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update goal");
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Edit Goal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target Amount"
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border p-2 rounded"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
