import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const login = async (req, res) => {
  try {
    console.log('Login payload received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) 
      return res.status(400).json({ message: 'Email and password required' });

    // Use async/await
    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'User not found' });

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    console.log('Login successful:', user.email);
   
    const [perms] = await db.query(
        "SELECT page FROM permissions WHERE user_id=? AND can_access=1",
        [user.id]
        );

    return res.json({ token, role: user.role , name: user.name,
      email: user.email, permissions: perms.map(p => p.page)});
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE status = "active" ORDER BY name ASC'
    );
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

