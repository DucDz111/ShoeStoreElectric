import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Hàm ánh xạ paymentMethod sang dạng dễ đọc
const getPaymentMethodDisplay = (method) => {
  const paymentMethods = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    cod: 'Thanh toán khi nhận hàng (COD)',
    Visa: 'Thanh toán bằng Visa',
    Mastercard: 'Thanh toán bằng Mastercard',
    MoMo: 'Thanh toán bằng MoMo',
    ZaloPay: 'Thanh toán bằng ZaloPay',
  };
  return paymentMethods[method] || 'Không xác định';
};

const OrderDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, logout, token, loading } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        if (isAuthenticated === null || !token) {
          throw new Error('No token or authentication status unavailable');
        }

        if (!isAuthenticated) {
          setError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:8080/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        });

        console.log('Dữ liệu chi tiết đơn hàng từ API:', response.data);
        setOrder(response.data);
        setDetailLoading(false);
      } catch (err) {
        console.error('Order detail fetch error:', err.response?.status, err.response?.data, err.message);
        setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
        setDetailLoading(false);
        if (err.response?.status === 403 || err.response?.status === 401 || err.message === 'No token or authentication status unavailable') {
          logout();
          navigate('/login');
        }
      }
    };

    fetchOrderDetail();
  }, [id, isAuthenticated, token, loading, navigate, logout]);

  if (detailLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Đang tải...</div>;
  }

  if (error || !order) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error || 'Đơn hàng không tồn tại'}</div>;
  }

  // Tính tổng thành tiền
  const totalAmountFromItems = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-4 text-gray-500 mb-8">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <span>/</span>
          <Link to="/order" className="hover:underline">Đơn hàng của tôi</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Chi tiết đơn hàng #{order.id}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">CHI TIẾT ĐƠN HÀNG #{order.id}</h2>

          {/* Thông tin người mua */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Thông tin người mua</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong className="text-gray-600">Họ và tên:</strong> {order.user?.firstName} {order.user?.lastName}</p>
              <p><strong className="text-gray-600">Email:</strong> {order.user?.email}</p>
              <p><strong className="text-gray-600">Số điện thoại:</strong> {order.user?.phone}</p>
              <p><strong className="text-gray-600">Địa chỉ:</strong> {order.user?.address}</p>
            </div>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong className="text-gray-600">Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              <p><strong className="text-gray-600">Thành tiền:</strong> <span className="text-red-600 font-semibold">{order.totalAmount.toLocaleString('vi-VN')}đ</span></p>
              <p><strong className="text-gray-600">Phương thức thanh toán:</strong> {getPaymentMethodDisplay(order.paymentMethod)}</p>
              <p><strong className="text-gray-600">Trạng thái:</strong> {order.status}</p>
              <p><strong className="text-gray-600">Ghi chú:</strong> {order.orderNote || 'Không có ghi chú'}</p>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Danh sách sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-gray-700 font-semibold rounded-tl-lg">Tên sản phẩm</th>
                    <th className="p-4 text-gray-700 font-semibold">Mã sản phẩm</th>
                    <th className="p-4 text-gray-700 font-semibold">Kích thước</th>
                    <th className="p-4 text-gray-700 font-semibold">Màu sắc</th>
                    <th className="p-4 text-gray-700 font-semibold">Số lượng</th>
                    <th className="p-4 text-gray-700 font-semibold">Giá</th>
                    <th className="p-4 text-gray-700 font-semibold rounded-tr-lg">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="p-4">{item.name || 'N/A'}</td>
                      <td className="p-4">{item.model || 'N/A'}</td>
                      <td className="p-4">{item.size || 'N/A'}</td>
                      <td className="p-4">{item.color || 'N/A'}</td>
                      <td className="p-4">{item.quantity || 0}</td>
                      <td className="p-4 text-red-600 font-semibold">{item.price ? item.price.toLocaleString('vi-VN') + 'đ' : 'N/A'}</td>
                      <td className="p-4 text-red-600 font-semibold">{item.price && item.quantity ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ' : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Tổng thành tiền */}
            <div className="mt-4 text-right">
              <p className="text-lg font-semibold text-gray-800">
                Tổng thành tiền: <span className="text-red-600">{totalAmountFromItems.toLocaleString('vi-VN')}đ</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/order')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;