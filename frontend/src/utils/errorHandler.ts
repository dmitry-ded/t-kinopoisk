import { isAxiosError } from "axios"

export const getErrorMessage = (e: unknown, mes: string = "Ошибка"): string => {
  
  if (isAxiosError(e)) {
    return e.code ?? mes;
  }

  return mes;
}
