// Utils/Methods.js
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidObjectField = (obj) => {
    return Object.values(obj).every(value => value.trim());
};

export const updateError = (message, setError) => {
    setError(message);
    setTimeout(() => {
        setError('');
    }, 3000);
};