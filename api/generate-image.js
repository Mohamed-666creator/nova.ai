export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, userEmail } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "اكتب وصف الصورة أولاً."
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        error: "الحساب غير معروف."
      });
    }

    /*
      حد الصور:
      100 صورة لكل حساب خلال اليوم.
      
      ملاحظة:
      هذا التخزين داخل ذاكرة Serverless وقد يتغير عند إعادة تشغيل
      السيرفر. للحد الدقيق والدائم سنحتاج قاعدة بيانات لاحقًا.
    */

    const now = new Date();

    const dateKey =
      now.getUTCFullYear() +
      "-" +
      String(now.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getUTCDate()).padStart(2, "0");

    if (!globalThis.novaImageUsage) {
      globalThis.novaImageUsage = {};
    }

    const key = `${userEmail}_${dateKey}`;

    if (!globalThis.novaImageUsage[key]) {
      globalThis.novaImageUsage[key] = 0;
    }

    if (globalThis.novaImageUsage[key] >= 100) {
      return res.status(429).json({
        error: "وصلت إلى الحد اليومي وهو 100 صورة. حاول غدًا."
      });
    }

    globalThis.novaImageUsage[key]++;

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: prompt.trim(),
          size: "1024x1024"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      globalThis.novaImageUsage[key]--;

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "فشل إنشاء الصورة."
      });
    }

    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      globalThis.novaImageUsage[key]--;

      return res.status(500).json({
        error: "لم تصل الصورة من خدمة التوليد."
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
      remaining: 100 - globalThis.novaImageUsage[key]
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "حدث خطأ أثناء إنشاء الصورة."
    });
  }
}
