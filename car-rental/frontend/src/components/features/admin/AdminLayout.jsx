import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-56 flex-shrink-0 mr-4">
                <Sidebar />
            </aside>
            <main className="flex-1 min-h-screen p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}