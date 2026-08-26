import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { alumniService } from '../services/alumniService';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const [alumniCount, setAlumniCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        fetchAlumniCount();
        
        // Refresh setiap 30 detik
        const interval = setInterval(fetchAlumniCount, 30000);
        
        // Listen untuk route changes dan refresh alumni count
        const handleRouteChange = () => {
            fetchAlumniCount();
        };
        
        window.addEventListener('focus', handleRouteChange);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleRouteChange);
        };
    }, []);

    const fetchAlumniCount = async () => {
        try {
            setLoading(true);
            console.log('🔵 [Sidebar] Starting to fetch alumni statistics...');
            
            const response = await alumniService.getStatistics();
            console.log('🔵 [Sidebar] Response received:', response);
            
            if (response.success && response.data) {
                const count = response.data.total_alumni || 0;
                setAlumniCount(count);
                console.log('🟢 [Sidebar] Alumni count updated:', count);
            } else {
                console.warn('🟡 [Sidebar] Invalid response structure:', response);
                setAlumniCount(0);
            }
        } catch (err) {
            console.error('🔴 [Sidebar] Error fetching alumni count:', err.message, err);
            setAlumniCount(0);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        {
            icon: '📊',
            label: 'Dashboard',
            path: '/dashboard',
        },
        {
            icon: '👨‍🎓',
            label: 'Manajemen Siswa',
            path: '/siswa',
        },
        {
            icon: '📚',
            label: 'Alumni',
            path: '/alumni',
        },
        {
            icon: '🖼️',
            label: 'Portofolio Alumni',
            path: '/portofolio-alumni',
        },
        ...(user?.role === 'super_admin'
            ? [
                {
                    icon: '⚙️',
                    label: 'Pengaturan',
                    path: '/settings',
                },
            ]
            : []),
    ];

    const isActive = (path) => location.pathname === path;

    const handleNavigate = (path) => {
        navigate(path);
    };

    const roleLabel = (role) => {
        if (!role) return 'User';

        return role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className={`${styles.sidebar} ${!isExpanded ? styles.collapsed : ''}`}>
            {/* Sidebar Header */}
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>
                        <img src="/logo-villa-merah.png.png" alt="Logo Bimbel Gambar Villa Merah" />
                    </span>
                    {isExpanded && <span className={styles.logoText}>SISA</span>}
                </div>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? '◀' : '▶'}
                </button>
            </div>

            {/* Sidebar Menu */}
            <nav className={styles.sidebarNav}>
                <ul className={styles.menuList}>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                                onClick={() => handleNavigate(item.path)}
                                title={!isExpanded ? item.label : ''}
                            >
                                <span className={styles.menuIcon}>{item.icon}</span>
                                {isExpanded && (
                                    <>
                                        <span className={styles.menuLabel}>{item.label}</span>
                                        {item.label === 'Alumni' && (
                                            <span 
                                                className={styles.badge}
                                                style={{
                                                    background: loading ? '#e5e7eb' : alumniCount > 0 ? 'rgb(239 68 68)' : '#e5e7eb',
                                                    color: loading ? '#999' : alumniCount > 0 ? 'white' : '#999',
                                                    cursor: 'default',
                                                }}
                                            >
                                                {loading ? '...' : alumniCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className={styles.sidebarFooter}>
                <div className={styles.footerContent}>
                    <div className={styles.userAvatar}>👤</div>
                    {isExpanded && (
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.nama || 'Pengguna'}</p>
                            <p className={styles.userRole}>{roleLabel(user?.role)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
