import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

// Danh sách danh mục sẵn có
const categoryOptions = [
  'Giay The Thao Sneaker',
  'Giay Bong Ro',
  'Giay Chay Bo',
  'Giay Pickleball',
];

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    model: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    gender: 'nam',
  });
  const [newSizes, setNewSizes] = useState([]);
  const [newColors, setNewColors] = useState([]);
  const [newVariants, setNewVariants] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Số sản phẩm mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // Thêm state cho từ khóa tìm kiếm

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/products', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          params: { page: page - 1, size: limit, sort: 'id,desc', name: searchTerm }, // Thêm tham số tìm kiếm
        });
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit, searchTerm]); // Cập nhật dependency để bao gồm searchTerm

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const productToAdd = {
        ...newProduct,
        price: parseFloat(newProduct.price.replace(/\./g, '')), // Loại bỏ dấu chấm trước khi lưu
        sizes: newSizes.map((size) => ({ size })),
        colors: newColors.map((color) => ({ color })),
        variants: newVariants.map((variant) => ({
          size: { size: variant.size },
          color: { color: variant.color },
          quantity: parseInt(variant.quantity) || 0,
        })),
      };

      const formData = new FormData();
      formData.append('product', new Blob([JSON.stringify(productToAdd)], { type: 'application/json' }));
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      const response = await axios.post('http://localhost:8080/api/admin/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProducts([...products, response.data]);
      setNewProduct({
        name: '',
        model: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        gender: 'nam',
      });
      setNewSizes([]);
      setNewColors([]);
      setNewVariants([]);
      setNewImageFile(null);
      setShowAddForm(false);
      toast.success('Thêm sản phẩm thành công!', { position: 'top-right' });
      // Tải lại trang hiện tại sau khi thêm
      setPage(page);
    } catch (err) {
      toast.error('Thêm sản phẩm thất bại: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Xóa sản phẩm thành công!', { position: 'top-right' });
      // Tải lại trang hiện tại sau khi xóa
      setPage(page);
    } catch (err) {
      toast.error('Xóa sản phẩm thất bại: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  const handleColorChange = (color, checked) => {
    if (checked) {
      setNewColors([...newColors, color]);
    } else {
      setNewColors(newColors.filter((c) => c !== color));
      setNewVariants(newVariants.filter((v) => v.color !== color));
    }
  };

  // Hàm định dạng giá tiền với dấu chấm hàng nghìn
  const formatPrice = (value) => {
    if (!value) return '';
    const cleanedValue = value.replace(/\D/g, ''); // Loại bỏ tất cả ký tự không phải số
    const number = parseFloat(cleanedValue) || 0;
    return number.toLocaleString('vi-VN'); // Định dạng theo kiểu Việt Nam (dấu chấm)
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    setNewProduct({ ...newProduct, price: formatPrice(rawValue) });
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
            QUẢN LÝ SẢN PHẨM
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
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset về trang 1 khi tìm kiếm
                  }}
                  placeholder="Tìm kiếm theo tên sản phẩm..."
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Thêm sản phẩm
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={newProduct.model}
                      onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <input
                      type="text"
                      value={newProduct.price}
                      onChange={handlePriceChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Nhập giá (ví dụ: 1000000)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <input
                      type="text"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImageFile(e.target.files[0])}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categoryOptions.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select
                      value={newProduct.gender}
                      onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="tre_em">Trẻ em</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước & Biến thể</label>
                    <div className="flex flex-col gap-4">
                      {newSizes.map((size, index) => (
                        <div key={index} className="flex flex-col gap-2 bg-gray-200 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span>Size {size}</span>
                            <button
                              onClick={() => {
                                setNewSizes(newSizes.filter((_, i) => i !== index));
                                setNewVariants(newVariants.filter((v) => v.size !== size));
                              }}
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {newColors.map((color) => {
                              const variant = newVariants.find((v) => v.size === size && v.color === color);
                              return (
                                <div key={color} className="flex items-center gap-2">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={!!variant}
                                      onChange={(e) => {
                                        if (e.target.checked && !variant) {
                                          const quantity = prompt(`Nhập số lượng cho size ${size} - màu ${color}:`);
                                          if (quantity !== null && quantity !== '') {
                                            setNewVariants([...newVariants, { size, color, quantity }]);
                                          }
                                        } else if (!e.target.checked && variant) {
                                          setNewVariants(newVariants.filter((v) => v !== variant));
                                        }
                                      }}
                                      className="mr-1"
                                    />
                                    {color}
                                  </label>
                                  {variant && (
                                    <input
                                      type="number"
                                      value={variant.quantity}
                                      onChange={(e) => {
                                        const newQuantity = e.target.value;
                                        setNewVariants(
                                          newVariants.map((v) =>
                                            v === variant ? { ...v, quantity: newQuantity } : v
                                          )
                                        );
                                      }}
                                      className="w-16 px-2 py-1 border rounded"
                                      min="0"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <select
                        onChange={(e) => {
                          const size = e.target.value;
                          if (size && !newSizes.includes(size)) {
                            setNewSizes([...newSizes, size]);
                          }
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="">Chọn kích thước</option>
                        {Array.from({ length: 45 - 37 + 1 }, (_, i) => 37 + i)
                          .filter((size) => !newSizes.includes(size.toString()))
                          .map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <div className="flex gap-2 mb-2">
                      {['Đỏ', 'Trắng', 'Xanh', 'Vàng'].map((color) => (
                        <label key={color} className="flex items-center">
                          <input
                            type="checkbox"
                            value={color}
                            checked={newColors.includes(color)}
                            onChange={(e) => handleColorChange(color, e.target.checked)}
                            className="mr-1"
                          />
                          {color}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Thêm sản phẩm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full mt-2 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <span className="text-gray-500 block text-sm">ID</span>
                        <span className="font-medium">{product.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">Tên sản phẩm</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">Giá</span>
                        <span className="font-medium">{parseInt(product.price).toLocaleString()}₫</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">Hình ảnh</span>
                        {product.imageUrl && (
                          <img
                            src={`http://localhost:8080${product.imageUrl}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded mt-1"
                          />
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-2 mx-1 py-2">{`Trang ${page} / ${totalPages}`}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminProductPage;