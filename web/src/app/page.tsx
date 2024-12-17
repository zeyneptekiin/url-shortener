"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import ClipLoader from "react-spinners/ClipLoader";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { GoogleLoginWrapper } from "@/components/GoogleLoginWrapper";
import {CredentialResponse} from "@react-oauth/google";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    export default function Home() {
    const { isLoggedIn, isLoading, login, register, googleSignIn, logout, error } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [shortenedUrl, setShortenedUrl] = useState("");

    const handleLogin = async () => {
        setLocalError("");
        if (!username.trim() || !password.trim()) {
            setLocalError("Username and password are required.");
            return;
        }
        try {
            await login(username, password);
            setUrlInput("");
            setShortenedUrl("");
        } catch {}
    };

    const handleRegister = async () => {
        setLocalError("");
        if (!username.trim() || !password.trim()) {
            setLocalError("Username and password are required.");
            return;
        }
        try {
            await register(username, password);
        } catch {}
    };

    const handleGoogleLoginSuccess = async (credential: string) => {
        setLocalError("");
        try {
            await googleSignIn(credential);
            setUrlInput("");
            setShortenedUrl("");
        } catch {
        }
    };

    const handleGoogleLoginFailure = () => {
        setLocalError("Google login failed. Please try again.");
    };

    const handleShortenUrl = async () => {
        setLocalError("");
        if (!urlInput.trim()) {
            setLocalError("Please provide a URL to shorten.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setLocalError("You must be logged in to shorten a URL.");
                return;
            }

            const response = await fetch(`${apiUrl}/shorten`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url: urlInput }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to shorten the URL.");
            }

            const data = await response.text();
            setShortenedUrl(data);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error shortening URL:", err);
                setLocalError(err.message || "Failed to shorten the URL.");
            } else {
                console.error("An unexpected error occurred:", err);
                setLocalError("An unexpected error occurred.");
            }
        }
    };

    const handleCopy = async () => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shortenedUrl);
                alert("Shortened URL copied to clipboard!");
            }
        } catch (err) {
            console.error("Failed to copy URL:", err);
            setLocalError("Failed to copy the URL.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ClipLoader size={50} color={"#6A42C2"} loading={isLoading} />
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="flex min-h-screen">
                <div className="flex flex-col justify-center items-center w-1/2 bg-gray-100 p-8">
                    <h1 className="text-3xl font-bold mb-4">Welcome to URL Shortener</h1>
                </div>

                <div className="w-px bg-gray-300"></div>

                <div className="flex flex-col justify-center items-center w-1/2 p-8">
                    {isLogin ? (
                        <LoginForm
                            onSubmit={handleLogin}
                            username={username}
                            setUsername={setUsername}
                            password={password}
                            setPassword={setPassword}
                            error={localError || error || undefined}
                        />
                    ) : (
                        <RegisterForm
                            onSubmit={handleRegister}
                            username={username}
                            setUsername={setUsername}
                            password={password}
                            setPassword={setPassword}
                            error={localError || error || undefined}
                        />
                    )}

                    <p className="text-gray-500 mt-3">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <a
                            onClick={() => setIsLogin(!isLogin)}
                            className="pl-3 text-black hover:underline cursor-pointer"
                        >
                            {isLogin ? "Register" : "Login"}
                        </a>
                    </p>

                    <GoogleLoginWrapper
                        onSuccess={(response: CredentialResponse) => {
                            const { credential } = response;
                            if (credential) {
                                handleGoogleLoginSuccess(credential);
                            } else {
                                setLocalError("Google login failed. Credential is undefined.");
                                console.error("Google Credential is undefined.");
                            }
                        }}
                        onError={handleGoogleLoginFailure}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-4">URL Shortener</h1>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter the URL to shorten"
                    className="p-2 border border-gray-300 rounded mr-2"
                />
                <button
                    onClick={handleShortenUrl}
                    className="bg-lightpurple text-white px-4 py-2 rounded hover:bg-darkpurple"
                >
                    Shorten
                </button>
            </div>
            {shortenedUrl && (
                <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-100">
                    <strong>Shortened URL:</strong> {shortenedUrl}
                    <button
                        onClick={handleCopy}
                        className="ml-2 bg-lightpurple text-white px-2 py-1 rounded hover:bg-darkpurple"
                    >
                        Copy
                    </button>
                </div>
            )}
            {localError && <div className="text-red-500 mt-4">{localError}</div>}
            <button
                onClick={logout}
                className="mt-4 bg-lightpurple text-white px-4 py-2 rounded hover:bg-darkpurple"
            >
                Logout
            </button>
        </div>
    );
}
