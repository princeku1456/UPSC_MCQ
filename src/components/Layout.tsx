import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from './Navbar';

export const Layout: React.FC = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <AppNavbar />
            <main className="flex-grow-1">
                <Outlet />
            </main>
        </div>
    );
};
