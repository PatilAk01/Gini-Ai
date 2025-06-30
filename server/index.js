const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
require("dotenv").config();

// ✅ Support ESM-only node-fetch in CommonJS
let fetch;
(async () => {
    fetch = (await import("node-fetch")).default;
})();

const app = express();
app.use(cors());
const PORT = 5000;

const server = app.listen(PORT, () => {
    console.log("✅ Server running on port", PORT);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("🟢 Client connected");

    ws.on("message", async (msg) => {
        const userMsg = msg.toString();
        console.log("💬 Message:", userMsg);

        // Wait until fetch is loaded
        while (!fetch) {
            await new Promise((r) => setTimeout(r, 50));
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-7b-instruct",
                    messages: [{ role: "user", content: userMsg }],
                })
            });


            const data = await response.json();

            if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
                const reply = data.choices[0].message.content;
                ws.send(reply);
            } else {
                console.error("❌ Invalid response from OpenRouter:", JSON.stringify(data, null, 2));
                ws.send("⚠️ Error: " + (data.error?.message || "Unexpected API response"));
            }
        } catch (err) {
            console.error("❌ OpenRouter API request failed:", err.message);
            ws.send("⚠️ Error contacting OpenRouter AI.");
        }
    });

    ws.on("close", () => {
        console.log("🔴 Client disconnected");
    });
});
