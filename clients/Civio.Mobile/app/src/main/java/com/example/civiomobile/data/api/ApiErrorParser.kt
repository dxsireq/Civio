package com.example.civiomobile.data.api

import org.json.JSONObject
import retrofit2.HttpException
import java.io.IOException

private val codeMessages = mapOf(
    "invalid_credentials" to "Неверный email или пароль",
    "user_inactive" to "Аккаунт деактивирован. Обратитесь к администратору",
    "email_already_exists" to "Этот email уже зарегистрирован",
    "email_not_verified" to "Email не подтверждён",
    "invalid_code" to "Неверный или истёкший код подтверждения",
    "code_expired" to "Код подтверждения истёк. Запросите новый",
)

private val statusMessages = mapOf(
    400 to "Некорректный запрос",
    401 to "Неверный email или пароль",
    403 to "Доступ запрещён",
    404 to "Ресурс не найден",
    409 to "Пользователь с таким email уже существует",
    422 to "Некорректные данные",
    429 to "Слишком много запросов. Попробуйте позже",
    500 to "Ошибка сервера. Попробуйте позже",
    502 to "Сервер недоступен",
    503 to "Сервис временно недоступен",
)

fun parseApiError(e: Throwable): String {
    if (e is IOException) return "Нет соединения с сервером"
    if (e is HttpException) {
        val body = try { e.response()?.errorBody()?.string() } catch (_: Exception) { null }
        if (!body.isNullOrBlank()) {
            try {
                val json = JSONObject(body)
                val code = json.optString("code").takeIf { it.isNotBlank() }
                if (code != null) codeMessages[code]?.let { return it }
                val errors = json.optJSONObject("errors")
                if (errors != null && errors.keys().hasNext()) {
                    val msg = errors.optJSONArray(errors.keys().next())?.optString(0)
                    if (!msg.isNullOrBlank()) return msg
                }
                json.optString("error").takeIf { it.isNotBlank() }?.let { return it }
                json.optString("detail").takeIf { it.isNotBlank() }?.let { return it }
                json.optString("title").takeIf { it.isNotBlank() }?.let { return it }
            } catch (_: Exception) { }
        }
        return statusMessages[e.code()] ?: "Неизвестная ошибка"
    }
    return e.message ?: "Неизвестная ошибка"
}
