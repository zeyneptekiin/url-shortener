import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
    title: "Url Shortener",
    description: "Simplify your URLs and make sharing easy.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    const clientId = process.env.GOOGLE_CLIENT_ID as string;

    if (!clientId) {
        throw new Error("Google Client ID is not defined in environment variables.");
    }

    return (
        <html lang="en">
        <body className={`antialiased`}>
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
        </body>
        </html>
    );
}
