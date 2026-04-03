const IS_PROD = import.meta.env.PROD;
const server = IS_PROD ?
    "https://vi-connects.onrender.com" :
    "http://localhost:8000"

export default server;