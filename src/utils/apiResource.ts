const apiResponse = (success: boolean, message: string, data?: any) => {
    return {
        success,
        message,
        data: data ?? null,
    };
};

export default apiResponse;