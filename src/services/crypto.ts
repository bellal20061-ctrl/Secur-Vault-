import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-super-secret-key'; // In a real app, use environment variables

export const encrypt = (text: string, pin: string) => {
  const key = CryptoJS.SHA256(pin + SECRET_KEY).toString();
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, pin: string) => {
  const key = CryptoJS.SHA256(pin + SECRET_KEY).toString();
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generatePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const hash = (text: string) => {
  return CryptoJS.SHA256(text).toString();
};
