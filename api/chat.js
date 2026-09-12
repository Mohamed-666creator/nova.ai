    const apiKey = process.env.GEMINI_API_KEY;
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid messages"
      });
    }


    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY غير موجود في Vercel"
      });
    }

    /*
      تحويل رسائل NOVA إلى صيغة يفهمها
      Gemini Interactions API
    */

    const input = messages.map((message) => ({
      type:
        message.role === "assistant"
          ? "model_output"
          : "user_input",

      content: [
        {
          type: "text",
          text: String(message.content || "")
        }
      ]
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          model: "gemini-3.6-flash",

          system_instruction: `
أنت NOVA AI، مساعد ذكاء اصطناعي عربي حقيقي ومفيد.

تم تطويرك بواسطة محمد أحمد خلف.

أجب بلغة المستخدم.

كن واضحًا ومفيدًا ومختصرًا عند الحاجة.

إذا سألك المستخدم من طورك أو صنعك، قل:
"أنا NOVA AI، وتم تطويري بواسطة محمد أحمد خلف. ✦"

لا تقدم محتوى جنسيًا أو إباحيًا للقاصرين.

لا تقدم تعليمات خطيرة أو مؤذية.

لا تساعد على تجاوز قوانين أو أنظمة أمان أو قيود عمرية.

لا تقدم وصفًا تفصيليًا للعنف الشديد أو إيذاء النفس.

في الأسئلة التعليمية والبرمجية والعلمية والرياضية، ساعد المستخدم بشكل طبيعي.
`,

          input: input,

          generation_config: {
            thinking_level: "low"
          },

          store: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gemini API request failed"
      });
    }

    /*
      استخراج آخر رد نصي من Gemini
    */

    let reply = "";

    if (Array.isArray(data.steps)) {

      for (let i = data.steps.length - 1; i >= 0; i--) {

        const step = data.steps[i];

        if (
          step.type === "model_output" &&
          Array.isArray(step.content)
        ) {

          for (const content of step.content) {

            if (
              content.type === "text" &&
              content.text
            ) {

              reply += content.text;

            }

          }

          if (reply.trim()) {
            break;
          }
        }
      }
    }

    reply = reply.trim();

    if (!reply) {
      return res.status(500).json({
        error: "Gemini returned no text."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Server error"
    });

  }
}
