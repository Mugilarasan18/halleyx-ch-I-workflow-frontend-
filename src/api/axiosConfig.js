import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Unga Spring Boot URL
});

export default api;