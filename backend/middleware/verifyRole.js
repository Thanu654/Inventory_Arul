export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};

export const isStaff = (req, res, next) => {
  if (req.user.role !== 'staff') return res.status(403).json({ message: 'Staff access only' });
  next();
};
