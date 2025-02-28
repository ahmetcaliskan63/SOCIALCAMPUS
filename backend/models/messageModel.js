const db = require('../config/db');

class Message {
    static async create(messageData) {
        const { id, kullanici_id, kullanici_adi, icerik } = messageData;
        
        if (!kullanici_id || !icerik) {
            throw new Error('Gerekli alanlar eksik: kullanici_id ve icerik zorunludur');
        }

        try {
            // Veritabanı bağlantısını kontrol et
            await db.getConnection().ping();

            const [result] = await db.execute(
                'INSERT INTO mesajlar (id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?)',
                [id, kullanici_id, kullanici_adi, icerik]
            );

            if (!result) {
                throw new Error('Mesaj oluşturulamadı');
            }

            // Oluşturulan mesajı doğrula
            const [newMessage] = await db.execute(
                'SELECT * FROM mesajlar WHERE id = ?',
                [id]
            );

            return newMessage[0];
        } catch (error) {
            console.error('Mesaj oluşturma hatası:', error);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Veritabanına bağlanılamadı. Lütfen bağlantınızı kontrol edin.');
            }
            
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                throw new Error('Veritabanı erişim hatası. Kullanıcı bilgilerini kontrol edin.');
            }

            throw new Error('Mesaj oluşturulurken bir hata oluştu: ' + error.message);
        }
    }
}

module.exports = Message;