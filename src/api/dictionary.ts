import service from '@/utils/service';


export const dictionaryManagementGetRequest = (data: any) => {
  return service({
    url: '/dictionaryManagement/get/',
    method: 'POST',
    data,
  });
};
