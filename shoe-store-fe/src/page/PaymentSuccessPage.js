import React from "react";
import { Link, useLocation } from "react-router-dom";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { orderData } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Thanh toán thành công!</h2>
        <p className="text-gray-700 mb-6">
          Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được ghi nhận.
        </p>

        {orderData && (
          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
            <p><strong>Tổng tiền:</strong> {orderData.totalPrice.toLocaleString("vi-VN")}đ</p>
            <p><strong>Phương thức thanh toán:</strong> {orderData.paymentMethod}</p>
            <p><strong>Ghi chú:</strong> {orderData.orderNote || "Không có ghi chú"}</p>
            <h4 className="font-semibold mt-4">Sản phẩm:</h4>
            <ul className="list-disc list-inside">
              {orderData.items.map((item, index) => (
                <li key={index}>
                  {item.name} - Kích thước: {item.size}, Màu sắc: {item.color}, Số lượng: {item.quantity}, Giá: {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;