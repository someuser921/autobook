import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Car } from "lucide-react";
import { authApi } from "../api";
import { useAuthStore } from "../store/auth";
import { getErrorMessage } from "../lib/utils";

export function RegisterPage() {
  const { register, handleSubmit } = useForm<{ email: string; name: string; password: string }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (data: { email: string; name: string; password: string }) => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setAuth(res.data.access_token, res.data.user);
      navigate("/");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="card p-6 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 rounded-2xl p-3 mb-3">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Автотека</h1>
          <p className="text-gray-500 text-sm">Создайте аккаунт</p>
        </div>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <div className="field">
            <label className="label">Имя</label>
            <input className="input" placeholder="Ваше имя" {...register("name", { required: true })} />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
          </div>
          <div className="field">
            <label className="label">Пароль</label>
            <input className="input" type="password" placeholder="Минимум 6 символов" {...register("password", { required: true, minLength: 6 })} />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button className="btn-primary w-full mt-1" type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
