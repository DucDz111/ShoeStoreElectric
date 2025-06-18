import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { isAuthenticated, logout, token } = useContext(AuthContext);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  useEffect(() => {
    console.log('ProfilePage: isAuthenticated:', isAuthenticated);
    console.log('ProfilePage: Token:', token);

    const fetchProfile = async () => {
      try {
        if (!token) {
          console.log('No token found, redirecting to login');
          setError('Vui lòng đăng nhập lại');
          setLoading(false);
          logout();
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        });

        console.log('Profile response:', response.data);
        const userData = {
          email: response.data.email,
          firstName: response.data.fullName.split(' ')[0] || '',
          lastName: response.data.fullName.split(' ').slice(1).join(' ') || '',
          phone: response.data.phone || 'Chưa cập nhật',
          address: response.data.address || 'Vietnam',
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err.response?.status, err.response?.data, err.message);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
        setLoading(false);
        if (err.response?.status === 403 || err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          logout();
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate, logout, isAuthenticated, token]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <nav className="flex items-center space-x-2 text-gray-600">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800">Tài khoản</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">TRANG TÀI KHOẢN</h2>
          <p className="text-gray-600 mb-4">
            Xin chào, <span className="font-semibold">{fullName}!</span>
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="font-semibold text-red-600">Thông tin tài khoản</li>
            <li>
              <Link to="/order" className="hover:underline">Đơn hàng của tôi</Link>
            </li>
            <li>
              <Link to="/address" className="hover:underline">Địa chỉ của tôi</Link>
            </li>
            <li>
              <Link to="/change-password" className="hover:underline">Đổi mật khẩu</Link>
            </li>
            <li>
              <Link to="/logout" className="hover:underline">Đăng xuất</Link>
            </li>
          </ul>
        </div>

        <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">TÀI KHOẢN</h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Tên tài khoản: {fullName}!</h3>
            <p className="text-gray-600">
              <span className="font-semibold">Địa chỉ:</span> {user.address}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Điện thoại:</span> {user.phone}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sổ địa chỉ</h3>
            <div className="border p-4 rounded-md">
              <p className="text-gray-600">
                <span className="font-semibold">Địa chỉ:</span> {user.address}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Điện thoại:</span> {user.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;