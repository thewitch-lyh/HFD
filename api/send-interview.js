export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { audio, filename } = req.body || {};

        if (!audio) {
            return res.status(400).json({
                error: "No recording received."
            });
        }

        const webhook = process.env.DISCORD_WEBHOOK_URL;

        if (!webhook) {
            return res.status(500).json({
                error: "Discord webhook is not configured."
            });
        }

        const audioBuffer = Buffer.from(audio, "base64");

        const form = new FormData();

        form.append(
            "payload_json",
            JSON.stringify({
                content:
                    "🎙️ **NEW INTERVIEW TAPE RECEIVED**\n\n" +
                    "🎬 Arnav has submitted his Friendship Day interview."
            })
        );

        const audioBlob = new Blob(
            [audioBuffer],
            {
                type: "audio/webm"
            }
        );

        form.append(
            "file",
            audioBlob,
            filename || "arnav-interview.webm"
        );

        const discordResponse = await fetch(
            webhook,
            {
                method: "POST",
                body: form
            }
        );

        if (!discordResponse.ok) {
            const errorText =
                await discordResponse.text();

            console.error(
                "Discord error:",
                errorText
            );

            return res.status(500).json({
                error: "Discord rejected the recording."
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.error(
            "FUNCTION ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Something went wrong."
        });
    }
}
