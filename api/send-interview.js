```javascript
// api/send-interview.js

export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // The browser will send the recording as JSON
        const { audio, filename } = req.body;

        if (!audio) {
            return res.status(400).json({
                error: "No recording received."
            });
        }

        // Your Discord webhook is stored safely
        // inside Vercel Environment Variables.
        const webhook = process.env.DISCORD_WEBHOOK_URL;

        if (!webhook) {
            return res.status(500).json({
                error: "Discord webhook is not configured."
            });
        }

        // Convert Base64 audio back into binary
        const audioBuffer = Buffer.from(audio, "base64");

        // Discord requires multipart/form-data for file uploads
        const boundary =
            "----InterviewTapeBoundary" +
            Date.now();

        const beforeFile =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="payload_json"\r\n` +
            `Content-Type: application/json\r\n\r\n` +
            JSON.stringify({
                content:
                    "🎙️ **NEW INTERVIEW TAPE RECEIVED**\n\n" +
                    "🎬 Arnav has submitted his Friendship Day interview."
            }) +
            `\r\n`;

        const fileHeader =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="${filename || "arnav-interview.webm"}"\r\n` +
            `Content-Type: audio/webm\r\n\r\n`;

        const ending =
            `\r\n--${boundary}--\r\n`;

        // Combine everything into one upload
        const body = Buffer.concat([
            Buffer.from(beforeFile),
            Buffer.from(fileHeader),
            audioBuffer,
            Buffer.from(ending)
        ]);

        // Send recording to Discord
        const response = await fetch(webhook, {
            method: "POST",

            headers: {
                "Content-Type":
                    `multipart/form-data; boundary=${boundary}`
            },

            body: body
        });

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Discord error:",
                errorText
            );

            return res.status(500).json({
                error: "Discord rejected the recording."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interview successfully sent."
        });

    } catch (error) {

        console.error(
            "Interview upload error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
```
