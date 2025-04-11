import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../api/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({});

    const [serverError, setServerError] = useState('');

    const { setToken, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email jest wymagany.';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Niepoprawny format email.';
        }

        if (!password) {
            newErrors.password = 'Hasło jest wymagane.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const data = await login(email, password);
            setToken(data.token);
            setUser(data.user);

            navigate('/trainer');
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError('Logowanie nieudane. Sprawdź dane.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow w-full max-w-sm"
            >
                <h2 className="text-xl font-bold mb-4">Logowanie (Trener)</h2>

                {serverError && (
                    <p className="text-red-500 mb-2">{serverError}</p>
                )}

                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input
                        className="border w-full p-2 rounded"
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Hasło</label>
                    <input
                        className="border w-full p-2 rounded"
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Zaloguj
                </button>
            </form>
        </div>
    );
}

export default Login;
