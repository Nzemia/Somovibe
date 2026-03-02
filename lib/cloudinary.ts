import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
    file: File,
    folder: string = "thumbnails",
    resourceType: "image" | "raw" | "video" | "auto" = "image"
): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: resourceType,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result!.secure_url);
                }
            )
            .end(buffer);
    });
}



export function getDefaultThumbnail(materialType: string): string {
    // Using placeholder images with material type specific colors and icons
    const thumbnails: Record<string, string> = {
        PDF: "https://via.placeholder.com/400x225/3b82f6/ffffff?text=📄+PDF+Document",
        PDF_SLIDES: "https://via.placeholder.com/400x225/a855f7/ffffff?text=📊+PDF+Slides",
        POWERPOINT: "https://via.placeholder.com/400x225/f97316/ffffff?text=🎯+PowerPoint",
        CLASS_INSTRUCTIONS: "https://via.placeholder.com/400x225/22c55e/ffffff?text=📋+Instructions",
        SCHEME_OF_WORK: "https://via.placeholder.com/400x225/6366f1/ffffff?text=📅+Scheme",
        LESSON_PLAN: "https://via.placeholder.com/400x225/ec4899/ffffff?text=📝+Lesson+Plan",
        EXAM_QUIZ: "https://via.placeholder.com/400x225/ef4444/ffffff?text=✍️+Exam",
    };

    return thumbnails[materialType] || thumbnails.PDF;
}

export { cloudinary };