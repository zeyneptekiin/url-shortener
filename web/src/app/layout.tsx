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
    return (
        <html lang="en">
        <body className={`antialiased`}>
        <GoogleOAuthProvider clientId="600224542939-ni6fgnvp9jd22do9s3d18mvggn4opfk5.apps.googleusercontent.com">
            {children}
        </GoogleOAuthProvider>
        </body>
        </html>
    );
}
