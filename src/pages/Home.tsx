import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error(error);
            alert("Login Failed");
        }
    };

    return (
        <section className="hero mt-5" style={{ marginTop: '100px' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={5}>
                        <Card className="auth-card text-center animate-fade-in shadow border-0">
                            <Card.Body className="p-5">
                                <h3 className="fw-bold text-primary mb-2">Welcome Back! 👋</h3>
                                <p className="text-muted mb-4">Login to access your dashboard.</p>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="white"
                                        className="btn-secondary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 border"
                                        onClick={handleGoogleLogin}
                                    >
                                        <img
                                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                            width="18"
                                            alt="Google"
                                        />
                                        Continue with Google
                                    </Button>
                                </div>
                                <div className="mt-4">
                                    <small className="text-muted">
                                        Email/Password login coming soon to the React version.
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};
