import React from 'react';
import { FaCarSide } from 'react-icons/fa';
import styles from './LoadingSpinner.module.scss';

const colorClassMap = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
};

const LoadingSpinner = ({
    size = 'medium',
    color = 'blue',
    iconSize = 'text-7xl', // mặc định rất lớn
    icon = null,
    text = 'Đang tải dữ liệu...',
    subText = 'Vui lòng chờ trong giây lát'
}) => {
    const colorClass = colorClassMap[color] || colorClassMap.blue;
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className={`mb-6 bg-gradient-to-r from-blue-600 to-sky-600 p-6 rounded-3xl inline-block shadow-2xl`}>
                {icon || <FaCarSide className={`${iconSize} text-white animate-bounce`} />}
            </div>
            <div className={`${styles.spinner} ${styles[size]} flex justify-center items-center mb-4`}>
                <div
                    className={`animate-spin rounded-full border-2 border-t-transparent ${colorClass} ${styles.spinnerInner}`}
                >
                    <div className="sr-only">Đang tải...</div>
                </div>
            </div>
            <p className="mt-2 text-gray-700 text-lg font-medium">{text}</p>
            <p className="mt-1 text-gray-500">{subText}</p>
        </div>
    );
};

export default LoadingSpinner; 