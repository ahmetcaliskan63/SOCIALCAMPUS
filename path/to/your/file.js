function handleApiResponse(response) {
  try {
    // Yanıt zaten bir obje ise, JSON.parse kullanmaya gerek yok
    const data = typeof response === "string" ? JSON.parse(response) : response;

    console.log("API yanıtı:", data); // Yanıtı konsola yazdır

    if (data.success) {
      // Başarılı yanıt işleme
      if (!data.data) {
        throw new Error("Yanıt verisi eksik.");
      }
      console.log("Kullanıcı başarıyla oluşturuldu:", data.data);
      return data; // Başarılı yanıtı döndür
    } else {
      // Başarısız yanıt işleme
      throw new Error(data.message || "İşlem başarısız");
    }
  } catch (error) {
    console.error("İşlem hatası:", error.message);
    throw error; // Hatayı yukarı ilet
  }
}
