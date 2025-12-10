import * as actions from "../actionTypes/actionTypes";

const reducer = (state = [], action) => {
  switch (action.type) {
    case actions.CART_ADD:
      // 1. Xác định ID sản phẩm
      const productId = action.payload._id || action.payload.id;
      
      // 2. Lấy số lượng khách muốn mua (Nếu không có thì mặc định 1)
      const quantityToAdd = action.payload.quantity && action.payload.quantity > 0 
                            ? action.payload.quantity 
                            : 1;

      // 3. Xác định tồn kho thực tế từ Payload gửi lên
      // Ưu tiên các biến countInStock/maxQuantity, fallback về availableQuantity cũ hoặc 99
      const realStock = action.payload.countInStock || action.payload.maxQuantity || action.payload.availableQuantity || 99;

      // 4. Tìm sản phẩm trong giỏ
      const existingItemIndex = state.findIndex(item =>
        (item._id || item.id) === productId
      );

      if (existingItemIndex !== -1) {
        // --- TRƯỜNG HỢP: SẢN PHẨM ĐÃ CÓ TRONG GIỎ ---
        const existingItem = state[existingItemIndex];
        
        // Kiểm tra: (Số lượng hiện có + Số muốn thêm) có vượt quá Tồn kho không?
        // Lưu ý: existingItem.availableQuantity là tồn kho đã lưu trong state
        const currentStockLimit = existingItem.availableQuantity || realStock;

        if (existingItem.quantity + quantityToAdd <= currentStockLimit) {
          return state.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantityToAdd } // SỬA: Cộng đúng số lượng gửi lên
              : item
          );
        } else {
          console.log("out of stock - Cart limit reached");
          return state; 
        }
      } else {
        // --- TRƯỜNG HỢP: SẢN PHẨM MỚI ---
        
        // Kiểm tra ngay từ đầu xem số lượng muốn mua có lớn hơn tồn kho không
        if (quantityToAdd > realStock) {
            console.log("out of stock - Not enough initial stock");
            return state;
        }

        return [
          ...state,
          {
            _id: action.payload._id || action.payload.id,
            id: action.payload.id || action.payload._id,
            category: action.payload.category,
            createdAt: action.payload.createdAt,
            description: action.payload.description,
            // Xử lý ảnh: ưu tiên image, sau đó imageUrl (nếu là mảng lấy phần tử đầu)
            image: action.payload.image || (Array.isArray(action.payload.imageUrl) ? action.payload.imageUrl[0] : action.payload.imageUrl),
            imageUrl: action.payload.imageUrl, 
            price: action.payload.price || action.payload.oldPrice,
            oldPrice: action.payload.oldPrice || action.payload.price,
            sku: action.payload.sku,
            title: action.payload.title || action.payload.name,
            name: action.payload.name || action.payload.title,
            updatedAt: action.payload.updatedAt,
            saleRate: action.payload.saleRate,
            // SỬA QUAN TRỌNG: Lưu tồn kho thực tế, KHÔNG lấy quantity (vì quantity là số lượng mua)
            availableQuantity: realStock, 
            
            // SỬA: Gán số lượng bằng số khách chọn
            quantity: quantityToAdd, 
          },
        ];
      }

    case actions.CART_REMOVE:
      return state.filter((item) =>
        (item._id || item.id) !== action.payload
      );

    case actions.INCREASE_CART_ITEM_QUANTITY:
        // Logic tăng giảm giữ nguyên, chỉ cần đảm bảo không vượt quá availableQuantity
      if (action.payload.type === "increase") {
        return state.map((item) => {
           if ((item._id || item.id) === action.payload.id) {
               return item.quantity < item.availableQuantity 
                ? { ...item, quantity: item.quantity + 1 } 
                : item;
           }
           return item;
        });
      }
      return state;

    case actions.DECREASE_CART_ITEM_QUANTITY:
      if (action.payload.type === "decrease") {
        return state.map((item) =>
          (item._id || item.id) === action.payload.id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        );
      }
      return state;

    case actions.EMPTY_CART:
      if (action.payload === "empty") {
        return [];
      }
      return state;

    default:
      return state;
  }
};

export default reducer;
