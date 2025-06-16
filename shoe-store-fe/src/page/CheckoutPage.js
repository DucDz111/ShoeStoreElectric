import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated, token, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { orderNote = "", cartItems: itemsFromCart = [], totalPrice = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    paymentMethod: "COD",
  });
  const [addressOption, setAddressOption] = useState("default"); // "default" hoặc "custom"
  const [customAddress, setCustomAddress] = useState(""); // Địa chỉ tùy chỉnh
  const [formErrors, setFormErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Chờ quá trình xác thực token từ AuthContext hoàn tất
    if (loading) {
      return; // Không làm gì khi đang tải
    }

    const checkAuth = async () => {
      try {
        if (isAuthenticated === null || !token) {
          throw new Error('No token or authentication status unavailable');
        }

        if (!isAuthenticated) {
          toast.warn("Vui lòng đăng nhập để tiếp tục thanh toán!", { position: "top-right" });
          navigate("/login", { state: { from: "/checkout" } });
          return;
        }

        if (cartItems.length === 0 && itemsFromCart.length === 0) {
          toast.error("Giỏ hàng của bạn đang trống!", { position: "top-right" });
          navigate("/cart");
          return;
        }

        // Cập nhật formData với thông tin user từ AuthContext
        setFormData({
          fullName: user?.fullName || "",
          phone: user?.phone || "",
          email: user?.email || "",
          address: user?.address || "",
          paymentMethod: "COD",
        });

        setPageLoading(false);
      } catch (err) {
        console.error('Checkout auth check error:', err.message);
        setPageLoading(false);
        if (err.message === 'No token or authentication status unavailable') {
          navigate("/login");
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, token, user, loading, cartItems, itemsFromCart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressOptionChange = (option) => {
    setAddressOption(option);
    if (option === "default") {
      setFormData((prev) => ({ ...prev, address: user?.address || "" }));
      setCustomAddress("");
    } else {
      setFormData((prev) => ({ ...prev, address: customAddress }));
    }
  };

  const handleCustomAddressChange = (e) => {
    const value = e.target.value;
    setCustomAddress(value);
    setFormData((prev) => ({ ...prev, address: value }));
    setFormErrors((prev) => ({ ...prev, address: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Họ tên không được để trống";
    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }
    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!formData.address.trim()) errors.address = "Địa chỉ không được để trống";
    if (!formData.paymentMethod) errors.paymentMethod = "Vui lòng chọn phương thức thanh toán";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmCheckout = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin!", { position: "top-right" });
      return;
    }

    if (!token || token.trim() === "") {
      console.error("CheckoutPage: Token is invalid or empty:", token);
      toast.error("Token không hợp lệ. Vui lòng đăng nhập lại!", { position: "top-right" });
      navigate("/login");
      return;
    }

    const orderData = {
      cartItems: cartItems.map((item) => ({
        id: String(item.id || Date.now() + Math.random()),
        productId: item.product.id,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      discountCodeId: null,
      orderNote: orderNote,
      paymentMethod: formData.paymentMethod,
      shippingAddress: formData.address, // Thêm địa chỉ giao hàng vào orderData
    };

    console.log("CheckoutPage: Sending order data:", orderData);
    console.log("CheckoutPage: Sending with token:", token);

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log("CheckoutPage: Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        try {
          const errorJson = await response.json();
          console.error("CheckoutPage: Error response:", errorJson);
          errorMessage = errorJson.message || errorMessage;

          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 6000,
          });

        } catch (jsonError) {
          const fallbackText = await response.text();
          console.error("CheckoutPage: Fallback error text:", fallbackText);
          errorMessage = fallbackText || errorMessage;

          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 6000,
          });
        }

        return; // ⛔ Không tiếp tục submit nếu có lỗi
      }


      const responseData = await response.json();
      console.log("CheckoutPage: Response data:", responseData);

      const successData = {
        items: cartItems.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        totalPrice: totalPrice,
        paymentMethod: formData.paymentMethod,
        orderNote: orderNote,
        shippingAddress: formData.address, // Thêm địa chỉ giao hàng vào successData
      };

      clearCart();
      toast.success("Thanh toán thành công! Cảm ơn bạn đã mua sắm.", { position: "top-right" });
      navigate("/payment-success", { state: { orderData: successData } });
    } catch (error) {
      console.error("CheckoutPage: Checkout error:", error.message);
      toast.error(`Có lỗi xảy ra khi thanh toán: ${error.message}. Vui lòng thử lại!`, { position: "top-right" });
    }
  };

  const displayItems = cartItems.length > 0 ? cartItems : itemsFromCart;

  if (loading || pageLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center mb-4 text-gray-600">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link to="/cart" className="hover:underline">Giỏ hàng</Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-600">Thanh toán</span>
        </div>

        <h2 className="text-2xl font-bold mb-4">THANH TOÁN</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Thông tin giao hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    formErrors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ tên..."
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    formErrors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập số điện thoại..."
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập email..."
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</label>
                <div className="flex items-center space-x-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="addressOption"
                      value="default"
                      checked={addressOption === "default"}
                      onChange={() => handleAddressOptionChange("default")}
                      className="mr-2"
                    />
                    <span>Sử dụng địa chỉ mặc định</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="addressOption"
                      value="custom"
                      checked={addressOption === "custom"}
                      onChange={() => handleAddressOptionChange("custom")}
                      className="mr-2"
                    />
                    <span>Địa chỉ khác</span>
                  </label>
                </div>

                {addressOption === "default" ? (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-gray-700">{formData.address || "Chưa có địa chỉ mặc định"}</p>
                  </div>
                ) : (
                  <textarea
                    name="address"
                    value={customAddress}
                    onChange={handleCustomAddressChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập địa chỉ giao hàng..."
                    rows="3"
                  />
                )}
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    formErrors.paymentMethod ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="MoMo">MoMo</option>
                  <option value="ZaloPay">ZaloPay</option>
                </select>
                {formErrors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.paymentMethod}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng</label>
                <textarea
                  value={orderNote}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-4">
              {displayItems.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center">
                    <img
                      src={`http://localhost:8080${item.product.imageUrl}`}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover mr-3"
                      onError={(e) => (e.target.src = "https://placehold.co/48x48")}
                    />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Kích thước: {item.size}</p>
                      <p className="text-sm text-gray-600">Màu sắc: {item.color}</p>
                      <p className="text-sm">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">
                    {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-4">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              <button
                onClick={handleConfirmCheckout}
                className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 mt-4"
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default CheckoutPage;