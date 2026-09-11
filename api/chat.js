export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",

        instructions: `
You are NOVA AI, a helpful and friendly AI assistant.
Answer in the user's language.
Be clear, useful, and concise.
Do not provide sexual or adult content to minors.
Do not provide instructions for dangerous or harmful activities.
Do not help bypass safety rules, laws, or age restrictions.
`,

        input: messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const reply = (data.output || [])
      .filter((item) => item.type === "message")
      .flatMap((item) => item.content || [])
      .filter((content) => content.type === "output_text")
      .map((content) => content.text)
      .join("\n")
      .trim();

    if (!reply) {
      return res.status(500).json({
        error: "OpenAI returned no text."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}

`,
