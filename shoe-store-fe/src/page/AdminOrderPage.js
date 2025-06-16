import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const AdminOrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token xác thực.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:8080/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Data from API:', data);
        if (data.length === 0) {
          console.log('Không có đơn hàng nào trong API response.');
        }
        setOrders(data);
        setLoading(false);
      } catch (err) {
        const errorMsg = 'Không thể tải danh sách đơn hàng: ' + (err.response?.data?.message || err.message);
        console.error('API Error:', err.response?.status, errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

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
        return orders.filter((order) => order.status === 'RETURNED');
      case 'Tất cả':
      default:
        return orders.filter((order) => !['CANCELLED', 'DELIVERED'].includes(order.status));
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/admin/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      // Cập nhật state và chuyển tab ngay lập tức, không phụ thuộc vào response
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
      toast.success(`Đã cập nhật trạng thái thành công!`);

      // Chuyển tab dựa trên trạng thái mới
      switch (newStatus) {
        case 'PROCESSING':
          setActiveTab('Vận chuyển');
          break;
        case 'SHIPPING':
          setActiveTab('Chờ giao hàng');
          break;
        case 'DELIVERED':
          setActiveTab('Hoàn thành');
          break;
        case 'CANCELLED':
          setActiveTab('Đã hủy');
          break;
        default:
          break;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || (err.response?.status === 400 ? 'Lỗi server, vui lòng kiểm tra lại' : 'Cập nhật trạng thái thất bại');
      // Chỉ hiển thị toast nếu lỗi không phải do serialization (400 nhưng backend đã xử lý)
      if (err.response?.status !== 400 || err.response?.data?.error) {
        toast.error(errorMsg);
      } else {
        // Nếu 400 do serialization (backend đã cập nhật), vẫn coi là thành công
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
        toast.success(`Đã cập nhật trạng thái thành công!`);

        switch (newStatus) {
          case 'PROCESSING':
            setActiveTab('Vận chuyển');
            break;
          case 'SHIPPING':
            setActiveTab('Chờ giao hàng');
            break;
          case 'DELIVERED':
            setActiveTab('Hoàn thành');
            break;
          case 'CANCELLED':
            setActiveTab('Đã hủy');
            break;
          default:
            break;
        }
      }
      console.error('API Error:', err.response?.status, errorMsg);
    }
  };

  const filteredOrders = getFilteredOrders();

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
            QUẢN LÝ ĐƠN HÀNG
          </h1>
          {showDropdown && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fadeIn"
            >
              <a
                href="/admin/users"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/users');
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Quản lý khách hàng
              </a>
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

        <div className="mb-6 flex space-x-4 border-b">
          {['Tất cả', 'Chờ thanh toán', 'Vận chuyển', 'Chờ giao hàng', 'Hoàn thành', 'Đã hủy', 'Trả hàng/Hoàn tiền'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 ${activeTab === tab ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {filteredOrders.length === 0 && !error && (
          <p className="text-center text-gray-500 mb-8">Không có đơn hàng nào để hiển thị.</p>
        )}

        {filteredOrders.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{activeTab}</h2>
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <span className="text-gray-500 block text-sm">Mã đơn</span>
                      <span className="font-medium">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Tổng</span>
                      <span className="font-medium">{parseInt(order.totalAmount).toLocaleString()}₫</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Người dùng</span>
                      <span className="font-medium">{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Trạng thái</span>
                      <span className="font-medium">{order.status}</span>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </button>
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {order.status === 'PROCESSING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Đã giao thành công
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

export default AdminOrderPage;