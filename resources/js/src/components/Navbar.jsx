import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import styles from './Navbar.module.css';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <div className={styles.navBrand}>
                    {/* <span className={styles.brandIcon}>🎓</span> */}
                    <div className={styles.brandText}>
                        {/* <p className={styles.brandName}>SISA Admin</p> */}
                        {/* <p className={styles.brandSubtitle}>Management System</p> */}
                    </div>
                </div>

                <div className={styles.navRight}>
                    <div className={styles.userSection}>
                        <div className={styles.userAvatar}>{user?.nama?.charAt(0) || '👤'}</div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.nama}</p>
                            <p className={styles.userRole}>{user?.role.replace('_', ' ').toUpperCase()}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        title="Logout"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </button>
                </div>
            </div>
        </nav>
    );
};
