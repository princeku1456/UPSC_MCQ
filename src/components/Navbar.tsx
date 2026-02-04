import React from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const AppNavbar: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <Navbar expand="lg" variant="dark" className="main-navbar sticky-top bg-primary">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    ✨ MCQ Practice
                </Navbar.Brand>
                <div className="d-flex align-items-center gap-3">
                     {currentUser ? (
                         <Dropdown align="end">
                             <Dropdown.Toggle variant="link" className="text-white text-decoration-none fw-bold" id="user-dropdown">
                                 {currentUser.email?.split('@')[0] || 'User'}
                             </Dropdown.Toggle>
                             <Dropdown.Menu className="shadow">
                                 <Dropdown.Item as={Link} to="/dashboard">📊 Dashboard</Dropdown.Item>
                                 <Dropdown.Divider />
                                 <Dropdown.Item onClick={handleLogout} className="text-danger">🚪 Logout</Dropdown.Item>
                             </Dropdown.Menu>
                         </Dropdown>
                     ) : null}
                </div>
            </Container>
        </Navbar>
    );
};
