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

    return res.json({ token, role: user.role , name: user.name,
      email: user.email});
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Admin adds staff
export const addStaff = async (req, res) => {
  const { name, email, password, pagesAllowed } = req.body; // pagesAllowed = array of page routes staff can access
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name,email,password,role,pagesAllowed) VALUES (?,?,?,?,?)',
      [name, email, hashedPassword, 'staff', JSON.stringify(pagesAllowed)],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json({ message: 'Staff added successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
