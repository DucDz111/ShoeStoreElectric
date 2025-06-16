import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

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

const OrderPage = () => {
  const { isAuthenticated, logout, token, loading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    if (loading) {
      return; // Chờ xác thực token hoàn tất
    }

    const fetchOrders = async () => {
      try {
        if (isAuthenticated === null || !token) {
          throw new Error('No token or authentication status unavailable');
        }

        if (!isAuthenticated) {
          setError('Vui lòng đăng nhập để xem đơn hàng');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        });

        console.log('Dữ liệu đơn hàng từ API:', response.data);
        setOrders(response.data);
        setPageLoading(false);
      } catch (err) {
        console.error('Order fetch error:', err.response?.status, err.response?.data, err.message);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        setPageLoading(false);
        if (err.response?.status === 403 || err.response?.status === 401 || err.message === 'No token or authentication status unavailable') {
          logout();
          navigate('/login');
        }
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, loading, navigate, logout]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      console.log('Token used:', token);
      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status`,
        { status: 'CANCELLED' },
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        }
      );

      console.log('Cancel order response:', response.data);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      toast.success('Đã hủy đơn hàng thành công!');
    } catch (err) {
      console.error('Cancel order error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config
      });
      const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  if (loading || pageLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">Đang tải...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-600">{error}</div>;
  }

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'Chờ thanh toán':
        return orders.filter((order) => order.status === 'PENDING');
      case 'Vận chuyển':
        return orders.filter((order) => order.status === 'PROCESSING');
      case 'Chờ giao hàng':
        return orders.filter((order) => order.status === 'SHIPPING');
      case 'Hoàn thành':
        return orders.filter((order) => order.status === 'DELIVERED');
      case 'Đã hủy':
        return orders.filter((order) => order.status === 'CANCELLED');
      case 'Trả hàng/Hoàn tiền':
        return orders.filter((order) => order.status === 'RETURNED'); // Thay 'RETURNED' bằng trạng thái thực tế nếu có
      case 'Tất cả':
      default:
        return orders.filter((order) => !['CANCELLED', 'DELIVERED'].includes(order.status));
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <nav className="flex items-center space-x-2 text-gray-600">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Đơn hàng của tôi</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ĐƠN HÀNG CỦA BẠN</h2>
        <div className="mb-6 flex space-x-4 border-b">
          {['Tất cả', 'Chờ thanh toán', 'Vận chuyển', 'Chờ giao hàng', 'Hoàn thành', 'Đã hủy', 'Trả hàng/Hoàn tiền'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 ${activeTab === tab ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Không có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-4 text-gray-700 font-semibold">Mã đơn hàng</th>
                  <th className="p-4 text-gray-700 font-semibold">Ngày đặt</th>
                  <th className="p-4 text-gray-700 font-semibold">Thành tiền</th>
                  <th className="p-4 text-gray-700 font-semibold">Phương thức thanh toán</th>
                  <th className="p-4 text-gray-700 font-semibold">Trạng thái</th>
                  <th className="p-4 text-gray-700 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition duration-200">
                    <td className="p-4">{order.id}</td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 text-red-600 font-semibold">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                    <td className="p-4">{getPaymentMethodDisplay(order.paymentMethod)}</td>
                    <td className="p-4">{order.status}</td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="text-red-600 hover:text-red-800 font-medium mr-4 transition duration-200"
                      >
                        Xem chi tiết
                      </button>
                      {['PENDING', 'PROCESSING'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-gray-600 hover:text-red-600 font-medium transition duration-200"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;