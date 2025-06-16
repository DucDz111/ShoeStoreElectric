import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddressPage = () => {
  const { isAuthenticated, logout, token, loading } = useContext(AuthContext);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Chờ quá trình xác thực token từ AuthContext hoàn tất
    if (loading) {
      return; // Không làm gì khi đang tải
    }

    const fetchAddress = async () => {
      try {
        if (isAuthenticated === null || !token) {
          throw new Error('No token or authentication status unavailable');
        }

        if (!isAuthenticated) {
          setError('Vui lòng đăng nhập để xem địa chỉ');
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

        setAddress(response.data.address || 'Chưa cập nhật');
        setPhone(response.data.phone || 'Chưa cập nhật');
        setPageLoading(false);
      } catch (err) {
        console.error('Address fetch error:', err.response?.status, err.response?.data, err.message);
        setError('Không thể tải địa chỉ. Vui lòng thử lại.');
        setPageLoading(false);
        if (err.response?.status === 403 || err.response?.status === 401 || err.message === 'No token or authentication status unavailable') {
          logout();
          navigate('/login');
        }
      }
    };

    fetchAddress();
  }, [isAuthenticated, token, loading, navigate, logout]);

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        'http://localhost:8080/api/profile',
        { address, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        }
      );

      setSuccess('Cập nhật địa chỉ thành công!');
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      userData.address = address;
      userData.phone = phone;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Update address error:', err.response?.status, err.response?.data, err.message);
      setError('Cập nhật địa chỉ thất bại. Vui lòng thử lại.');
      if (err.response?.status === 403 || err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  if (loading || pageLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">Đang tải...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <nav className="flex items-center space-x-2 text-gray-600">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Địa chỉ của tôi</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ĐỊA CHỈ CỦA BẠN</h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Địa chỉ hiện tại</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">Địa chỉ:</span> {address}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">Điện thoại:</span> {phone}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cập nhật địa chỉ</h3>
          {success && <p className="text-green-600 mb-4 font-medium">{success}</p>}
          {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}
          <form onSubmit={handleUpdateAddress} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                placeholder="Nhập địa chỉ..."
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                placeholder="Nhập số điện thoại..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
            >
              Cập nhật
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;