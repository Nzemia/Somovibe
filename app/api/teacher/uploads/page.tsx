"use client";

export default function UploadPdf() {
    async function handleUpload(e: any) {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);

        await fetch("/api/pdf/upload", {
            method: "POST",
            body: data,
        });
    }

    return (
        <form onSubmit={handleUpload}>
            <input name="title" placeholder="Title" />
            <input name="subject" placeholder="Subject" />
            <input name="grade" placeholder="Grade" />
            <input name="price" type="number" placeholder="Price (KES)" />
            <input name="file" type="file" accept="application/pdf" />
            <button type="submit">Upload</button>
        </form>
    );
}
