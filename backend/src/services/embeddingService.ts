// src/services/embeddingService.ts

import { pipeline, env } from "@xenova/transformers";

// Modellerin nereye indirileceğini ve önbellekleneceğini belirtiyoruz.
// Projenizin kök dizininde bir '.models' klasörü oluşturacak.
env.cacheDir = "./.models";

// Singleton Prensibi: Modelin uygulama ömrü boyunca sadece BİR KEZ yüklenmesini sağlar.
// Bu, her istekte modeli tekrar tekrar yüklemenin önüne geçerek performansı ciddi şekilde artırır.
class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  private pipe: any;

  // Constructor private yapılır, böylece dışarıdan new EmbeddingService() yapılamaz.
  private constructor() {
    // Boş constructor
  }

  // Modeli asenkron olarak yükleyen ve hazırlayan fonksiyon.
  private async initialize() {
    console.log(
      "Embedding modeli yükleniyor... Bu işlem ilk seferde birkaç dakika sürebilir."
    );
    // "feature-extraction" pipeline'ı, metinleri vektörlere dönüştürmek için kullanılır.
    // "Xenova/all-MiniLM-L6-v2" küçük, hızlı ve çok dilli desteği olan popüler bir modeldir.
    this.pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Embedding modeli başarıyla yüklendi.");
  }

  // Servisin tek bir örneğini (instance) almak için kullanılan statik metod.
  public static async getInstance(): Promise<EmbeddingService> {
    if (EmbeddingService.instance === null) {
      EmbeddingService.instance = new EmbeddingService();
      await EmbeddingService.instance.initialize();
    }
    return EmbeddingService.instance;
  }

  // Esas işi yapan fonksiyon: Metni alıp vektör döndürür.
  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.pipe) {
      throw new Error("Embedding pipeline is not initialized.");
    }

    // Modeli kullanarak metinden vektör çıkarımı yapıyoruz.
    const output = await this.pipe(text, {
      pooling: "mean", // Kelime vektörlerinin ortalamasını alarak tüm metin için tek bir vektör oluşturur.
      normalize: true, // Vektörün uzunluğunu 1'e normalize eder. Bu, anlamsal arama için önemlidir.
    });

    // Modelin çıktısını standart bir sayı dizisine çevirip döndürüyoruz.
    return Array.from(output.data);
  }
}

// Servisin örneğini dışa aktarıyoruz.
// Uygulamanın herhangi bir yerinden `EmbeddingService.getInstance()` çağrıldığında
// modelin yüklü olduğu aynı örnek kullanılacak.
export default EmbeddingService;
