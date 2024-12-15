import {ErrorMessage} from "@/components/ErrorMessage";

export const RegisterForm = ({ onSubmit, username, setUsername, password, setPassword, error }: any) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <button
                onClick={onSubmit}
                className="w-full bg-lightpurple text-white px-4 py-2 rounded hover:bg-darkpurple"
            >
                Register
            </button>
            {error && <ErrorMessage message={error} />}
        </div>
    );
};
