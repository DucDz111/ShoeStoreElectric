import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
};

const CollectionPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  const query = new URLSearchParams(location.search);
  const gender = query.get('gender') || '';
  const sortType = query.get('sort') || '';

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState(sortType || 'default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Chưa chọn');
  const [selectedColor, setSelectedColor] = useState('Chưa chọn');
  const [filteredColorsForSize, setFilteredColorsForSize] = useState([]);


  const adultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const kidSizes = ['33', '34', '35', '36', '37', '38', '39', '40'];

  const priceRanges = [
    { label: 'Giá dưới 500,000₫', value: 'under-500k', min: 0, max: 500000 },
    { label: '500,000₫ - 1,000,000₫', value: '500k-1m', min: 500000, max: 1000000 },
    { label: '1,000,000₫ - 2,000,000₫', value: '1m-2m', min: 1000000, max: 2000000 },
    { label: 'Giá trên 3,000,000₫', value: 'above-3m', min: 3000000, max: Infinity },
  ];
  const availableCategories = [
    { label: 'Bóng Rổ / Basketball', value: 'Giay Bong Ro' },
    { label: 'Sneaker Casual', value: 'Giay The Thao Sneaker' },
    { label: 'Chạy Bộ / Running', value: 'Giay Chay Bo' },
    { label: 'Training', value: 'Giay Pickleball' },
  ];

  const categoryDisplayMap = {
    'Giay Bong Ro': 'Giày Bóng Rổ',
    'Giay Chay Bo': 'Giày Chạy Bộ',
    'Giay The Thao Sneaker': 'Giày Thể Thao Sneaker',
    'Giay Pickleball': 'Giày Pickleball',
    'All': 'Tất cả sản phẩm',
  };
  const genderDisplayMap = { 'nam': 'Nam', 'nu': 'Nữ', 'tre_em': 'Trẻ Em' };

  const categoryMap = {
    'giay-bong-ro': 'Giay Bong Ro',
    'giay-chay-bo': 'Giay Chay Bo',
    'giay-the-thao-sneaker': 'Giay The Thao Sneaker',
    'giay-pickleball': 'Giay Pickleball',
    'all': 'All',
  };

  const formattedCategory = categoryMap[category?.toLowerCase()] || category || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`http://localhost:8080/api/products/category/${encodeURIComponent(formattedCategory)}`);
        if (gender) url.searchParams.append('gender', gender);
        url.searchParams.append('page', page - 1); // API dùng page bắt đầu từ 0
        url.searchParams.append('size', limit);
        if (['new', 'best-seller'].includes(sortType)) url.searchParams.append('sort', sortType);

        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) {
            setProducts([]);
            setTotal(0);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          const formattedProducts = data.content.map(item => {
            const productData = item.product || item;
            const productGender = productData.gender?.toLowerCase();
            const allowedSizes = productGender === 'tre_em' ? kidSizes : adultSizes;

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
          setProducts(formattedProducts);
          setTotal(data.totalElements); // Lấy tổng số sản phẩm từ response
        }
      } catch (err) {
        setError(err.message);
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [formattedCategory, gender, sortType, page, limit]);

  useEffect(() => {
    if (!selectedProduct || selectedSize === 'Chưa chọn') {
      setFilteredColorsForSize([]);
      return;
    }
  
    const matchingColors = selectedProduct.variants
      .filter(v => v.size === selectedSize && v.quantity > 0)
      .map(v => v.color);
  
    const uniqueColors = [...new Set(matchingColors)];
    setFilteredColorsForSize(uniqueColors);
  }, [selectedSize, selectedProduct]);
  

  useEffect(() => {
    let filtered = [...products];
    if (selectedSizes.length > 0) filtered = filtered.filter(product => product.sizes.some(size => selectedSizes.includes(size)));
    if (selectedPriceRanges.length > 0) filtered = filtered.filter(product => selectedPriceRanges.some(range => {
      const { min, max } = priceRanges.find(r => r.value === range);
      return product.price >= min && (max === Infinity || product.price <= max);
    }));
    if (selectedCategories.length > 0) filtered = filtered.filter(product => selectedCategories.includes(product.category));
    switch (sortOption) {
      case 'alpha-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'alpha-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    }
    setFilteredProducts(filtered);
  }, [products, selectedSizes, selectedPriceRanges, selectedCategories, sortOption]);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    if (['new', 'best-seller'].includes(value)) {
      const params = new URLSearchParams(location.search);
      params.set('sort', value);
      navigate(`${location.pathname}?${params.toString()}`);
    } else {
      const params = new URLSearchParams(location.search);
      params.delete('sort');
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const handleSizeFilter = (size) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  const handlePriceFilter = (range) => setSelectedPriceRanges(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]);
  const handleCategoryFilter = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

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
        imageUrl: getImageUrl(selectedProduct.imageUrl),
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

  const totalPages = Math.ceil(total / limit);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4 border-b pb-3">
            <h1 className="text-3xl font-bold">
              {categoryDisplayMap[formattedCategory] || (gender ? `Tất cả sản phẩm ${genderDisplayMap[gender] || gender}` : 'Tất cả sản phẩm')}
            </h1>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <label className="mr-2 font-medium">Sắp xếp:</label>
              <select value={sortOption} onChange={handleSortChange} className="border rounded px-3 py-1 focus:outline-none">
                <option value="default">Mặc định</option>
                <option value="alpha-asc">Tên A → Z</option>
                <option value="alpha-desc">Tên Z → A</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="new">Hàng mới</option>
                <option value="best-seller">Bán chạy</option>
              </select>
            </div>
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center px-3 py-1 bg-gray-200 rounded">
              <i className="fas fa-filter mr-2"></i>
              <span>Lọc</span>
            </button>
          </div>
          <div className="flex flex-wrap -mx-4">
            <aside className={`lg:w-1/4 w-full px-4 mb-4 lg:mb-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 lg:hidden">
                  <h2 className="font-bold">Tìm theo</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                </div>
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Kích thước (Size)</h3>
                  <div className="max-h-48 overflow-y-auto">
                    {[...new Set(products.flatMap(product => product.sizes))].sort((a, b) => Number(a) - Number(b)).map(size => (
                      <div key={size} className="flex items-center mb-2">
                        <input type="checkbox" id={`size-${size}`} checked={selectedSizes.includes(size)} onChange={() => handleSizeFilter(size)} className="mr-2" />
                        <label htmlFor={`size-${size}`}>{size}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Mức giá</h3>
                  {priceRanges.map(range => (
                    <div key={range.value} className="flex items-center mb-2">
                      <input type="checkbox" id={`price-${range.value}`} checked={selectedPriceRanges.includes(range.value)} onChange={() => handlePriceFilter(range.value)} className="mr-2" />
                      <label htmlFor={`price-${range.value}`}>{range.label}</label>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Dòng Sản Phẩm</h3>
                  {availableCategories.map(cat => (
                    <div key={cat.value} className="flex items-center mb-2">
                      <input type="checkbox" id={`category-${cat.value}`} checked={selectedCategories.includes(cat.value)} onChange={() => handleCategoryFilter(cat.value)} className="mr-2" />
                      <label htmlFor={`category-${cat.value}`}>{cat.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
            <div className="lg:w-3/4 w-full px-4">
              {loading && <p className="text-center py-4 text-gray-700">Đang tải...</p>}
              {error && <p className="text-center py-4 text-red-600">{error}</p>}
              {!loading && !error && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="relative">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative aspect-square">
                          <Link to={`/products/${product.id}`}>
                            {product.imageUrl && (
                              <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                            )}
                            {product.colors.length > 0 && (
                              <img src={getImageUrl(product.imageUrl)} alt={`${product.name} secondary`} className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-200" />
                            )}
                          </Link>
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            <Link to={`/products/${product.id}`} className="bg-white rounded-full p-2 shadow hover:bg-gray-100">
                              <i className="fas fa-shopping-cart"></i>
                            </Link>
                            <Link to={`/products/${product.id}`} className="bg-white rounded-full p-2 shadow hover:bg-gray-100">
                              <i className="fas fa-eye"></i>
                            </Link>
                          </div>
                        </div>
                        <div className="p-4">
                          <Link to={`/products/${product.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-red-600 font-bold">{Number(product.price).toLocaleString('vi-VN')}₫</p>
                          </Link>
                          <div className="flex gap-2 mt-2">
                            {product.colors.map((color, idx) => (
                              <div key={`${color}-${idx}`} className="w-6 h-6 rounded-full border" style={{ background: colorToBackground(color) }} title={color} />
                            ))}
                          </div>
                          <button
                            onClick={() => openModal(product)}
                            className="mt-2 w-full py-2 rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            Thêm vào giỏ hàng
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loading && !error && <p className="text-center py-4 text-gray-600">Không có sản phẩm nào trong danh mục này.</p>}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50">
                    Trước
                  </button>
                  <span className="px-2 mx-1 py-2">{`Trang ${page} / ${totalPages}`}</span>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50">
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
    <option disabled>Không có màu phù hợp</option>
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
    </section>
  );
};

// Hàm chuyển màu thành background color (tạm thời)
const colorToBackground = (color) => {
  const colorMap = {
    'Vàng': '#FFD700',
    'Đỏ': '#FF0000',
    'Trắng': '#FFFFFF',
    'Đen': '#000000',
    'Xanh': '#008000',
    'Hồng': '#FF69B4',
  };
  return colorMap[color] || '#CCCCCC'; // Mặc định là màu xám nếu không tìm thấy
};

export default CollectionPage;