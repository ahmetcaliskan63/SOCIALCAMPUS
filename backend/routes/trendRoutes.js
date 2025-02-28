const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createTrend,
    getTrend,
    updateTrend,
    deleteTrend,
    getAllTrends,
    updateTrendOrder
} = require('../controllers/trendController');

// Public routes
router.get('/', getAllTrends);
router.get('/:id', getTrend);

// Protected routes
router.use(protect);
router.post('/', createTrend);
router.put('/:id', updateTrend);
router.delete('/:id', deleteTrend);
router.put('/order/update', updateTrendOrder);

module.exports = router; 