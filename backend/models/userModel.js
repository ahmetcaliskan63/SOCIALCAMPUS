const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const { id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul } = userData;
        
        try {
            const [result] = await db.execute(
                'INSERT INTO kullanicilar (id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM kullanicilar WHERE id = ?', [id]);
            return rows[0];
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
                `UPDATE kullanicilar SET ${updateFields} WHERE id = ?`,
                values
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM kullanicilar WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findByFakulte(fakulte) {
        try {
            const [rows] = await db.execute('SELECT * FROM kullanicilar WHERE fakulte = ?', [fakulte]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User; 