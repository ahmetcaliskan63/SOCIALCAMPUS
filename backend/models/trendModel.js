const db = require('../config/db');

class Trend {
    static async create(trendData) {
        const { id, siralama } = trendData;
        
        try {
            const [result] = await db.execute(
                'INSERT INTO gundem_konulari (id, siralama) VALUES (?, ?)',
                [id, siralama]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM gundem_konulari WHERE id = ?', [id]);
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
                `UPDATE gundem_konulari SET ${updateFields} WHERE id = ?`,
                values
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM gundem_konulari WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getAllTrends() {
        try {
            const [rows] = await db.execute('SELECT * FROM gundem_konulari ORDER BY siralama ASC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateOrder(trends) {
        try {
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                for (const trend of trends) {
                    await connection.execute(
                        'UPDATE gundem_konulari SET siralama = ? WHERE id = ?',
                        [trend.siralama, trend.id]
                    );
                }

                await connection.commit();
                return true;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Trend; 