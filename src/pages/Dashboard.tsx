import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { DataManager } from '../services/DataManager';
import type { HistoryEntry } from '../types';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { ConfidenceChart } from '../components/charts/ConfidenceChart';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        const loadData = async () => {
            try {
                const data = await DataManager.syncUserHistory(currentUser.uid);
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentUser, navigate]);

    const stats = useMemo(() => {
        const totalTests = history.length;
        const totalScore = history.reduce((acc, curr) => acc + curr.scorePercent, 0);
        const avgScore = totalTests ? (totalScore / totalTests).toFixed(1) : "0";

        // Detailed stats
        let totalCorrect = 0;
        let totalIncorrect = 0;
        let totalAttempted = 0;

        history.forEach(h => {
            if (h.userAnswers) {
                Object.values(h.userAnswers).forEach(ans => {
                    totalAttempted++;
                    if (ans.isCorrect) totalCorrect++;
                    else totalIncorrect++;
                });
            }
        });

        const precision = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : "0";

        return { totalTests, avgScore, precision, totalCorrect, totalIncorrect, totalAttempted };
    }, [history]);

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <h2 className="fw-bold section-title">My Dashboard</h2>
                <div className="title-underline mx-auto"></div>
            </div>

            <Row className="g-3 mb-5 justify-content-center">
                <Col md={3} lg={2}>
                    <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-primary h-100">
                        <h6 className="text-muted text-uppercase small fw-bold">Tests Taken</h6>
                        <h2 className="fw-bold text-primary mb-0">{stats.totalTests}</h2>
                    </div>
                </Col>
                <Col md={3} lg={2}>
                    <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-warning h-100">
                        <h6 className="text-muted text-uppercase small fw-bold">Avg. Score</h6>
                        <h2 className="fw-bold text-warning mb-0">{stats.avgScore}%</h2>
                    </div>
                </Col>
                 <Col md={3} lg={2}>
                    <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-success h-100">
                        <h6 className="text-muted text-uppercase small fw-bold">Precision</h6>
                        <h2 className="fw-bold text-success mb-0">{stats.precision}%</h2>
                    </div>
                </Col>
            </Row>

             <Row className="justify-content-center mb-5">
                <Col xs={12}>
                    <Card className="border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold text-primary mb-3">🎯 Overall Confidence Analysis</h5>
                        <ConfidenceChart data={history} />
                    </Card>
                </Col>
            </Row>

            <Row className="justify-content-center mb-5">
                <Col xs={12}>
                    <Card className="border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold text-primary mb-3">📈 Accuracy Trend</h5>
                        <PerformanceChart data={history} />
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
