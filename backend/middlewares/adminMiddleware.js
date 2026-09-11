// Must run after `protect` - checks req.user.role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: admin role required' });
};

module.exports = { admin };
