import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUserPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Bạn không có quyền truy cập trang này!', { position: 'top-right', autoClose: 3000 });
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/users', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const handleBlockUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn chặn người dùng này?')) return;
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setUsers(users.map((u) => (u.id === id ? { ...u, blocked: true } : u)));
      toast.success('Chặn người dùng thành công!', { position: 'top-right' });
    } catch (err) {
      toast.error('Chặn thất bại: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  const handleUnblockUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn mở chặn người dùng này?')) return;
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${id}/unblock`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setUsers(users.map((u) => (u.id === id ? { ...u, blocked: false } : u)));
      toast.success('Mở chặn người dùng thành công!', { position: 'top-right' });
    } catch (err) {
      toast.error('Mở chặn thất bại: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative mb-8 text-center"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <h1
            className="text-3xl font-bold cursor-pointer inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
          >
            QUẢN LÝ NGƯỜI DÙNG
          </h1>
          {showDropdown && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fadeIn"
            >
              <a
                href="/admin/products"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/products');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Quản lý sản phẩm
              </a>
              <a
                href="/admin/orders"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/orders');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Quản lý đơn hàng
              </a>
              <a
                href="/admin/revenue-dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/revenue-dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 8c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4zm0-12C6.48 4 2 8.48 2 14c0 4.41 3.59 8 8 8s8-3.59 8-8c0-5.52-4.48-10-10-10z"
                  />
                </svg>
                Dashboard Doanh Thu
              </a>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <span className="text-gray-500 block text-sm">ID</span>
                      <span className="font-medium">{user.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Email</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Tên</span>
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Quyền</span>
                      <span className="font-medium">{user.role}</span>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      {user.blocked ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Mở chặn
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Chặn user
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminUserPage;
