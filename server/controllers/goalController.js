import Goal from '../models/goalModel.js';

export const getGoals = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const goals = await Goal.getAllByUser(user_id);
    // console.log(goals);
    
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addGoal = async (req, res) => {
  try {
    const { user_id, name, target_amount, deadline } = req.body;
    const result = await Goal.create({ user_id, name, target_amount, deadline });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal_id = req.params.id;
    await Goal.delete(goal_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addContribution = async (req, res) => {
  try {
    const { goal_id, amount } = req.body;
    await Goal.addContribution(goal_id, amount);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};

export const updateGoal = async (req, res) => {
  try {
    const goal_id = req.params.id;
    const { name, target_amount, deadline } = req.body;

    const formattedDeadline = deadline ? new Date(deadline).toISOString().slice(0, 10) : null;

const result = await Goal.updateGoal(goal_id, {
  name,
  target_amount,
  deadline: formattedDeadline,
});
    res.json({ success: true, message: "Goal updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
