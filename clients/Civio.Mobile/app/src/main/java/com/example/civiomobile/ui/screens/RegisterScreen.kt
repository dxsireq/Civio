package com.example.civiomobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.CivioTextField
import com.example.civiomobile.viewmodel.AuthState
import com.example.civiomobile.viewmodel.AuthViewModel

private fun formatPhone(digits: String): String {
    if (digits.isEmpty()) return ""
    val a = digits[0]
    val b = digits.drop(1).take(3)
    val c = digits.drop(4).take(3)
    val d = digits.drop(7).take(2)
    val e = digits.drop(9).take(2)
    var out = "+$a"
    if (b.isNotEmpty()) out += " ($b"
    if (b.length == 3) out += ")"
    if (c.isNotEmpty()) out += " $c"
    if (d.isNotEmpty()) out += "-$d"
    if (e.isNotEmpty()) out += "-$e"
    return out
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onLoggedIn: () -> Unit,
    onNavigateLogin: () -> Unit,
    onNavigateVerify: (email: String) -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf(TextFieldValue("")) }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var showConfirmPassword by remember { mutableStateOf(false) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }

    val isLoading = state is AuthState.Loading
    val errorMessage = (state as? AuthState.Error)?.message

    LaunchedEffect(state) {
        when (val s = state) {
            is AuthState.Authenticated -> onLoggedIn()
            is AuthState.PendingVerification -> onNavigateVerify(s.email)
            else -> Unit
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Создать аккаунт") },
                navigationIcon = {
                    IconButton(onClick = onNavigateLogin) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 8.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.fillMaxWidth()) {
                CivioTextField(
                    value = firstName,
                    onValueChange = { firstName = it; viewModel.resetError() },
                    label = "Имя*",
                    enabled = !isLoading
                )
                CivioTextField(
                    value = lastName,
                    onValueChange = { lastName = it; viewModel.resetError() },
                    label = "Фамилия*",
                    enabled = !isLoading
                )
                CivioTextField(
                    value = email,
                    onValueChange = { email = it; emailError = null; viewModel.resetError() },
                    label = "Email*",
                    keyboardType = KeyboardType.Email,
                    isError = emailError != null,
                    errorText = emailError,
                    enabled = !isLoading
                )
                CivioTextField(
                    value = phone,
                    onValueChange = { raw ->
                        var digits = raw.text.filter { it.isDigit() }
                        val prevDigits = phone.text.filter { it.isDigit() }
                        if (raw.text.length < phone.text.length && digits == prevDigits && digits.isNotEmpty()) {
                            digits = digits.dropLast(1)
                        }
                        if (digits.startsWith("8")) digits = "7" + digits.drop(1)
                        digits = digits.take(11)
                        val formatted = formatPhone(digits)
                        phone = TextFieldValue(text = formatted, selection = TextRange(formatted.length))
                        viewModel.resetError()
                    },
                    label = "Телефон",
                    placeholder = "+7 (___) ___-__-__",
                    keyboardType = KeyboardType.Phone,
                    enabled = !isLoading
                )
                CivioTextField(
                    value = password,
                    onValueChange = { password = it; confirmPasswordError = null; viewModel.resetError() },
                    label = "Пароль*",
                    isPassword = true,
                    showPassword = showPassword,
                    onToggleShowPassword = { showPassword = !showPassword },
                    isError = errorMessage != null,
                    errorText = errorMessage,
                    enabled = !isLoading
                )
                CivioTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it; confirmPasswordError = null },
                    label = "Повторите пароль*",
                    isPassword = true,
                    showPassword = showConfirmPassword,
                    onToggleShowPassword = { showConfirmPassword = !showConfirmPassword },
                    isError = confirmPasswordError != null,
                    errorText = confirmPasswordError,
                    enabled = !isLoading
                )
            }

            Spacer(Modifier.height(24.dp))
            CivioButton(
                text = "Зарегистрироваться",
                onClick = {
                    val trimmedEmail = email.trim()
                    if (!android.util.Patterns.EMAIL_ADDRESS.matcher(trimmedEmail).matches()) {
                        emailError = "Введите корректный email"
                        return@CivioButton
                    }
                    if (password != confirmPassword) {
                        confirmPasswordError = "Пароли не совпадают"
                        return@CivioButton
                    }
                    viewModel.register(
                        email = trimmedEmail,
                        password = password,
                        firstName = firstName.trim(),
                        lastName = lastName.trim(),
                        phone = phone.text.trim().ifBlank { null }
                    )
                },
                enabled = firstName.isNotBlank() &&
                    lastName.isNotBlank() &&
                    email.isNotBlank() &&
                    password.isNotBlank() &&
                    confirmPassword.isNotBlank(),
                loading = isLoading,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(8.dp))
            LinkRow(
                text = "Уже есть аккаунт?",
                actionText = "Войти",
                onAction = onNavigateLogin,
                enabled = !isLoading
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}
