import service from '@/utils/service';

export const generateSignatureRequest = (data: any) => {
  return service({
    url: '/auth/generateSignature/',
    method: 'POST',
    data,
  });
};

export const getHWH5UserIdByAuthCodeRequest = (data: any) => {
  return service({
    url: '/auth/getHWH5UserIdByAuthCode/',
    method: 'POST',
    data,
  });
};
