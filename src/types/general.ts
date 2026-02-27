export default interface GeneralResponse<T> {
    data?: T;
    message?: string;
    status?: number | boolean;
    error?: string;
}