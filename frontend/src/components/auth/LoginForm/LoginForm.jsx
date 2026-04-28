import { useActionState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import SubmitButton from "@/components/SubmitButton/SubmitButton";

function LoginForm({ onSuccess }) {
  const LOGIN_ENDPOINT = "/auth/login";

  const { setAccessToken } = useAuth();

  const [state, dispatch, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const response = await fetch(LOGIN_ENDPOINT, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setAccessToken(data.access_token);

        return { error: null, successCount: prevState.successCount + 1 };
      } catch (error) {
        return { error: error.message, successCount: prevState.successCount };
      }
    },
    { error: null, successCount: 0 },
  );

  useEffect(() => {
    if (state.successCount > 0) onSuccess();
  }, [state.successCount, onSuccess]);

  return (
    <form key={state.successCount} className="add-movie-form" action={dispatch}>
      <label htmlFor="username">
        <p>Email</p>
        <input
          type="email"
          maxLength="100"
          name="username"
          id="username"
          placeholder="saulgoodman@hhm.com"
          required
        />
      </label>

      <label htmlFor="password">
        <p>Contraseña</p>
        <input
          type="password"
          maxLength="200"
          name="password"
          id="password"
          required
        />
      </label>

      {state.error && <p className="error-sign">{state.error}</p>}

      <SubmitButton text="Confirmar" isLoading={isPending} />
    </form>
  );
}

export default LoginForm;
