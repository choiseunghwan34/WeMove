import api from './axiosInstance'; export const getMe=()=>api.get('/members/me'); export const updateMe=(d)=>api.put('/members/me',d); export const getMember=(id)=>api.get('/members/'+id);


