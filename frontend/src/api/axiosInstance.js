import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:8456/api",
  withCredentials: true,
});
