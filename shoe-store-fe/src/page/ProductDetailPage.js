import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [productData, setProductData] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [availableColorsForSize, setAvailableColorsForSize] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);

  // Định nghĩa danh sách size dựa trên gender
  const adultSizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"].sort(
    (a, b) => Number(a) - Number(b)
  );
  const kidSizes = ["33", "34", "35", "36", "37", "38", "39", "40"].sort(
    (a, b) => Number(a) - Number(b)
  );
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `http://localhost:8080${imageUrl}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin sản phẩm.");
        }
        const data = await response.json();

        const productGender = data.product?.gender?.toLowerCase();
        const validSizes = productGender === "tre_em" ? kidSizes : adultSizes;

        // Lọc variants còn hàng
        const filteredVariants = data.variants?.filter((v) => v.quantity > 0) || [];

        // Lấy danh sách size và color duy nhất từ variants
        const availableSizes = [...new Set(filteredVariants.map((v) => v.size.size))];
        const availableColors = [...new Set(filteredVariants.map((v) => v.color.color))];

        // Lọc sizes dựa trên variants và gender, dùng size làm key
        const sizeMap = new Map();
        data.sizes?.forEach((sizeObj) => {
          const size = sizeObj.size;
          if (validSizes.includes(size) && availableSizes.includes(size) && !sizeMap.has(size)) {
            sizeMap.set(size, sizeObj);
          }
        });
        const filteredSizes = Array.from(sizeMap.values()).sort((a, b) => Number(a.size) - Number(b.size));

        // Lọc colors dựa trên variants, dùng color làm key
        const colorMap = new Map();
        data.colors?.forEach((colorObj) => {
          const color = colorObj.color;
          if (availableColors.includes(color) && !colorMap.has(color)) {
            colorMap.set(color, colorObj);
          }
        });
        const filteredColors = Array.from(colorMap.values()).sort((a, b) => a.color.localeCompare(b.color));

        console.log("Final Sizes:", filteredSizes);
        console.log("Final Colors:", filteredColors);
        console.log("Filtered Variants:", filteredVariants); // Debug variants
        setProductData({
          ...data,
          sizes: filteredSizes,
          colors: filteredColors,
        });
        setSelectedSize(null);
        setSelectedColor(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Cập nhật colors dựa trên size đã chọn
  useEffect(() => {
    if (selectedSize && productData?.variants) {
      const colorsForSize = [...new Set(
        productData.variants
          .filter((v) => v.quantity > 0 && v.size.size === selectedSize)
          .map((v) => v.color.color)
      )];
      const filteredColorsForSize = productData.colors
        .filter((colorObj) => colorsForSize.includes(colorObj.color))
        .sort((a, b) => a.color.localeCompare(b.color));
      setAvailableColorsForSize(filteredColorsForSize);
    } else {
      setAvailableColorsForSize([]);
    }
  }, [selectedSize, productData]);

  useEffect(() => {
    if (selectedSize && selectedColor && productData?.variants) {
      const matchingVariant = productData.variants.find(
        (v) => v.size?.size === selectedSize && v.color?.color === selectedColor
      );
      setSelectedQuantity(matchingVariant?.quantity ?? null);
    } else {
      setSelectedQuantity(null);
    }
  }, [selectedSize, selectedColor, productData]);
  

  const handleAddToCart = () => {
    console.log('handleAddToCart called', { selectedSize, selectedColor, productData });
    if (!selectedSize || typeof selectedSize !== "string") {
      toast.error("Vui lòng chọn kích thước hợp lệ!", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!selectedColor || typeof selectedColor !== "string") {
      toast.error("Vui lòng chọn màu sắc hợp lệ!", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!productData || !productData.product) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng!", { position: "top-right", autoClose: 3000 });
      return;
    }

    const selectedVariant = productData.variants?.find(
      (variant) => variant.size?.size === selectedSize && variant.color?.color === selectedColor
    );

    if (!selectedVariant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp!", { position: "top-right", autoClose: 3000 });
      return;
    }

    if (selectedVariant.quantity <= 0) {
      toast.error("Sản phẩm đã hết hàng!", { position: "top-right", autoClose: 3000 });
      return;
    }

    const cartItem = {
      product: {
        id: productData.product.id,
        name: productData.product.name,
        price: productData.product.price,
        imageUrl: productData.product.imageUrl || `https://picsum.photos/500/500?random=${productData.product.id}`,
        gender: productData.product.gender,
        sizes: productData.sizes,
        colors: productData.colors,
      },
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };

    console.log("Cart Item:", cartItem);
    addToCart(cartItem);
    toast.success(`${productData.product.name} đã được thêm vào giỏ hàng!`, { position: "top-right", autoClose: 3000 });
  };

  // Hàm lấy giá trị size dưới dạng string
  const getSizeValue = (sizeObj) => sizeObj?.size || "";
  const getColorValue = (colorObj) => colorObj?.color || "";

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!productData || !productData.product) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const selectedVariant = productData.variants?.find(
      (variant) => variant.size?.size === selectedSize && variant.color?.color === selectedColor
    );

    if (!selectedVariant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (selectedVariant.quantity <= 0) {
      toast.error("Sản phẩm đã hết hàng!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const cartItem = {
      product: {
        id: productData.product.id,
        name: productData.product.name,
        price: productData.product.price,
        imageUrl:
          productData.product.imageUrl || `https://picsum.photos/500/500?random=${productData.product.id}`,
        gender: productData.product.gender,
        sizes: productData.sizes,
        colors: productData.colors,
      },
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };

    addToCart(cartItem);
    toast.success(`${productData.product.name} đã được thêm vào giỏ hàng!`, {
      position: "top-right",
      autoClose: 3000,
    });

    if (isAuthenticated) {
      navigate("/cart");
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Đang tải sản phẩm...</div>;
  }

  if (error || !productData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-red-600 text-center">{error || "Sản phẩm không tồn tại"}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const { product, sizes, colors, features } = productData;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
      >
        <span>←</span> Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4 bg-white shadow-md">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-auto object-cover rounded-md"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-3">Mã sản phẩm: {product.model}</p>
          <p className="text-red-600 text-2xl font-bold mb-4">
            {product.price.toLocaleString("vi-VN")}₫
          </p>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Kích thước:</h3>
            <div className="flex flex-wrap gap-2">
              {sizes && sizes.length > 0 ? (
                sizes.map((sizeObj) => {
                  const sizeValue = getSizeValue(sizeObj);
                  console.log("Debug Size Render:", { sizeObj, sizeValue, type: typeof sizeValue });
                  if (!sizeValue || typeof sizeValue !== "string") {
                    console.error("Invalid sizeValue:", sizeObj);
                    return null;
                  }
                  return (
                    <button
                      key={`size-${sizeObj.id}`}
                      className={`px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedSize === sizeValue
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => {
                        console.log("Selected Size:", sizeValue);
                        setSelectedSize(sizeValue);
                      }}
                    >
                      {sizeValue}
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500">Không có kích thước nào.</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Màu sắc:</h3>
            <div className="flex flex-wrap gap-2">
              {availableColorsForSize.length > 0 ? (
                availableColorsForSize.map((colorObj) => {
                  const colorValue = getColorValue(colorObj);
                  console.log("Debug Color Render:", { colorObj, colorValue, type: typeof colorValue });
                  if (!colorValue || typeof colorValue !== "string") {
                    console.error("Invalid colorValue:", colorObj);
                    return null;
                  }
                  return (
                    <button
                      key={`color-${colorObj.id}`}
                      className={`px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedColor === colorValue
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => {
                        console.log("Selected Color:", colorValue);
                        setSelectedColor(colorValue);
                      }}
                    >
                      {colorValue}
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500">Vui lòng chọn kích thước để xem màu sắc.</p>
              )}
            </div>
          </div>
          {selectedQuantity !== null && (
          <p className={`mb-4 ${selectedQuantity < 5 ? "text-red-600" : "text-gray-700"}`}>
           Số lượng tồn kho: <strong>{selectedQuantity}</strong>
          </p>
           )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              THÊM VÀO GIỎ
            </button>
            <button
              onClick={handleBuyNow}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
            >
              MUA NGAY
            </button>
          </div>

          {features && features.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Công nghệ nổi bật:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {features.map((featureObj, index) => (
                  <li key={index}>{featureObj.feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h2>
        <p className="text-gray-600">{product.description}</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductDetailPage;