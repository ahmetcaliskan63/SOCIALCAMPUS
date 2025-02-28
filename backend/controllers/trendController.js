const Trend = require('../models/trendModel');
const { v4: uuidv4 } = require('uuid');

// Gündem konusu oluştur
const createTrend = async (req, res) => {
    try {
        const trendData = {
            id: uuidv4(),
            ...req.body
        };

        const result = await Trend.create(trendData);
        
        if (result) {
            res.status(201).json({
                success: true,
                data: trendData
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Gündem konusu oluşturulamadı',
            error: error.message
        });
    }
};

// Gündem konusu getir
const getTrend = async (req, res) => {
    try {
        const trend = await Trend.findById(req.params.id);
        
        if (trend) {
            res.status(200).json({
                success: true,
                data: trend
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Gündem konusu bulunamadı'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gündem konusu alınamadı',
            error: error.message
        });
    }
};

// Gündem konusu güncelle
const updateTrend = async (req, res) => {
    try {
        const result = await Trend.update(req.params.id, req.body);
        
        if (result.affectedRows > 0) {
            const updatedTrend = await Trend.findById(req.params.id);
            res.status(200).json({
                success: true,
                data: updatedTrend
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Gündem konusu bulunamadı'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gündem konusu güncellenemedi',
            error: error.message
        });
    }
};

// Gündem konusu sil
const deleteTrend = async (req, res) => {
    try {
        const result = await Trend.delete(req.params.id);
        
        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Gündem konusu başarıyla silindi'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Gündem konusu bulunamadı'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gündem konusu silinemedi',
            error: error.message
        });
    }
};

// Tüm gündem konularını getir
const getAllTrends = async (req, res) => {
    try {
        const trends = await Trend.getAllTrends();
        
        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gündem konuları alınamadı',
            error: error.message
        });
    }
};

// Gündem konularının sıralamasını güncelle
const updateTrendOrder = async (req, res) => {
    try {
        const result = await Trend.updateOrder(req.body.trends);
        
        if (result) {
            const updatedTrends = await Trend.getAllTrends();
            res.status(200).json({
                success: true,
                data: updatedTrends
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gündem konuları sıralaması güncellenemedi',
            error: error.message
        });
    }
};

module.exports = {
    createTrend,
    getTrend,
    updateTrend,
    deleteTrend,
    getAllTrends,
    updateTrendOrder
}; 