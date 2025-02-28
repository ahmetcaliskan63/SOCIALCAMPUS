const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await db.query('SELECT id, email, username FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Bu işlem için yetkiniz yok'
    });
  }
};

module.exports = { protect }; 