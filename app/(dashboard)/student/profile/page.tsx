"use client";

import { useState } from "react";

export default function Profile() {
    const [phone, setPhone] = useState("");

    async function savePhone() {
        await fetch("/api/user/phone", {
            method: "POST",
            body: JSON.stringify({ phone }),
        });
    }

    return (
        <div>
            <h2>Your Phone</h2>
            <input placeholder="2547..." onChange={e => setPhone(e.target.value)} />
            <button onClick={savePhone}>Save</button>
        </div>
    );
}
