import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const menuItems = [
  { label: "TRANG CHỦ", href: "/", submenu: [] },
  {
    label: "NAM",
    href: "/products/category/All?gender=nam",
    submenu: [
      { label: "NỔI BẬT", href: "/products/category/All?gender=nam" },
      { label: "Hàng Mới Về", href: "/products/category/All?gender=nam&sort=new" },
      { label: "Hàng Bán Chạy", href: "/products/category/All?gender=nam&sort=best-seller" },
      { label: "GIÀY THỂ THAO NAM", href: "/products/category/Giay The Thao Sneaker?gender=nam", isMain: true },
      { label: "Hàng Mới Về", href: "/products/category/Giay The Thao Sneaker?gender=nam&sort=new" },
      { label: "Giày Bóng Rổ", href: "/products/category/Giay Bong Ro?gender=nam" },
      { label: "Giày Chạy Bộ", href: "/products/category/Giay Chay Bo?gender=nam" },
      { label: "Giày Pickleball", href: "/products/category/Giay Pickleball?gender=nam" },
    ],
  },
  {
    label: "NỮ",
    href: "/products/category/All?gender=nu",
    submenu: [
      { label: "NỔI BẬT", href: "/products/category/All?gender=nu" },
      { label: "Hàng Mới Về", href: "/products/category/All?gender=nu&sort=new" },
      { label: "Hàng Bán Chạy", href: "/products/category/All?gender=nu&sort=best-seller" },
      { label: "GIÀY THỂ THAO NỮ", href: "/products/category/Giay The Thao Sneaker?gender=nu", isMain: true },
      { label: "Hàng Mới Về", href: "/products/category/Giay The Thao Sneaker?gender=nu&sort=new" },
      { label: "Giày Bóng Rổ", href: "/products/category/Giay Bong Ro?gender=nu" },
      { label: "Giày Chạy Bộ", href: "/products/category/Giay Chay Bo?gender=nu" },
    ],
  },
  {
    label: "TRẺ EM",
    href: "/products/category/All?gender=tre_em",
    submenu: [
      { label: "NỔI BẬT", href: "/products/category/All?gender=tre_em" },
      { label: "Hàng Mới Về", href: "/products/category/All?gender=tre_em&sort=new" },
      { label: "Hàng Bán Chạy", href: "/products/category/All?gender=tre_em&sort=best-seller" },
      { label: "GIÀY THỂ THAO TRẺ EM", href: "/products/category/Giay The Thao Sneaker?gender=tre_em", isMain: true },
      { label: "Hàng Mới Về", href: "/products/category/Giay The Thao Sneaker?gender=tre_em&sort=new" },
      { label: "Giày Bóng Rổ", href: "/products/category/Giay Bong Ro?gender=tre_em" },
      { label: "Giày Chạy Bộ", href: "/products/category/Giay Chay Bo?gender=tre_em" },
    ],
  },
  {
    label: "THỂ THAO",
    href: "/products/category/All",
    submenu: [
      { label: "Bóng Rổ", href: "/products/category/Giay Bong Ro", isMain: true },
      { label: "Giày Bóng Rổ", href: "/products/category/Giay Bong Ro" },
      { label: "Giày Bóng Rổ Indoor", href: "/products/category/Giay Bong Ro" },
      { label: "Giày Bóng Rổ Outdoor", href: "/products/category/Giay Bong Ro" },
      { label: "Chạy Bộ", href: "/products/category/Giay Chay Bo", isMain: true },
      { label: "Giày Chạy Bộ", href: "/products/category/Giay Chay Bo" },
      { label: "Tập Luyện", href: "/products/category/Giay Pickleball", isMain: true },
      { label: "Giày Pickleball", href: "/products/category/Giay Pickleball" },
      { label: "Giày Tập Luyện", href: "/products/category/Giay Pickleball" },
    ],
  },
  { label: "HỆ THỐNG CỬA HÀNG", href: "/pages/he-thong-cua-hang", submenu: [] },
  { label: "BLOG", href: "/blogs/news", submenu: [] },
  { label: "GIỚI THIỆU", href: "/pages/about-us", submenu: [] },
];

