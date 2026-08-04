
import { useState, useEffect } from 'react';

export const useCart = () => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quanty: item.quanty + 1 } : item
                );
            }
            return [...prevCart, { ...product, quanty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item => item.id === id ? { ...item, quanty: newQuantity } : item)
        );
    };

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quanty, 0);
    const totalItems = cart.reduce((total, item) => total + item.quanty, 0);

    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems };
};