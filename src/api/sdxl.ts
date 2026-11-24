import service from '@/utils/service';


export const txt2ImgSDXLRequest = (data: any) => {
  return service({
    url: '/txt2ImgSDXL/',
    method: 'POST',
    data,
  });
};

export const inpaintRequest = (data: any) => {
  return service({
    url: '/inpaint/',
    method: 'POST',
    data,
  });
};

export const triggerTxt2ImgSDXLByQueueRequest = (data: any) => {
  return service({
    url: '/triggerTxt2ImgSDXLByQueue/',
    method: 'POST',
    data,
  });
};

export const getCancellingProgressSDXLRequest = () => {
  return service({
    url: '/getCancellingProgressSDXL/',
    method: 'POST',
  });
};

export const cancelGenerationSDXLRequest = () => {
  return service({
    url: '/cancelGenerationSDXL/',
    method: 'POST',
  });
};

export const getGenerationStatusSDXLRequest = (data: any) => {
  return service({
    url: '/getGenerationStatusSDXL/',
    method: 'POST',
    data,
  });
};

export const getGenerationStatusSDXLInpaintRequest = (data: any) => {
  return service({
    url: '/getGenerationStatusSDXLInpaint/',
    method: 'POST',
    data,
  });
};

export const getLastImageDataSDXLRequest = () => {
  return service({
    url: '/getLastImageDataSDXL/',
    method: 'GET',
  });
};

export const saveImageToAlbumRequest = (data: any) => {
  return service({
    url: '/saveImageToAlbum/',
    method: 'POST',
    data,
  });
};

export const promptManagementGetRequest = (data: any) => {
  return service({
    url: '/promptManagement/get/',
    method: 'POST',
    data,
  });
};

export const dictionaryManagementGetRequest = (data: any) => {
  return service({
    url: '/dictionaryManagement/get/',
    method: 'POST',
    data,
  });
};

export const promptCategoryManagementGetRequest = (data: any) => {
  return service({
    url: '/promptCategoryManagement/get/',
    method: 'POST',
    data,
  });
};

export const modelManagemenGetRequest = () => {
  return service({
    url: '/modelManagement/get/',
    method: 'GET',
  });
};

export const uploadRequest = () => {
  return service({
    url: '/upload/',
    method: 'POST',
  });
};
