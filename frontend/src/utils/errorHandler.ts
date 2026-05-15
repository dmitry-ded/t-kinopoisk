import { isAxiosError } from "axios"

export const getErrorMessage = (e: unknown, mes: string = "Ошибка") => {

  if (isAxiosError(e)) {
    const body = e.response?.data as { message?: string } | undefined;
    if (body?.message) return body.message;
    if (e.response?.status === 401) return "Нужно войти в аккаунт";
    if (e.response?.status === 403) return "Нет доступа. Обновите страницу и войдите снова.";
    if (e.response?.status === 404) return "Список не найден";
    if (e.response?.status === 409) return "Этот фильм уже есть в выбранном списке";
  }

  return mes;
}

export const getCommentErrorMessage = (e: unknown, mes: string): string => {
  if (isAxiosError(e)) {
    const body = e.response?.data as { message?: string } | undefined;
    if (body?.message) return body.message;
    if (e.response?.status === 401) return 'Нужно войти в аккаунт';
    if (e.response?.status === 403) return 'Недостаточно прав';
  }

  return mes;
};