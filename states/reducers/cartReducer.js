import * as actions from "../actionTypes/actionTypes";

const reducer = (state = [], action) => {
  switch (action.type) {
    case actions.CART_ADD:
      const productId = action.payload._id || action.payload.id;
      const existingItemIndex = state.findIndex(item =>
        (item._id || item.id) === productId
      );

      if (existingItemIndex !== -1) {
        const existingItem = state[existingItemIndex];
        if (existingItem.avaiableQuantity > existingItem.quantity) {
          return state.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          console.log("out of stock");
          return state; 
        }
      } else {
        return [
          ...state,
          {
            _id: action.payload._id || action.payload.id,
            id: action.payload.id || action.payload._id,
            category: action.payload.category,
            createdAt: action.payload.createdAt,
            description: action.payload.description,
            image: action.payload.image || action.payload.imageUrl,
            imageUrl: action.payload.imageUrl || action.payload.image,
            price: action.payload.price || action.payload.oldPrice,
            oldPrice: action.payload.oldPrice || action.payload.price,
            sku: action.payload.sku,
            title: action.payload.title || action.payload.name,
            name: action.payload.name || action.payload.title,
            updatedAt: action.payload.updatedAt,
            avaiableQuantity: action.payload.quantity || 99, // Default to 99 if not specified
            quantity: 1,
          },
        ];
      }

    case actions.CART_REMOVE:
      return state.filter((item) =>
        (item._id || item.id) !== action.payload
      );

    case actions.INCREASE_CART_ITEM_QUANTITY:
      if (action.payload.type === "increase") {
        return state.map((item) =>
          (item._id || item.id) === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
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
