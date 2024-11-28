const apiResponse = (
    success: boolean, 
    message: string, 
    data: any = null,
    code: number = 200
  ) => {
    return {
      success,
      code,
      message,
      data
    };
  };
  
  export default apiResponse;
  