const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { isAuthenticated, logout, user, switchRole, loading } = useContext(AuthContext);
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const suggestionListRef = useRef(null);

  const API_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  }, [location.pathname]);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoadingProducts(true);
        setApiError(null);
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const data = await response.json();
        console.log("Dữ liệu từ API (initial):", data); // Debug cấu trúc dữ liệu
        // Xử lý nếu data là Page object (có content)
        const productList = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
        const formattedProducts = productList.map((product) => ({
          title: product.name || "Sản phẩm không tên",
          description: product.description || "Không có mô tả",
          href: `/products/category/${product.category || "All"}?gender=${product.gender || "all"}`,
        }));
        setProducts(formattedProducts);
        setSuggestions(formattedProducts);
      } catch (error) {
        console.error("Error fetching initial products:", error.message);
        setApiError("Không thể tải danh sách sản phẩm ban đầu.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchInitialProducts();
  }, []);

  const handleFilterSuggestions = (query) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    if (query.trim() === "") {
      setSuggestions(products);
    } else {
      fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query.trim())}`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          console.log("Dữ liệu tìm kiếm:", data);
          const productList = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
          const formattedSuggestions = productList
  .map((item) => {
    const product = item.product; // ← LẤY ĐÚNG DỮ LIỆU Ở ĐÂY
    return {
      title: product?.name || "Sản phẩm không tên",
      description: product?.description || "Không có mô tả",
      href: `/products/category/${product?.category || "All"}?gender=${product?.gender || "all"}`
    };
  })
  .slice(0, 5);

          setSuggestions(formattedSuggestions);
          console.log("Gợi ý sẽ hiển thị:", formattedSuggestions); // ← THÊM NÀY
        })
        .catch((error) => {
          console.error("Error searching products:", error.message);
          setApiError("Lỗi khi tìm kiếm sản phẩm.");
        });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSearch || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      const selectedElement = suggestionListRef.current.children[newIndex];
      if (selectedElement) selectedElement.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
      setSelectedIndex(newIndex);
      const selectedElement = suggestionListRef.current.children[newIndex];
      if (selectedElement) selectedElement.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selectedSuggestion = suggestions[selectedIndex];
        navigate(selectedSuggestion.href);
        setShowSearch(false);
        setSearchQuery("");
        setSelectedIndex(-1);
      } else if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setShowSearch(false);
        setSearchQuery("");
        setSelectedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowSearch(false);
      setSearchQuery("");
      setSelectedIndex(-1);
    }
  };

  const totalItems = cartItems?.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const totalPrice = cartItems?.reduce(
    (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0),
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (href) => {
    navigate(href);
    setShowSearch(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  };

  const handleLogout = () => {
    logout();
    clearCart();
    setShowUserMenu(false);
    navigate("/");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      setShowCart(false);
      return;
    }
    if (isAuthenticated) {
      navigate("/cart");
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
    setShowCart(false);
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate("/cart");
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
  };

  const handleRemoveItem = (productId, size, color) => {
    removeFromCart(productId, size, color);
  };

  if (loading || loadingProducts) return <div>Loading...</div>;

  return (
    <header className="relative bg-white shadow-md">
      <div className="bg-red-600 text-white text-center py-2 flex justify-between items-center px-4">
        <span>FREESHIP VỚI ĐƠN HÀNG TỪ 499K</span>
        <button className="text-white hover:text-gray-200">×</button>
      </div>
      <div className="container mx-auto flex items-center justify-between py-4">
        <div id="logo">
          <Link to="/" className="logo-wrapper">
            <img
              className="max-w-full h-auto w-[50px] h-[50px]"
              src="//theme.hstatic.net/200000940675/1001304908/14/logo.png?v=187"
              alt="logo PEAK Sport"
              width="50"
              height="50"
            />
          </Link>
        </div>
        <div className="hidden lg:flex items-center">
          <div className="navigation-wrapper">
            <nav>
              <ul className="flex list-none space-x-6">
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    className="list-none relative"
                    onMouseEnter={() => setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <Link to={item.href} className="text-gray-700 hover:text-red-600 flex items-center">
                      <span>{item.label}</span>
                      {item.submenu.length > 0 && (
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </Link>
                    {activeMenu === item.label && item.submenu.length > 0 && (
                      <div className="absolute bg-white shadow-lg z-10 w-[800px] mt-2">
                        <div className="hidden lg:block">
                          <ul className="container mx-auto flex p-4">
                            {item.submenu.reduce((cols, sub, subIndex) => {
                              if (sub.isMain) cols.push([]);
                              cols[cols.length - 1].push(sub);
                              return cols;
                            }, [[]]).map((col, colIndex) => (
                              <li key={colIndex} className="flex-1">
                                {col.map((sub, subIndex) => (
                                  <span
                                    key={subIndex}
                                    className={`block py-2 px-3 mb-2 ${
                                      sub.isMain
                                        ? "font-bold text-black text-lg"
                                        : "text-gray-600 hover:text-red-600 hover:bg-gray-100 text-base"
                                    }`}
                                  >
                                    <Link to={sub.href}>{sub.label}</Link>
                                  </span>
                                ))}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex ml-4">
            <button className="text-gray-500 cursor-not-allowed">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="text-gray-500 ml-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center p-2 text-gray-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white z-50">
                {apiError && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded-t-xl">
                    {apiError}
                  </div>
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleFilterSuggestions(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm sản phẩm (ví dụ: giày, sneakers)..."
                  className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-md transition-all duration-300 placeholder-gray-500 text-base"
                  ref={inputRef}
                  autoFocus
                />
                {searchQuery.trim() && (
                  <ul
                    className="max-h-60 overflow-y-auto bg-white shadow-lg rounded-b-xl"
                    ref={suggestionListRef}
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.href)}
                          className={`flex items-center p-3 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                            index === selectedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {suggestion.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {suggestion.description}
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-gray-500 text-center">
                        Không tìm thấy kết quả
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div
            className="relative group"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <button className="flex items-center p-2 text-gray-700 hover:text-red-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg transition-opacity duration-200 z-50 before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2 before:bg-transparent">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-4 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-4 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-4 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Tài khoản
                    </Link>
                    {console.log("User role:", user?.role)} {/* Log để debug */}
                    {user?.role?.toLowerCase() === "admin" && (
                      <button
                        onClick={() => navigate("/admin/products")}
                        className="block w-full text-left px-4 py-4 text-gray-700 hover:bg-gray-100"
                      >
                        Chuyển sang Admin
                      </button>
                    )}
                    {user?.role?.toLowerCase() === "user" && null} {/* Không hiển thị cho user */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-4 text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div
            className="relative group"
            onMouseEnter={() => setShowCart(true)}
            onMouseLeave={() => setShowCart(false)}
          >
            <button
              onClick={handleCartClick}
              className="flex items-center p-2 text-gray-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </button>
            {showCart && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white text-black shadow-lg rounded-md p-3 z-50 before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2 before:bg-transparent">
                <h3 className="font-bold mb-2">GIỎ HÀNG</h3>
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        className="border-b py-2 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.product?.name || "Sản phẩm không tên"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Kích thước: {item.size || "Chưa chọn"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Màu sắc: {item.color || "Chưa chọn"}
                          </p>
                          <p className="text-red-600 font-bold">
                            {((item.product?.price || 0) * (item.quantity || 0)).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.product.id, item.size, item.color)
                          }
                          className="ml-2 text-red-600 hover:text-red-800 font-bold text-sm"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-2">
                      <span>Tổng tiền:</span>
                      <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <button
                      className="w-full bg-red-600 text-white py-3 rounded mt-3 hover:bg-red-700 text-base"
                      onClick={handleCheckout}
                    >
                      Thanh toán
                    </button>
                  </>
                ) : (
                  <p className="text-center py-4">Giỏ hàng trống</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;