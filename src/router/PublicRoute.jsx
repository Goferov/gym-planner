import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PublicRoute:
 * - Jeśli user NIE jest zalogowany -> renderuje children (np. /login, /register)
 * - Jeśli user JEST zalogowany -> redirect do /trainer
 */
function PublicRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (user) {
        return <Navigate to="/trainer" replace />;
    }
    return children;
}

export default PublicRoute;
