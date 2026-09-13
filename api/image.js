export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "اكتب وصف الصورة أولًا."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY غير موجود في Vercel"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          model: "gemini-3.1-flash-image",

          input: String(prompt),

          response_format: {
            type: "image",
            mime_type: "image/png",
            aspect_ratio: "1:1",
            image_size: "1K"
          },

          store: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "فشل إنشاء الصورة من Gemini."
      });
    }

    let imageData = null;
    let mimeType = "image/png";

    // بعض الاستجابات ترجع الصورة مباشرة
    if (data?.output_image?.data) {
      imageData = data.output_image.data;

      if (data.output_image.mime_type) {
        mimeType = data.output_image.mime_type;
      }
    }

    // وبعض الاستجابات قد تضع الصورة داخل steps
    if (!imageData && Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (!Array.isArray(step.content)) continue;

        for (const content of step.content) {
          if (
            content?.type === "output_image" &&
            content?.data
          ) {
            imageData = content.data;

            if (content.mime_type) {
              mimeType = content.mime_type;
            }

            break;
          }

          if (
            content?.type === "image" &&
            content?.data
          ) {
            imageData = content.data;

            if (content.mime_type) {
              mimeType = content.mime_type;
            }

            break;
          }
        }

        if (imageData) break;
      }
    }

    if (!imageData) {
      console.error(
        "Gemini image response:",
        JSON.stringify(data)
      );

      return res.status(500).json({
        error: "لم يتم إرجاع صورة من Gemini."
      });
    }

    return res.status(200).json({
      image: imageData,
      mimeType
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error:
        error?.message ||
        "حدث خطأ أثناء إنشاء الصورة."
    });
  }
}
