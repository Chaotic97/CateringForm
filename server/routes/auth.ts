import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db.ts';

const router = Router();

interface Employee {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const employee = db.prepare('SELECT * FROM employees WHERE username = ?').get(username) as Employee | undefined;
  if (!employee || !bcrypt.compareSync(password, employee.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.employeeId = employee.id;
  req.session.displayName = employee.display_name;
  res.json({ id: employee.id, displayName: employee.display_name });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.employeeId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ id: req.session.employeeId, displayName: req.session.displayName });
});

export default router;
