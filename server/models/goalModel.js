import { db } from "../config/db.js";

export default class Goal {
  static async getAllByUser(user_id) {
    // console.log(user_id);
    
    const [rows] = await db.query('SELECT * FROM goals WHERE user_id = ?', [user_id]);

    
    return rows;
  }

  static async create({ user_id, name, target_amount, deadline }) {
    const [result] = await db.query(
      `INSERT INTO goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)`,
      [user_id, name, target_amount, deadline]
    );
    return result;
  }

  static async delete(goal_id) {
    const [result] = await db.query(`DELETE FROM goals WHERE goal_id = ?`, [goal_id]);
    return result;
  }

  static async addContribution(goal_id, amount) {
    const [result] = await db.query(
      `UPDATE goals SET current_amount = current_amount + ? WHERE goal_id = ?`,
      [amount, goal_id]
    );
    return result;
  }

  static async updateGoal(goal_id, { name, target_amount, deadline }) {
  const fields = [];
  const values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (target_amount) {
    fields.push("target_amount = ?");
    values.push(target_amount);
  }
  if (deadline) {
    fields.push("deadline = ?");
    values.push(deadline);
  }

  if (fields.length === 0) return; // Nothing to update

  const sql = `UPDATE goals SET ${fields.join(", ")} WHERE goal_id = ?`;
  values.push(goal_id);

  const [result] = await db.query(sql, values);
  return result;
}

}
