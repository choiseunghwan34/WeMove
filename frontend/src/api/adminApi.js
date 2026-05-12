import api from './axiosInstance'; export const getSummary=()=>api.get('/admin/summary'); export const getAdminMembers=()=>api.get('/admin/members'); export const getAdminMeetings=()=>api.get('/admin/meetings'); export const getAdminReports=()=>api.get('/admin/reports'); export const resolveReport=(id)=>api.patch('/admin/reports/'+id+'/resolve'); export const rejectReport=(id)=>api.patch('/admin/reports/'+id+'/reject');


