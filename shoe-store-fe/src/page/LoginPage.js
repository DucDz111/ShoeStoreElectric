import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { login } = useContext(AuthContext);
  const { syncCartOnLogin } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = '';

    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email là bắt buộc';
        } else if (!emailRegex.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Mật khẩu là bắt buộc';
        } else if (value.length < 6) {
          error = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    return Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        formData,
        { headers: { 'Content-Type': 'application/json' }, withCredentials: false }
      );

      const { token, email, firstName, lastName, phone, address, role } = response.data;
      const userData = {
        email,
        firstName,
        lastName,
        phone: phone || 'Chưa cập nhật',
        address: address || 'Vietnam',
        role: role || 'USER',
      };

      const userRole = await login(token, userData);

      console.log('User role after login:', userRole); // Debug

      // Đồng bộ giỏ hàng
      try {
        await syncCartOnLogin();
        console.log('Cart synced successfully after login');
      } catch (syncError) {
        console.error('Error syncing cart on login:', syncError);
        toast.error('Đồng bộ giỏ hàng thất bại sau đăng nhập!', {
          position: 'top-right',
        });
      }

      toast.success('Đăng nhập thành công!', {
        position: 'top-right',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const from = location.state?.from?.pathname || '/';

      if (userRole === 'USER') {
        navigate(from, { replace: true });
      } else if (userRole === 'ADMIN') {
        toast.info(
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">Chào mừng Admin! Bạn muốn đi đâu?</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigate('/', { replace: true });
                  toast.dismiss('admin-role-selection');
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Trang người dùng
              </button>
              <button
                onClick={() => {
                  navigate('/admin/products', { replace: true });
                  toast.dismiss('admin-role-selection');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Trang quản trị
              </button>
            </div>
          </div>,
          {
            position: 'top-right',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            toastId: 'admin-role-selection',
          }
        );
        // Loại bỏ navigate tự động, để người dùng tự chọn
      } else {
        console.warn('User role không xác định:', userRole);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
      setServerError(
        error.response?.data?.message ||
        (typeof error.response?.data === 'object'
          ? JSON.stringify(error.response.data)
          : 'Đăng nhập thất bại. Vui lòng thử lại.')
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ĐĂNG NHẬP TÀI KHOẢN</h1>

        {serverError && <p className="text-red-500 text-center mb-4">{serverError}</p>}

        <p className="text-center mb-6">
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="text-red-600 hover:underline">
            Đăng ký tại đây
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-gray-600 hover:underline">
              Quên mật khẩu? Nhấn vào đây
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md mt-6 hover:bg-red-700 transition"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">Hoặc đăng nhập bằng</p>
          <div className="flex justify-center space-x-4">
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="/facebook-icon.png" alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="/google-icon.png" alt="Google" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;