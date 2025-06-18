import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast ,ToastContainer } from 'react-toastify';

const PasswordChangePage = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin.', { position: 'top-right' });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.', { position: 'top-right' });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/profile/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { position: 'top-right' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Password change error:', err.response?.data, err.message);
      if (err.response?.status === 401) {
        toast.error('Mật khẩu hiện tại không đúng.', { position: 'top-right' });
      } else {
        toast.error('Đổi mật khẩu thất bại. Vui lòng thử lại.', { position: 'top-right' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <nav className="flex items-center space-x-2 text-gray-600">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <span>/</span>
          <span className="text-gray-800">Đổi mật khẩu</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">ĐỔI MẬT KHẨU</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full mt-2 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
          >
            Hủy
          </button>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default PasswordChangePage;