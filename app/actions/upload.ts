"use server";

export async function uploadToImgBB(base64Image: string) {
    const API_KEY = process.env.IMGBB_API_KEY;
    if (!API_KEY) {
        throw new Error("IMGBB_API_KEY is not configured in .env");
    }

    const formData = new FormData();
    formData.append("image", base64Image);

    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("ImgBB Upload Error:", err);
        return { success: false, error: "Failed to upload to ImgBB" };
    }
}
