// POST /kullanicilar endpoint'i
router.post("/kullanicilar", async (req, res) => {
  try {
    const { tam_ad, faculty, department, termsAccepted, eulaAccepted } =
      req.body;

    // Gerekli alanların kontrolü
    if (
      !tam_ad ||
      !faculty ||
      !department ||
      termsAccepted === undefined ||
      eulaAccepted === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Tüm alanları doldurun",
      });
    }

    const insertResult = await db.query(
      "INSERT INTO kullanicilar (tam_ad, faculty, department, termsAccepted, eulaAccepted) VALUES (?, ?, ?, ?, ?)",
      [tam_ad, faculty, department, termsAccepted ? 1 : 0, eulaAccepted ? 1 : 0]
    );

    // Yeni eklenen kullanıcının bilgilerini al
    const [kullanici] = await db.query(
      "SELECT * FROM kullanicilar WHERE id = ?",
      [insertResult.insertId]
    );

    // Yanıtı doğru formatta gönder
    res.json({
      success: true,
      message: "Kullanıcı oluşturuldu",
      data: {
        id: kullanici.id,
        tam_ad: kullanici.tam_ad,
        fakulte: kullanici.faculty,
        bolum: kullanici.department,
        sartlari_kabul: kullanici.termsAccepted,
        sozlesmeyi_kabul: kullanici.eulaAccepted,
        created_at: new Date(),
        guncelleme_tarihi: new Date(),
      },
    });
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı oluşturulurken bir hata oluştu",
      error: error.message,
    });
  }
});
