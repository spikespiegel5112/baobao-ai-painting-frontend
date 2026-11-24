import service from '@/utils/service';


export const txt2ImgFluxRequest = (data: any) => {
  return service({
    url: '/txt2ImgFlux/',
    method: 'POST',
    data,
  });
};

export const triggerTxt2ImgFluxByQueueRequest = (data: any) => {
  return service({
    url: '/triggerTxt2ImgFluxByQueue/',
    method: 'POST',
    data,
  });
};

export const addQueueRequest = (data: any) => {
  return service({
    url: '/addQueue/',
    method: 'POST',
    data,
  });
};

export const getLastImageDataFluxRequest = () => {
  return service({
    url: '/getLastImageData/',
    method: 'GET',
  });
};

export const getCancellingProgressFluxRequest = () => {
  return service({
    url: '/getCancellingProgress/',
    method: 'POST',
  });
};

export const cancelGenerationFluxRequest = () => {
  return service({
    url: '/cancelGenerationFlux/',
    method: 'POST',
  });
};

export const getGenerationStatusFluxRequest = (data: any) => {
  return service({
    url: '/getGenerationStatusFlux/',
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

export const stableDiffusionProgressRequest = () => {
  return service({
    url: '/stableDiffusion/progress',
    method: 'GET',
  });
};

export const stableDiffusionInternalProgressRequest = () => {
  return service({
    url: '/internalProgress',
    method: 'POST',
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
