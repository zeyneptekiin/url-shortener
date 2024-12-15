import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type ErrorResponse = {
    message: string;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                await axios.get(`${apiUrl}/auth/validate-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsLoggedIn(true);
            } catch {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, { username, password });
            const { access_token } = response.data;
            localStorage.setItem("token", access_token);
            setIsLoggedIn(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Login failed");
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        setIsLoading(true);
        setError("");
        try {
            await axios.post(`${apiUrl}/auth/register`, {
                username,
                password,
            });
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            setError(axiosError.response?.data?.message || "Registration failed");
            throw axiosError;
        } finally {
            setIsLoading(false);
        }
    };

    const googleSignIn = async (credential: string) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await axios.post(`${apiUrl}/auth/google-login`, {
                token: credential,
            });
            const { access_token } = response.data;
            localStorage.setItem("token", access_token);
            setIsLoggedIn(true);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            setError(axiosError.response?.data?.message || "Google login failed");
            throw axiosError;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    return {
        isLoggedIn,
        isLoading,
        error,
        login,
        register,
        googleSignIn,
        logout,
    };
}
