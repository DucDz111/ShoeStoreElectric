import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Danh sách danh mục sẵn có
const categoryOptions = [
  'Giay The Thao Sneaker',
  'Giay Bong Ro',
  'Giay Chay Bo',
  'Giay Pickleball',
];

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [editingSizes, setEditingSizes] = useState([]);
  const [editingColors, setEditingColors] = useState([]);
  const [editingVariants, setEditingVariants] = useState([]);

  useEffect(() => {
    const keys = editingVariants.map(v => `${v.size}-${v.color}`);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicates.length > 0) {
      console.warn('Các key trùng:', duplicates);
    } else {
      console.log('Không có key trùng trong variants');
    }
  }, [editingVariants]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const productData = response.data;
        setProduct(productData);
        setEditingSizes(productData.sizes?.map((s) => s.size) || []);
        setEditingColors(productData.colors?.map((c) => c.color) || []);
        setEditingVariants(
          productData.variants?.map((v) => ({
            size: v.size.size,
            color: v.color.color,
            quantity: v.quantity,
          })) || []
        );
        setLoading(false);
      } catch (err) {
        setError('Không thể tải sản phẩm: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const productToUpdate = {
        ...product,
        price: parseFloat(product.price.replace(/\./g, '')), // Loại bỏ dấu chấm trước khi lưu
        sizes: editingSizes.map((size) => ({ size })),
        colors: editingColors.map((color) => ({ color })),
        variants: editingVariants.map((variant) => ({
          size: { size: variant.size },
          color: { color: variant.color },
          quantity: parseInt(variant.quantity) || 0,
        })),
      };

      const formData = new FormData();
      formData.append("product", new Blob([JSON.stringify(productToUpdate)], { type: "application/json" }));
      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      await axios.put(`http://localhost:8080/api/admin/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success('Cập nhật sản phẩm thành công!', { position: 'top-right' });
      navigate('/admin/products');
    } catch (err) {
      toast.error('Cập nhật sản phẩm thất bại: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  const addVariantForSize = (size) => {
    if (!editingColors.length) {
      toast.error('Vui lòng chọn ít nhất một màu sắc trước!', { position: 'top-right' });
      return;
    }
    const existingVariants = editingVariants.filter((v) => v.size === size);
    const availableColors = editingColors.filter((color) => !existingVariants.some((v) => v.color === color));
    if (!availableColors.length) {
      toast.error('Tất cả màu sắc đã được thêm cho kích thước này!', { position: 'top-right' });
      return;
    }
    availableColors.forEach((color) => {
      const quantity = prompt(`Nhập số lượng cho size ${size} - màu ${color}:`);
      if (quantity !== null && quantity !== '') {
        const quantityNum = parseInt(quantity, 10);
        if (!isNaN(quantityNum) && quantityNum >= 0) {
          setEditingVariants(prev => [...prev, { size, color, quantity: quantityNum }]);
        } else {
          toast.error(`Số lượng nhập cho size ${size} - màu ${color} không hợp lệ`, { position: 'top-right' });
        }
      }
    });
  };

  const handleColorChange = (color, checked) => {
    if (checked) {
      if (!editingColors.includes(color)) {
        setEditingColors([...editingColors, color]);
      }
    } else {
      setEditingColors(editingColors.filter((c) => c !== color));
      setEditingVariants(editingVariants.filter((v) => v.color !== color));
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
    setProduct({ ...product, price: formatPrice(rawValue) });
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-center">Sản phẩm không tồn tại</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">CHỈNH SỬA SẢN PHẨM</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={product.model}
                onChange={(e) => setProduct({ ...product, model: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
              <input
                type="text"
                value={product.price}
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
                value={product.description || ''}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
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
              {product.imageUrl && (
                <img
                  src={`http://localhost:8080${product.imageUrl}`}
                  alt={product.name}
                  className="w-16 h-16 object-cover mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={product.category || ''}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
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
                value={product.gender}
                onChange={(e) => setProduct({ ...product, gender: e.target.value })}
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
                {editingSizes.map((size, index) => (
                  <div key={size} className="flex flex-col gap-2 bg-gray-200 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span>Size {size}</span>
                      <button
                        onClick={() => {
                          setEditingSizes(editingSizes.filter((_, i) => i !== index));
                          setEditingVariants(editingVariants.filter((v) => v.size !== size));
                        }}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingColors.map((color) => {
                        const variant = editingVariants.find((v) => v.size === size && v.color === color);
                        return (
                          <div key={`${size}-${color}`} className="flex items-center gap-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={!!variant}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const quantity = prompt(`Nhập số lượng cho size ${size} - màu ${color}:`);
                                    const quantityNum = parseInt(quantity, 10);
                                    if (quantity !== null && !isNaN(quantityNum) && quantityNum >= 0) {
                                      setEditingVariants(prevVariants => {
                                        const index = prevVariants.findIndex(v => v.size === size && v.color === color);
                                        if (index !== -1) {
                                          const updated = [...prevVariants];
                                          updated[index] = { size, color, quantity: quantityNum };
                                          return updated;
                                        }
                                        return [...prevVariants, { size, color, quantity: quantityNum }];
                                      });
                                    }
                                  } else {
                                    setEditingVariants(editingVariants.filter((v) => !(v.size === size && v.color === color)));
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
                                  const newQuantity = parseInt(e.target.value, 10) || 0;
                                  setEditingVariants(
                                    editingVariants.map((v) =>
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
                    if (size && !editingSizes.includes(size)) {
                      setEditingSizes([...editingSizes, size]);
                    }
                  }}
                  className="px-2 py-1 border rounded"
                >
                  <option value="">Chọn kích thước</option>
                  {Array.from({ length: 45 - 37 + 1 }, (_, i) => 37 + i)
                    .filter((size) => !editingSizes.includes(size.toString()))
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
                      checked={editingColors.includes(color)}
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
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="w-full mt-2 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct;