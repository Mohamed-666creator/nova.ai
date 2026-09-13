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
        error: "GEMINI_API_KEY غير موجود في Vercel."
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

          input: String(prompt).trim(),

          response_format: {
            type: "image",
            mime_type: "image/jpeg",
            aspect_ratio: "1:1",
            image_size: "1K"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini image error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "فشل إنشاء الصورة من Gemini."
      });
    }

    // الطريقة الأساسية في Gemini Interactions API
    if (data?.output_image?.data) {
      return res.status(200).json({
        image: data.output_image.data,
        mimeType:
          data.output_image.mime_type ||
          "image/jpeg"
      });
    }

    // احتياطًا لو جاءت الصورة داخل steps
    if (Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (
          step?.type === "model_output" &&
          Array.isArray(step.content)
        ) {
          for (const block of step.content) {
            if (
              block?.type === "image" &&
              block?.data
            ) {
              return res.status(200).json({
                image: block.data,
                mimeType:
                  block.mime_type ||
                  "image/jpeg"
              });
            }
          }
        }
      }
    }

    console.error(
      "Gemini returned no image:",
      JSON.stringify(data)
    );

    return res.status(500).json({
      error: "Gemini لم يُرجع صورة."
    });

  } catch (error) {
    console.error("Image API error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "حدث خطأ أثناء إنشاء الصورة."
    });
  }
}
