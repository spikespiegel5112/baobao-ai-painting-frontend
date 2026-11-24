import service from '@/utils/service';


export const addQueueRequest = (data: any) => {
  return service({
    url: '/addQueue/',
    method: 'POST',
    data,
  });
};

export const addQueueInpaintRequest = (data: any) => {
  return service({
    url: '/addQueueInpaint/',
    method: 'POST',
    data,
  });
};

export const checkQueueByUserIdRequest = (data: any) => {
  return service({
    url: '/checkQueueByUserId/',
    method: 'POST',
    data,
  });
};

export const deleteQueueRequest = (data: any) => {
  return service({
    url: '/deleteQueue/',
    method: 'POST',
    data,
  });
};
