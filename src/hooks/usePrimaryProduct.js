import { useEffect, useMemo, useState } from "react";
import { fetchPrimaryProduct } from "../services/productApi";
import {
  FALLBACK_PRIMARY_PRODUCT,
  normalizePackSizes,
  normalizePrimaryProduct,
} from "../services/productCatalog";

let cachedPrimaryProduct = FALLBACK_PRIMARY_PRODUCT;
let hasResolvedPrimaryProduct = false;
let primaryProductRequest = null;

function usePrimaryProduct() {
  const [product, setProduct] = useState(FALLBACK_PRIMARY_PRODUCT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (hasResolvedPrimaryProduct) {
      setProduct(cachedPrimaryProduct);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadPrimaryProduct = async () => {
      try {
        if (!primaryProductRequest) {
          primaryProductRequest = fetchPrimaryProduct()
            .then((data) => normalizePrimaryProduct(data))
            .catch(() => FALLBACK_PRIMARY_PRODUCT)
            .finally(() => {
              primaryProductRequest = null;
            });
        }

        const normalized = await primaryProductRequest;
        cachedPrimaryProduct = normalized;
        hasResolvedPrimaryProduct = true;

        if (!cancelled) {
          setProduct(normalized);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPrimaryProduct();

    return () => {
      cancelled = true;
    };
  }, []);

  const packSizes = useMemo(() => normalizePackSizes(product), [product]);

  return {
    product,
    packSizes,
    isLoading,
  };
}

export default usePrimaryProduct;
