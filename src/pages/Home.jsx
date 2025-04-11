import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Witaj na stronie głównej</h1>
            <p className="mb-4">Dostępne opcje:</p>
            <div className="space-x-4">
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Zaloguj
                </Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded">
                    Zarejestruj (Trener)
                </Link>
            </div>
        </div>
    );
}

export default Home;
