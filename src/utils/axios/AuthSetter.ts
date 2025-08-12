let runtimeToken: string | null = null;

export const setRuntimeToken = (token: string) => {
  runtimeToken = token;
};

export const getRuntimeToken = (): string | null => {
  return runtimeToken || localStorage.getItem("authToken");
};
