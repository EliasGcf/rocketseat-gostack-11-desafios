import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(async product => {
    setProducts(state => {
      const isNewProduct = state.some(
        productState => productState.id === product.id,
      );

      if (!isNewProduct) {
        return [...state, { ...product, quantity: 1 }];
      }

      const newProducts = state.map(productState => {
        if (productState.id === product.id) {
          return { ...productState, quantity: productState.quantity + 1 };
        }

        return productState;
      });

      return newProducts;
    });
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          const newQuantity = product.quantity + 1;
          return {
            ...product,
            quantity: newQuantity,
          };
        }

        return product;
      });

      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(async id => {
    setProducts(state => {
      const product = state.find(productState => productState.id === id);

      if (product?.quantity === 1) {
        return state.filter(productState => productState.id !== id);
      }

      return state.map(productState =>
        productState.id === id
          ? { ...productState, quantity: productState.quantity - 1 }
          : productState,
      );
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
