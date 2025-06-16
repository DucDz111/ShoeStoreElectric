import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, addToCart, replaceItem, clearCartInDatabase, loadCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orderNote, setOrderNote] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});

  const totalPrice = cartItems?.reduce(
    (sum, item) => sum + (item?.product?.price * item?.quantity || 0),
    0
  );

  useEffect(() => {
    const sizes = {};
    const colors = {};
    cartItems.forEach((item) => {
      const key = `${item.product.id}-${item.size}-${item.color || "Chưa chọn"}`;
      sizes[key] = item.size;
      colors[key] = item.color || "Chưa chọn";
    });
    setSelectedSizes(sizes);
    setSelectedColors(colors);
  }, [cartItems]);

  const handleQuantityChange = (productId, size, color, delta) => {
    const item = cartItems.find(
      (i) => i.product.id === productId && i.size === size && i.color === color
    );
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity < 1) return;
      updateQuantity(productId, size, color, newQuantity);
    }
  };

  const handleSizeChange = async (productId, oldSize, color, newSize) => {
    if (newSize === "Chưa chọn") {
      toast.error("Vui lòng chọn kích thước hợp lệ!");
      return;
    }
    const item = cartItems.find(
      (i) => i.product.id === productId && i.size === oldSize && i.color === color
    );
    if (item && item.product.sizes.includes(newSize)) {
      await replaceItem(item, { ...item, size: newSize });
      const key = `${productId}-${oldSize}-${color}`;
      const newKey = `${productId}-${newSize}-${color}`;
      setSelectedSizes((prev) => ({ ...prev, [newKey]: newSize, [key]: undefined }));
    } else {
      toast.error("Kích thước không hợp lệ cho sản phẩm này!");
    }
  };

  const handleColorChange = async (productId, size, oldColor, newColor) => {
    if (newColor === "Chưa chọn") {
      toast.error("Vui lòng chọn màu sắc hợp lệ!");
      return;
    }
    const item = cartItems.find(
      (i) => i.product.id === productId && i.size === size && i.color === oldColor
    );
    if (item && item.product.colors.includes(newColor)) {
      await replaceItem(item, { ...item, color: newColor });
      const key = `${productId}-${size}-${oldColor}`;
      const newKey = `${productId}-${size}-${newColor}`;
      setSelectedColors((prev) => ({ ...prev, [newKey]: newColor, [key]: undefined }));
    } else {
      toast.error("Màu sắc không hợp lệ cho sản phẩm này!");
    }
  };

  const handleRemoveItem = (productId, size, color) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      removeFromCart(productId, size, color);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      if (isAuthenticated) {
        await clearCartInDatabase();
      } else {
        clearCart();
      }
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!isAuthenticated) {
      toast.warn("Vui lòng đăng nhập để tiếp tục thanh toán!");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    const invalidItems = cartItems.filter(
      (item) => item.size === "Chưa chọn" || item.color === "Chưa chọn"
    );
    if (invalidItems.length > 0) {
      toast.error("Vui lòng chọn kích thước và màu sắc cho tất cả sản phẩm!");
      return;
    }
    navigate("/checkout", { state: { orderNote, cartItems, totalPrice } });
  };

  const handleShopNow = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center mb-4">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-600">Thanh toán</span>
        </div>

        <h2 className="text-2xl font-bold mb-4">GIỎ HÀNG</h2>

        {cartItems.length > 0 ? (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm">
                Chúc mừng! Đơn hàng của bạn đã đủ điều kiện được <strong>Freeship 🎉</strong>
              </p>
              <span className="text-sm">100%</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-2 rounded text-sm text-gray-800">
            Freeship với đơn hàng trên 999.000đ. Mua sắm ngay nhé!!!
          </div>
        )}

        <div className="bg-white p-4 rounded shadow mb-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">"Hỏng" rồi, giỏ hàng trống hết</p>
              <p className="text-gray-600 mt-2">Về trang chủ để chọn mua sản phẩm bạn nhé!</p>
              <button
                onClick={handleShopNow}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleClearCart}
                className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Xóa toàn bộ giỏ hàng
              </button>
              {cartItems.map((item, index) => {
                const key = `${item.product.id}-${item.size}-${item.color || "Chưa chọn"}-${index}`;
                const product = item.product || {};
                const sizes = (product.sizes || []).map(s => typeof s === 'object' ? s.size : s);
                const colors = (product.colors || []).map(c => typeof c === 'object' ? c.color || c.name || c : c);
                console.log("product.sizes:", sizes);
                console.log("product.colors:", colors);

                return (
                  <div key={key} className="flex justify-between items-start border-b py-4">
                    <div className="flex items-start">
                      <img
                        src={`http://localhost:8080${product.imageUrl || ""}`}
                        alt={product.name || "Product Image"}
                        className="w-20 h-20 object-cover mr-4"
                        onError={(e) => (e.target.src = "https://placehold.co/80x80")}
                      />
                      <div>
                        <div className="font-medium">{product.name || "Unnamed Product"}</div>
                        <label className="block mt-2 text-sm">Kích thước:</label>
                        <select
                          value={selectedSizes[key] || item.size || "Chưa chọn"}
                          onChange={(e) =>
                            handleSizeChange(product.id, item.size, item.color, e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="Chưa chọn">Chưa chọn</option>
                          {sizes.map((size, idx) => (
                            <option key={size + idx} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <label className="block mt-2 text-sm">Màu sắc:</label>
                        <select
                          value={selectedColors[key] || item.color || "Chưa chọn"}
                          onChange={(e) =>
                            handleColorChange(product.id, item.size, item.color, e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="Chưa chọn">Chưa chọn</option>
                          {colors.map((color, idx) => (
                            <option key={color + idx} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-red-600">
                        {(product.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.id, item.size, item.color, -1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-2"
                        >
                          -
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.id, item.size, item.color, 1)
                          }
                          className="px-2"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.size, item.color)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-700">TỔNG CỘNG</div>
              <div className="text-2xl font-bold text-red-600">
                {totalPrice.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700"
            >
              Thanh toán
            </button>
            <div className="mt-6">
              <h3 className="font-medium mb-2">GHI CHÚ ĐƠN HÀNG</h3>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Ghi chú đơn hàng..."
                className="w-full border rounded p-2"
                rows="4"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;