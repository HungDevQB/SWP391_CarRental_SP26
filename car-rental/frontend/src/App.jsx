import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './store/AuthContext';
import AuthHandler from './components/features/auth/AuthHandler.jsx';
import AppRoutes from './routes/index.jsx';

const App = () => {
    const { user } = useContext(AuthContext);

    return (
        <>
            <div className="app-container">
                <AuthHandler />
                <AppRoutes />
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default App;