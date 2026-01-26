import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaSearch, FaComments, FaLock } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const UserList = ({ currentUserId, onSelect, initialSelectedUser }) => {
  const [activeUserId, setActiveUserId] = useState(
    initialSelectedUser ? (initialSelectedUser.id || initialSelectedUser.userId) : null
  );
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter users based on search term
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const name = user.fullName || user.username || user.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const handleSelect = (user) => {
    setActiveUserId(user.id || user.userId);
    onSelect(user);
  };

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('auth');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetch(`${API_BASE}/api/chat-users/of-user?supplierId=${currentUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) throw new Error('auth');
          throw new Error('network');
        }
        return res.json();
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setUsers([]);
        setLoading(false);
      });
  }, [currentUserId]);

  // Pre-select initialSelectedUser if provided
  useEffect(() => {
    if (initialSelectedUser) {
      setActiveUserId(initialSelectedUser.id || initialSelectedUser.userId);
      onSelect(initialSelectedUser);
    }
  }, [initialSelectedUser, onSelect]);

  // Loading state
  if (loading) {
    return (
      <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error === 'auth') {
    return (
      <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 h-full flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <FaLock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cần đăng nhập</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Vui lòng đăng nhập để sử dụng tính năng chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FaComments className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Tin nhắn</h3>
            <p className="text-sm text-gray-500">
              {filteredUsers.length} cuộc trò chuyện
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {users.length > 0 && (
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            {searchTerm ? (
              // No search results
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Không tìm thấy</h4>
                <p className="text-gray-500 text-sm">
                  Không có cuộc trò chuyện nào khớp với "{searchTerm}"
                </p>
              </>
            ) : (
              // No conversations yet
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaComments className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Chưa có tin nhắn</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Chưa có khách hàng nào từng chat với bạn.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Hãy chờ khách hàng chủ động nhắn tin để bắt đầu cuộc trò chuyện.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredUsers.map(user => {
              const isActive = (user.id || user.userId) === activeUserId;
              const displayName = user.fullName || user.username || user.email || 'Khách hàng';
              const displayEmail = user.email || '';
              
              return (
                <div
                  key={user.id || user.userId}
                  className={`group cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
                      : 'hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => handleSelect(user)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                      }`}>
                        <FaUserCircle className={`w-8 h-8 ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm truncate ${
                          isActive ? 'text-white' : 'text-gray-800'
                        }`}>
                          {displayName}
                        </h4>
                        {/* <span className={`text-xs ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          2h
                        </span> */}
                      </div>
                      
                      {displayEmail && (
                        <p className={`text-xs truncate mt-1 ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {displayEmail}
                        </p>
                      )}
                      
                      {/* Last message preview */}
                      <p className={`text-xs truncate mt-1 ${
                        isActive ? 'text-blue-50' : 'text-gray-400'
                      }`}>
                        Nhấn để bắt đầu trò chuyện
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            💬 Trò chuyện
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserList;