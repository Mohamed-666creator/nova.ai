export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const { messages } =
      req.body || {};


    if (!Array.isArray(messages)) {

      return res.status(400).json({
        error: "Invalid messages"
      });

    }


    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY غير موجود في Vercel"
      });

    }


    const response = await fetch(

      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "x-goog-api-key":
            apiKey

        },

        body: JSON.stringify({

          system_instruction: {

            parts: [

              {

                text: `
أنت NOVA AI، مساعد ذكاء اصطناعي حقيقي وودود.

أجب باللغة التي يستخدمها المستخدم.

كن واضحًا ومفيدًا ومختصرًا.

ساعد المستخدم في:
البرمجة، الرياضيات، العلوم، الدراسة،
الأسئلة العامة، الكتابة، والإبداع.

تم تطوير NOVA AI بواسطة محمد أحمد خلف.

إذا سأل المستخدم من صنعك أو من طورك أو من أنشأك، أجب:

"أنا NOVA AI، وتم تطويري بواسطة محمد أحمد خلف. ✦"

لا تقدم محتوى جنسيًا أو إباحيًا أو غير مناسب للقاصرين.

لا تقدم تعليمات خطيرة أو مؤذية.

لا تساعد على إيذاء النفس أو الآخرين.

لا تساعد على تجاوز القوانين أو أنظمة الأمان أو قيود العمر.

إذا كان الطلب غير آمن، ارفضه باختصار واقترح بديلًا آمنًا.
`

              }

            ]

          },


          contents:

            messages.map(
              (message) => ({

                role:
                  message.role === "assistant"
                    ? "model"
                    : "user",

                parts: [

                  {

                    text:
                      String(
                        message.content || ""
                      )

                  }

                ]

              })
            )

        })

      }

    );


    const data =
      await response.json();


    if (!response.ok) {

      return res.status(
        response.status
      ).json({

        error:
          data.error?.message ||
          "Gemini request failed"

      });

    }


    const reply =

      data
        .candidates?.[0]
        ?.content
        ?.parts
        ?.map(
          (part) =>
            part.text || ""
        )
        .join("")
        .trim();


    if (!reply) {

      return res.status(500).json({

        error:
          "Gemini returned no text."

      });

    }


    return res.status(200).json({

      reply: reply

    });


  } catch (error) {

    console.error(error);


    return res.status(500).json({

      error:
        "Server error"

    });

  }

}
