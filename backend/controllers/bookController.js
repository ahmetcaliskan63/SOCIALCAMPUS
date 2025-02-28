const Book = require('../models/bookModel');
const { v4: uuidv4 } = require('uuid');

// Kitap oluştur
const createBook = async (req, res) => {
    try {
        const bookData = {
            id: uuidv4(),
            satici_id: req.user.id,
            satici_adi: req.user.tam_ad,
            satici_fakulte: req.user.fakulte,
            satici_bolum: req.user.bolum,
            ...req.body
        };

        const result = await Book.create(bookData);
        
        if (result) {
            res.status(201).json({
                success: true,
                data: bookData
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kitap oluşturulamadı',
            error: error.message
        });
    }
};

// Kitap getir
const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (book) {
            res.status(200).json({
                success: true,
                data: book
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Kitap bulunamadı'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitap alınamadı',
            error: error.message
        });
    }
};

// Satıcının kitaplarını getir
const getSellerBooks = async (req, res) => {
    try {
        const books = await Book.findBySellerId(req.params.satici_id);
        
        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitaplar alınamadı',
            error: error.message
        });
    }
};

// Kitap güncelle
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Kitap bulunamadı'
            });
        }

        // Kitabı sadece sahibi güncelleyebilir
        if (book.satici_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        const result = await Book.update(req.params.id, req.body);
        
        if (result.affectedRows > 0) {
            const updatedBook = await Book.findById(req.params.id);
            res.status(200).json({
                success: true,
                data: updatedBook
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitap güncellenemedi',
            error: error.message
        });
    }
};

// Kitap sil
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Kitap bulunamadı'
            });
        }

        // Kitabı sadece sahibi silebilir
        if (book.satici_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        const result = await Book.delete(req.params.id);
        
        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Kitap başarıyla silindi'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitap silinemedi',
            error: error.message
        });
    }
};

// Kategoriye göre kitapları getir
const getBooksByCategory = async (req, res) => {
    try {
        const books = await Book.findByCategory(req.params.kategori);
        
        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitaplar alınamadı',
            error: error.message
        });
    }
};

// Fakülteye göre kitapları getir
const getBooksByFaculty = async (req, res) => {
    try {
        const books = await Book.findByFaculty(req.params.fakulte);
        
        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitaplar alınamadı',
            error: error.message
        });
    }
};

// Tüm kitapları getir
const getAllBooks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const books = await Book.getAllBooks(limit, offset);
        
        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitaplar alınamadı',
            error: error.message
        });
    }
};

// Kitap durumunu güncelle
const updateBookStatus = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Kitap bulunamadı'
            });
        }

        // Durumu sadece kitabın sahibi güncelleyebilir
        if (book.satici_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        const result = await Book.updateStatus(req.params.id, req.body.durum);
        
        if (result.affectedRows > 0) {
            const updatedBook = await Book.findById(req.params.id);
            res.status(200).json({
                success: true,
                data: updatedBook
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kitap durumu güncellenemedi',
            error: error.message
        });
    }
};

module.exports = {
    createBook,
    getBook,
    getSellerBooks,
    updateBook,
    deleteBook,
    getBooksByCategory,
    getBooksByFaculty,
    getAllBooks,
    updateBookStatus
}; 