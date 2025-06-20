import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductList = () => {
  const [basketballShoes, setBasketballShoes] = useState([]);
  const [runningShoes, setRunningShoes] = useState([]);
  const [sneakerShoes, setSneakerShoes] = useState([]);
  const [pickleballShoes, setPickleballShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Chưa chọn');
  const [selectedColor, setSelectedColor] = useState('Chưa chọn');
  const [page, setPage] = useState(1);
  const [limit] = useState(8); // Giới hạn 8 sản phẩm mỗi trang cho từng danh mục
  const [totalBasketball, setTotalBasketball] = useState(0);
  const [totalRunning, setTotalRunning] = useState(0);
  const [totalSneaker, setTotalSneaker] = useState(0);
  const [totalPickleball, setTotalPickleball] = useState(0);
  const [filteredColorsForSize, setFilteredColorsForSize] = useState([]);
  const [pageBasketball, setPageBasketball] = useState(1);
  const [pageRunning, setPageRunning] = useState(1);
  const [pageSneaker, setPageSneaker] = useState(1);
  const [pagePickleball, setPagePickleball] = useState(1);



  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();

  const adultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const kidSizes = ['33', '34', '35', '36', '37', '38', '39', '40'];

  const fetchProductsByCategory = async (category, setState, setTotal, pageToFetch = 1) => {
    try {
      const url = new URL(`http://localhost:8080/api/products/category/${encodeURIComponent(category)}`);
      url.searchParams.append('page', pageToFetch - 1); // API dùng page bắt đầu từ 0
      url.searchParams.append('size', limit);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Không thể lấy sản phẩm cho danh mục ${category}.`);
      }
      const data = await response.json();
      const formattedData = data.content.map(item => {
        const productData = item.product || item;
        const gender = productData.gender?.toLowerCase();
        const allowedSizes = gender === 'tre_em' ? kidSizes : adultSizes;

        const sizesFromVariants = [...new Set((item.variants || []).map(v => v.size?.size))];
        const filteredSizes = sizesFromVariants.filter(size => size && allowedSizes.includes(size));

        const colorsFromVariants = [...new Set((item.variants || []).map(v => v.color?.color))];
        const filteredColors = colorsFromVariants.filter(color => color);

        return {
          ...productData,
          sizes: filteredSizes.sort((a, b) => Number(a) - Number(b)),
          colors: filteredColors,
          variants: (item.variants || []).map(v => ({
            size: v.size?.size || 'M',
            color: v.color?.color || 'White',
            quantity: v.quantity || 0,
          })),
        };
      });
      setState(formattedData);
      setTotal(data.totalElements); // Cập nhật tổng số sản phẩm
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProductsByCategory('Giày Bóng Rổ', setBasketballShoes, setTotalBasketball),
          fetchProductsByCategory('Giày Chạy Bộ', setRunningShoes, setTotalRunning),
          fetchProductsByCategory('Giày Thể Thao Sneaker', setSneakerShoes, setTotalSneaker),
          fetchProductsByCategory('Giày Pickleball', setPickleballShoes, setTotalPickleball),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCategories();
  }, [page, limit]);

  useEffect(() => {
    if (!selectedProduct || selectedSize === 'Chưa chọn') {
      setFilteredColorsForSize([]);
      return;
    }
  
    const matchingColors = selectedProduct.variants
      .filter((v) => v.size === selectedSize && v.quantity > 0)
      .map((v) => v.color);
  
    const uniqueColors = [...new Set(matchingColors)];
    setFilteredColorsForSize(uniqueColors);
  }, [selectedSize, selectedProduct]);
  useEffect(() => {
    fetchProductsByCategory('Giày Bóng Rổ', setBasketballShoes, setTotalBasketball, pageBasketball);
  }, [pageBasketball]);
  
  useEffect(() => {
    fetchProductsByCategory('Giày Chạy Bộ', setRunningShoes, setTotalRunning, pageRunning);
  }, [pageRunning]);
  
  useEffect(() => {
    fetchProductsByCategory('Giày Thể Thao Sneaker', setSneakerShoes, setTotalSneaker, pageSneaker);
  }, [pageSneaker]);
  
  useEffect(() => {
    fetchProductsByCategory('Giày Pickleball', setPickleballShoes, setTotalPickleball, pagePickleball);
  }, [pagePickleball]);
  

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`, { state: { product } });
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize('Chưa chọn');
    setSelectedColor('Chưa chọn');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedSize('Chưa chọn');
    setSelectedColor('Chưa chọn');
  };

  const handleAddToCart = () => {
    if (selectedSize === 'Chưa chọn' || selectedColor === 'Chưa chọn') {
      toast.error('Vui lòng chọn kích thước và màu sắc trước khi thêm vào giỏ hàng!', { position: 'top-right' });
      return;
    }

    const cartItem = {
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        imageUrl: selectedProduct.imageUrl || `https://picsum.photos/300/200?random=${selectedProduct.id}`,
        gender: selectedProduct.gender || 'nam',
        sizes: selectedProduct.sizes,
        colors: selectedProduct.colors,
      },
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };
    console.log('Adding to cart:', cartItem);
    addToCart(cartItem);
    toast.success(`${selectedProduct.name} đã được thêm vào giỏ hàng!`, { position: 'top-right' });
    closeModal();
  };

  const renderProductSection = (title, productList, total, page, setPage) => (
    productList.length > 0 && (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={() => navigate(`/products/category/${title.toLowerCase().replace(/\s+/g, ' ')}`)}
            className="text-blue-600 hover:underline text-lg font-medium"
          >
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productList.map((item) => {
            const product = item.product || item;
            return (
              <div
                key={product.id}
                className="border rounded-lg p-5 bg-white shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 flex flex-col"
              >
                {product.imageUrl && product.imageUrl.trim() !== '' && (
                  <img
                    src={`http://localhost:8080${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3
                  className="font-semibold text-lg text-gray-800 hover:text-blue-600 cursor-pointer mb-2 line-clamp-2"
                  onClick={() => handleProductClick(product)}
                >
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">{product.model}</p>
                <p className="text-red-600 font-bold text-lg mb-4">
                  {product.price.toLocaleString('vi-VN')}₫
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => openModal(product)}
                    className="w-full py-3 rounded-lg transition-all duration-300 ease-in-out font-medium text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* 👇 CHỈNH PHẦN NÀY: dùng page & setPage từ props */}
        {Math.ceil(total / limit) > 1 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-2 mx-1 py-2">{`Trang ${page} / ${Math.ceil(total / limit)}`}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    )
  );
  

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderProductSection('Giày Bóng Rổ', basketballShoes, totalBasketball, pageBasketball, setPageBasketball)}
      {renderProductSection('Giày Chạy Bộ', runningShoes, totalRunning, pageRunning, setPageRunning)}
      {renderProductSection('Giày Thể Thao Sneaker', sneakerShoes, totalSneaker, pageSneaker, setPageSneaker)}
      {renderProductSection('Giày Pickleball', pickleballShoes, totalPickleball, pagePickleball, setPagePickleball)}

      <ToastContainer />

      {isModalOpen && selectedProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chọn Kích thước và Màu sắc</h3>
        <button onClick={closeModal} className="text-red-500 text-xl">×</button>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Kích thước:</label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="Chưa chọn">Chưa chọn</option>
          {selectedProduct.sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Màu sắc:</label>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="Chưa chọn">Chưa chọn</option>
          {filteredColorsForSize.length > 0 ? (
            filteredColorsForSize.map(color => (
              <option key={color} value={color}>{color}</option>
            ))
          ) : (
            <option disabled>Không có màu nào</option>
          )}
        </select>
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Xác nhận thêm vào giỏ hàng
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default ProductList;