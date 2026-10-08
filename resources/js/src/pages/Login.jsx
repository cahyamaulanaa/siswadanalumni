import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Login.module.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await login(email, password);
            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.message || 'Login gagal');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* Animated background blobs */}
            <div className={styles.blobContainer}>
                <div className={`${styles.blob} ${styles.blob1}`}></div>
                <div className={`${styles.blob} ${styles.blob2}`}></div>
                <div className={`${styles.blob} ${styles.blob3}`}></div>
            </div>

            <div className={styles.cardWrapper}>
                {/* Card Container */}
                <div className={styles.card}>
                    
                    {/* Logo Section */}
                    <div className={styles.logoSection}>
                        <div className={styles.logoBadge}>
                            <img src="/logo-villa-merah.png.png" alt="Logo Bimbel Gambar Villa Merah" className={styles.logoImage} />
                        </div>
                        <h1 className={styles.title}></h1>
                        <p className={styles.subtitle}>
                            Sistem Informasi Siswa & Alumni
                        </p>
                        <p className={styles.brandSubtitle}>Bimbel Gambar Villa Merah</p>
                        <div className={styles.divider}></div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className={styles.errorAlert}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Email Field */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={`${styles.inputWrapper} ${focusedField === 'email' ? styles.focused : ''}`}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className={styles.input}
                                    placeholder="masukan email"
                                />
                                <span className={styles.inputIcon}>📧</span>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={`${styles.inputWrapper} ${focusedField === 'password' ? styles.focused : ''}`}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className={styles.input}
                                    placeholder="masukan password"
                                />
                                <span className={styles.inputIcon}>🔒</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                    Logging in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>


                    {/* Footer */}
                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            © 2026 - Sistem Informasi Siswa & Alumni
                        </p>
                    </div>
                </div>

                {/* Bottom decoration */}
                <div className={styles.bottomText}>
                    Powered by Cahya Maulana
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
