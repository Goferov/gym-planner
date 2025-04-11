import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import funkcję z axios.js
import { registerTrainer } from '../../api/axios';

function Register() {
    // Stan pól formularza
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [errors, setErrors] = useState({});

    const [serverError, setServerError] = useState('');
    const [serverSuccess, setServerSuccess] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');
        setServerSuccess('');

        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Imię jest wymagane.';
        }
        if (!email.trim()) {
            newErrors.email = 'Email jest wymagany.';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Niepoprawny format email.';
        }
        if (!password) {
            newErrors.password = 'Hasło jest wymagane.';
        } else if (password.length < 8) {
            newErrors.password = 'Hasło musi mieć co najmniej 8 znaków.';
        }
        // Sprawdzenie zgodności haseł
        if (!passwordConfirmation) {
            newErrors.passwordConfirmation = 'Potwierdź hasło.';
        } else if (password !== passwordConfirmation) {
            newErrors.passwordConfirmation = 'Hasła nie są zgodne.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2) Wywołanie API
        try {
            // Wysyłamy do axios – tam w body: {name, email, password, password_confirmation, role:'trainer'}
            const data = await registerTrainer(name, email, password, passwordConfirmation);

            // Jeśli serwer zwróci { message: "User registered successfully", ... }
            setServerSuccess(data.message || 'Rejestracja pomyślna!');
            // Przenosimy do login (możesz opóźnić, żeby user zobaczył success)
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            console.error(err);

            // Spróbuj pobrać błąd z serwera:
            if (err.response && err.response.data && err.response.data.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError('Błąd rejestracji.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow w-full max-w-sm"
            >
                <h2 className="text-xl font-bold mb-4">Rejestracja trenera</h2>

                {/* ewentualny success / error z serwera */}
                {serverSuccess && (
                    <p className="text-green-600 mb-2">{serverSuccess}</p>
                )}
                {serverError && (
                    <p className="text-red-600 mb-2">{serverError}</p>
                )}

                {/* Pole name */}
                <div className="mb-4">
                    <label className="block mb-1">Imię</label>
                    <input
                        className="border w-full p-2 rounded"
                        type="text"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Pole email */}
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

                {/* Pole password */}
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

                {/* Pole passwordConfirmation */}
                <div className="mb-4">
                    <label className="block mb-1">Potwierdź hasło</label>
                    <input
                        className="border w-full p-2 rounded"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e)=>setPasswordConfirmation(e.target.value)}
                    />
                    {errors.passwordConfirmation && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.passwordConfirmation}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Zarejestruj
                </button>
            </form>
        </div>
    );
}

export default Register;
