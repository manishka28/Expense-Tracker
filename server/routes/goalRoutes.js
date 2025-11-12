import express from 'express';
import { getGoals, addGoal, deleteGoal, addContribution, updateGoal } from '../controllers/goalController.js';

const router = express.Router();

router.get('/:userId', getGoals);
router.post('/', addGoal);
router.delete('/:id', deleteGoal);
router.put('/contribute', addContribution);
router.put('/:id', updateGoal); // ✅ new route for editing a goal

export default router;
