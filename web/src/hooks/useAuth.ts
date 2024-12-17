import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type ErrorResponse = {
    message: string;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiCall = async (
        method: "GET" | "POST",
        url: string,
        data: object = {},
        token?: string
    ) => {
        try {
            const headers = token
                ? { Authorization: `Bearer ${token}` }
                : undefined;

            const response = await axios({
                method,
                url: `${apiUrl}${url}`,
                data,
                headers,
            });
            return response.data;
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.message || "Something went wrong!";
            setError(errorMessage);
            console.error("API Error:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setIsLoading(false);
                setIsLoggedIn(false);
                return;
            }

            try {
                await apiCall("GET", "/auth/validate-token", {}, token);
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
        setError(null);
        try {
            const { access_token } = await apiCall("POST", "/auth/login", {
                username,
                password,
            });
            localStorage.setItem("token", access_token);
            setIsLoggedIn(true);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiCall("POST", "/auth/register", { username, password });
        } finally {
            setIsLoading(false);
        }
    };

    const googleSignIn = async (credential: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { access_token } = await apiCall("POST", "/auth/google-login", {
                token: credential,
            });
            localStorage.setItem("token", access_token);
            setIsLoggedIn(true);
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
