import axios, { AxiosRequestConfig } from "axios";

import { baseUrl } from "./constants";

export function getJWTHeader(userToken: string): Record<string, string> {
  console.log("userToken: ", userToken);
  return { Authorization: `Bearer ${userToken}` };
}

const config: AxiosRequestConfig = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);
