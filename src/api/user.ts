// import { getCurrentInstance, ComponentInternalInstance } from "vue";
import service from '@/utils/service';


export const userManagementGetRequest = (data: any) => {
  return service({
    url: '/user/get/',
    method: 'POST',
    data,
  });
};

export const userManagementCreateRequest = (data: any) => {
  return service({
    url: '/user/create/',
    method: 'POST',
    data,
  });
};

export const userManagementUpdateRequest = (data: any) => {
  return service({
    url: '/user/update/',
    method: 'POST',
    data,
  });
};

export const userManagementDeleteRequest = (data: any) => {
  return service({
    url: '/user/delete/',
    method: 'POST',
    data,
  });
};

export const getUserDetailByIdRequest = (data: any) => {
  return service({
    url: '/user/getUserDetailById/',
    method: 'POST',
    data,
  });
};

export const getUserDetailByAppUserIdRequest = (data: any) => {
  return service({
    url: '/user/getUserDetailByAppUserId/',
    method: 'POST',
    data,
  });
};

export const getWelinkUserDetailRequest = (data: any) => {
  return service({
    url: '/user/getWelinkUserDetail/',
    method: 'POST',
    data,
  });
};
