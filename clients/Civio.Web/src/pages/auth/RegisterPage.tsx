import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { register as apiRegister } from "../../api/auth";
import { getErrorMessage } from "../../api/client";

const schema = z
  .object({
    firstName: z
      .string()
      .min(1, "Введите имя")
      .max(100, "Не более 100 символов"),
    lastName: z
      .string()
      .min(1, "Введите фамилию")
      .max(100, "Не более 100 символов"),
    email: z
      .string()
      .min(1, "Введите email")
      .email("Некорректный email")
      .max(256),
    phone: z
      .string()
      .max(20, "Не более 20 символов")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Минимум 8 символов")
      .max(100, "Не более 100 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают",
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const phonePrevRef = useRef("");

  const formatPhone = (digits: string): string => {
    if (!digits) return "";
    const a = digits[0];
    const b = digits.slice(1, 4);
    const c = digits.slice(4, 7);
    const d = digits.slice(7, 9);
    const e = digits.slice(9, 11);
    let out = "+" + a;
    if (b) out += " (" + b;
    if (b.length === 3) out += ")";
    if (c) out += " " + c;
    if (d) out += "-" + d;
    if (e) out += "-" + e;
    return out;
  };

  const handlePhoneChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const prev = phonePrevRef.current;
    const raw = ev.target.value;
    let digits = raw.replace(/\D/g, "");
    const prevDigits = prev.replace(/\D/g, "");
    if (
      raw.length < prev.length &&
      digits === prevDigits &&
      digits.length > 0
    ) {
      digits = digits.slice(0, -1);
    }
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    digits = digits.slice(0, 11);
    const formatted = formatPhone(digits);
    ev.target.value = formatted;
    phonePrevRef.current = formatted;
    void phoneReg.onChange(ev);
  };

  const phoneReg = register("phone");

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      await apiRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone?.trim() ? data.phone.trim() : undefined,
      });

      navigate("/register/verify", { state: { email: data.email.trim().toLowerCase() } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const fieldClass = (hasError: boolean) =>
    "input" + (hasError ? " has-error" : "");

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span className="civio-logo" style={{ fontSize: 22 }}>
          <span
            className="civio-logo-mark"
            style={{ width: 30, height: 30, fontSize: 15 }}
          >
            C
          </span>
          Civio
        </span>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 6px",
          }}
        >
          Создать аккаунт
        </h1>
        <p
          style={{
            color: "var(--text-soft)",
            margin: "0 0 22px",
            fontSize: 14,
          }}
        >
          Бесплатная регистрация для владельцев бизнеса и сотрудников
          организации
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
          noValidate
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div className="field">
              <label className="field-label" htmlFor="firstName">
                Имя <span className="req">*</span>
              </label>
              <input
                id="firstName"
                autoComplete="given-name"
                className={fieldClass(!!errors.firstName)}
                {...register("firstName")}
              />
              {errors.firstName && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="lastName">
                Фамилия <span className="req">*</span>
              </label>
              <input
                id="lastName"
                autoComplete="family-name"
                className={fieldClass(!!errors.lastName)}
                {...register("lastName")}
              />
              {errors.lastName && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  {errors.lastName.message}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email <span className="req">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClass(!!errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">
              Телефон
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              className={fieldClass(!!errors.phone)}
              {...phoneReg}
              onChange={handlePhoneChange}
            />
            {errors.phone && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.phone.message}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Пароль <span className="req">*</span>
            </label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={fieldClass(!!errors.password)}
                {...register("password")}
              />
              <button
                className="input-group-action"
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.password.message}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirmPassword">
              Подтвердить пароль <span className="req">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={fieldClass(!!errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <div className="field-error">
                <AlertCircle size={13} />
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          {submitError && (
            <div className="field-error">
              <AlertCircle size={13} />
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: 6 }}
          >
            {isSubmitting ? "Создаём…" : "Зарегистрироваться"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "var(--text-soft)",
          }}
        >
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--indigo-700)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Войти
          </Link>
        </div>
      </div>
    </>
  );
}
