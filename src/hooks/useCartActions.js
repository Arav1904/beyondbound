import useMenuStore from "../useMenuStore";
import { addCartItem } from "../services/cartApi";

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

function useCartActions() {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const authToken = useMenuStore((state) => state.authToken);
  const addToCartLocal = useMenuStore((state) => state.addToCartLocal);
  const setCartFromServer = useMenuStore((state) => state.setCartFromServer);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const setCartMessage = useMenuStore((state) => state.setCartMessage);

  const addProductToCart = async (item) => {
    const normalized = {
      productId: String(item?.productId || item?.id || "").trim(),
      productName: String(item?.productName || item?.name || "").trim(),
      price: toNonNegativeNumber(item?.price, 0),
      image: String(item?.image || item?.imageUrl || "").trim(),
      quantity: toPositiveInt(item?.quantity, 1),
      size: String(item?.size || "").trim(),
    };

    if (!normalized.productId || !normalized.productName) {
      setCartMessage("Could not add item: missing product details.");
      return;
    }

    if (signedInUser && authToken) {
      setCartSyncing(true);

      try {
        const cart = await addCartItem(authToken, normalized);
        setCartFromServer(cart);
        setCartMessage(`${normalized.productName} added to your account cart.`);
      } catch (error) {
        addToCartLocal(normalized);
        setCartMessage(
          error.message ||
            `${normalized.productName} added locally. Will sync after reconnection.`,
        );
      } finally {
        setCartSyncing(false);
      }

      return;
    }

    addToCartLocal(normalized);
    setCartMessage(`${normalized.productName} added to cart.`);
  };

  return { addProductToCart };
}

export default useCartActions;
