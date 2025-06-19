// src/services/qdrantService.ts (TAM VE EKSİKSİZ HALİ)

import { QdrantClient, type Schemas } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_COLLECTION_NAME = "chat_history_collection";
const EMBEDDING_VECTOR_SIZE = 384;

class QdrantService {
  private static instance: QdrantService | null = null;
  public client: QdrantClient;

  private constructor() {
    this.client = new QdrantClient({ url: QDRANT_URL });
  }

  // initialize fonksiyonunun tam hali
  private async initialize() {
    try {
      console.log(
        "Qdrant servisi başlatılıyor ve collection kontrol ediliyor..."
      );
      const result = await this.client.getCollections();
      const collectionExists = result.collections.some(
        (collection) => collection.name === QDRANT_COLLECTION_NAME
      );

      if (!collectionExists) {
        console.log(
          `'${QDRANT_COLLECTION_NAME}' adında bir collection bulunamadı, yeni bir tane oluşturuluyor...`
        );
        await this.client.createCollection(QDRANT_COLLECTION_NAME, {
          vectors: {
            size: EMBEDDING_VECTOR_SIZE,
            distance: "Cosine",
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

  // getInstance fonksiyonunun tam hali
  public static async getInstance(): Promise<QdrantService> {
    if (QdrantService.instance === null) {
      QdrantService.instance = new QdrantService();
      await QdrantService.instance.initialize();
    }
    return QdrantService.instance;
  }

  // upsertPoint fonksiyonunun tam hali
  public async upsertPoint(
    id: string,
    vector: number[],
    payload: Record<string, any>
  ) {
    return this.client.upsert(QDRANT_COLLECTION_NAME, {
      wait: true,
      points: [{ id, vector, payload }],
    });
  }

  // search fonksiyonunun tam hali
  public async search(
    vector: number[],
    limit: number = 3,
    filter?: Schemas["Filter"]
  ) {
    return this.client.search(QDRANT_COLLECTION_NAME, {
      vector,
      limit,
      filter,
      with_payload: true,
    });
  }
}

export default QdrantService;
