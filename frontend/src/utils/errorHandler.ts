import { isAxiosError } from "axios"

export const getErrorMessage = (e: unknown, mes: string = "Ошибка") => {

  if (isAxiosError(e)) {
    const status = e.response?.status;

    switch (status) {
      case 401:
        return "Нужно войти в аккаунт";
      case 403:
        return "Нет доступа. Обновите страницу и войдите снова.";
      case 404:
        return "Список не найден";
      case 409:
        return "Этот фильм уже есть в выбранном списке";
      default: 
        return e.response?.data.message ?? e.message ?? mes;
    }
  }

  return "Операция не удалась";
}