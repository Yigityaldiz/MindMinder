// src/services/qdrantService.ts

import { QdrantClient } from "@qdrant/js-client-rest";

// Qdrant ayarlarını merkezi bir yerden yönetmek için sabitler oluşturalım.
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_COLLECTION_NAME = "chat_history_collection";
const EMBEDDING_VECTOR_SIZE = 384; // Kullandığımız all-MiniLM-L6-v2 modelinin vektör boyutu

// Yine Singleton Prensibi ile Qdrant istemcisinin tek bir örneğini oluşturup yöneteceğiz.
class QdrantService {
  private static instance: QdrantService | null = null;
  public client: QdrantClient;

  private constructor() {
    this.client = new QdrantClient({ url: QDRANT_URL });
  }

  // Veritabanı bağlantısını ve collection'ın varlığını kontrol eden başlangıç fonksiyonu
  private async initialize() {
    try {
      console.log(
        "Qdrant servisi başlatılıyor ve collection kontrol ediliyor..."
      );
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (collection) => collection.name === QDRANT_COLLECTION_NAME
      );

      if (!collectionExists) {
        console.log(
          `'${QDRANT_COLLECTION_NAME}' adında bir collection bulunamadı, yeni bir tane oluşturuluyor...`
        );
        await this.client.createCollection(QDRANT_COLLECTION_NAME, {
          vectors: {
            size: EMBEDDING_VECTOR_SIZE, // Embedding modelimizin vektör boyutuyla eşleşmeli
            distance: "Cosine", // Normalize edilmiş vektörler için en iyi ve en verimli benzerlik ölçütü
          },
        });
        console.log("Collection başarıyla oluşturuldu.");
      } else {
        console.log(`'${QDRANT_COLLECTION_NAME}' collection'ı zaten mevcut.`);
      }
    } catch (error) {
      console.error("Qdrant başlatma hatası:", error);
      throw new Error("Qdrant servisi başlatılamadı.");
    }
  }

  // Servisin tek örneğini (instance) almak için
  public static async getInstance(): Promise<QdrantService> {
    if (QdrantService.instance === null) {
      QdrantService.instance = new QdrantService();
      await QdrantService.instance.initialize();
    }
    return QdrantService.instance;
  }

  /**
   * Bir vektör noktasını Qdrant'a ekler veya günceller.
   * @param id - Noktanın benzersiz ID'si (örn: MongoDB'deki mesajın ID'si olabilir)
   * @param vector - Metnin sayısal vektör temsili
   * @param payload - Vektörle birlikte saklanacak ek veriler (örn: orijinal metin)
   */
  public async upsertPoint(
    id: string,
    vector: number[],
    payload: Record<string, any>
  ) {
    return this.client.upsert(QDRANT_COLLECTION_NAME, {
      wait: true, // İşlemin tamamlanmasını bekle
      points: [{ id, vector, payload }],
    });
  }

  /**
   * Verilen bir vektöre en çok benzeyen noktaları arar.
   * @param vector - Arama yapılacak sorgu vektörü
   * @param limit - Döndürülecek maksimum sonuç sayısı
   * @returns Benzer noktaların listesi
   */
  public async search(vector: number[], limit: number = 100) {
    return this.client.search(QDRANT_COLLECTION_NAME, {
      vector,
      limit,
      with_payload: true, // Arama sonuçlarında payload'daki verileri de getir
    });
  }
}

export default QdrantService;
