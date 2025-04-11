import React, { useContext, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function TrainerLayout() {
    const { user, logout } = useContext(AuthContext);
    const [message, setMessage] = useState('');

    const handleLogout = async () => {
        try {
            await logout();
            setMessage('Pomyślnie wylogowano');
        } catch (error) {
            console.error('Błąd wylogowania', error);
            setMessage('Błąd wylogowania');
        }
    };


    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Panel Trenera</h2>
                <Link to="" className="block hover:bg-gray-700 p-2 rounded">
                    Dashboard
                </Link>
                <button
                    onClick={handleLogout}
                    className="mt-4 bg-red-600 p-2 rounded"
                >
                    Wyloguj
                </button>
                {message && <p className="mt-2 text-sm text-green-300">{message}</p>}
            </aside>
            <main className="flex-1 p-6 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
}

export default TrainerLayout;
