import service from '@/utils/service';


export const imageManagementGetRequest = (data: any) => {
  return service({
    url: '/imageManagement/get/',
    method: 'POST',
    data,
  });
};

export const imageManagementDeleteRequest = (data: any) => {
  return service({
    url: '/imageManagement/delete/',
    method: 'POST',
    data,
  });
};

export const setImageToPublicRequest = (data: any) => {
  return service({
    url: '/imageManagement/setImageToPublic/',
    method: 'POST',
    data,
  });
};
