const db = require('../config/db');

class Book {
    static async create(bookData) {
        const {
            id,
            baslik,
            kategori,
            fiyat,
            instagram,
            resim_url,
            satici_id,
            satici_adi,
            satici_fakulte,
            satici_bolum
        } = bookData;
        
        try {
            const [result] = await db.execute(
                `INSERT INTO kitaplar (
                    id, baslik, kategori, fiyat, instagram, resim_url,
                    satici_id, satici_adi, satici_fakulte, satici_bolum
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, baslik, kategori, fiyat, instagram, resim_url,
                 satici_id, satici_adi, satici_fakulte, satici_bolum]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM kitaplar WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findBySellerId(satici_id) {
        try {
            const [rows] = await db.execute('SELECT * FROM kitaplar WHERE satici_id = ?', [satici_id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updateData) {
        const updateFields = Object.keys(updateData)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updateData), id];

        try {
            const [result] = await db.execute(
                `UPDATE kitaplar SET ${updateFields} WHERE id = ?`,
                values
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM kitaplar WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findByCategory(kategori) {
        try {
            const [rows] = await db.execute('SELECT * FROM kitaplar WHERE kategori = ?', [kategori]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findByFaculty(fakulte) {
        try {
            const [rows] = await db.execute('SELECT * FROM kitaplar WHERE satici_fakulte = ?', [fakulte]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getAllBooks(limit = 50, offset = 0) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM kitaplar ORDER BY olusturma_tarihi DESC LIMIT ? OFFSET ?',
                [parseInt(limit), parseInt(offset)]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, durum) {
        try {
            const [result] = await db.execute(
                'UPDATE kitaplar SET durum = ? WHERE id = ?',
                [durum, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Book; 