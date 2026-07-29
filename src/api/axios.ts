import axios from "axios";

const api = axios.create({
    baseURL: "https://one4-07-2026ems.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});


api.interceptors.request.use((config) => {

    const session = localStorage.getItem("ems_session_v1");

    if (session) {
        const parsedSession = JSON.parse(session);

        if (parsedSession.token) {
            config.headers.Authorization = 
              `Bearer ${parsedSession.token}`;
        }
    }

    return config;
});


export default api;