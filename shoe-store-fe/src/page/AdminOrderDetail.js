import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token xác thực.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/admin/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        const errorMsg = 'Không thể tải chi tiết đơn hàng: ' + (err.response?.data?.message || err.message);
        console.error('API Error:', err.response?.status, errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-6 text-center">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CHI TIẾT ĐƠN HÀNG #{order.id}</h1>

        {/* Thông tin người mua */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin người mua</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Tên:</strong> {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}</p>
              <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
              <p><strong>Số điện thoại:</strong> {order.user?.phone || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Địa chỉ:</strong> {order.user?.address || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="border p-4 rounded-md flex items-center justify-between">
                <div>
                  <p><strong>Tên sản phẩm:</strong> {item.name || 'N/A'}</p>
                  <p><strong>Kích thước:</strong> {item.size || 'N/A'}</p>
                  <p><strong>Màu sắc:</strong> {item.color || 'N/A'}</p>
                  <p><strong>Số lượng:</strong> {item.quantity}</p>
                </div>
                <div>
                  <p><strong>Giá:</strong> {parseInt(item.price).toLocaleString()}₫</p>
                  <p><strong>Thành tiền:</strong> {parseInt(item.price * item.quantity).toLocaleString()}₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng quan đơn hàng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tổng quan đơn hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Trạng thái:</strong> {order.status}</p>
              <p><strong>Ngày đặt hàng:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Tổng cộng:</strong> {parseInt(order.totalAmount).toLocaleString()}₫</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminOrderDetail;