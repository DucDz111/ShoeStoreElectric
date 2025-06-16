import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Chart from 'chart.js/auto'; // Import Chart.js

const AdminRevenueDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [topCustomerName, setTopCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Bạn không có quyền truy cập trang này!', { position: 'top-right', autoClose: 3000 });
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [statsResponse, chartResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/admin/revenue-stats', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            params: { year: 2025, month: 6 }
          }),
          axios.get('http://localhost:8080/api/admin/revenue/chart', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            params: { year: 2025 }
          }),
        ]);
        setTotalRevenue(statsResponse.data.totalRevenue);
        setOrderCount(statsResponse.data.orderCount);
        setTopCustomerName(statsResponse.data.topCustomerName || 'Chưa có dữ liệu');
        setChartData(chartResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu doanh thu: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    if (token) fetchRevenueData();
  }, [token]);

  useEffect(() => {
    if (chartRef.current && chartData.labels.length > 0 && chartData.data.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: chartData.data,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Doanh thu (VNĐ)'
              },
              ticks: {
                callback: function(value) {
                  return value.toLocaleString() + '₫';
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Tháng'
              }
            }
          }
        }
      });
    }
  }, [chartData]);

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
            QUẢN LÝ DASHBOARD
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
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tổng quan Doanh thu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-gray-700">Tổng Doanh thu</h3>
                <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString()}₫</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-gray-700">Số lượng Đơn hàng</h3>
                <p className="text-2xl font-bold text-green-600">{orderCount}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-gray-700">Khách hàng hàng đầu</h3>
                <p className="text-2xl font-bold text-yellow-600">{topCustomerName}</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Biểu đồ Doanh thu (Theo tháng)</h3>
              <canvas id="revenueChart" ref={chartRef} className="w-full h-64"></canvas>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminRevenueDashboard;