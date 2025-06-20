import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AuthLogin } from "@/services/auth"; // Adjust this path to your actual file location
import { useNavigate } from "react-router-dom";

type LoginFormInputs = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

const onSubmit = async (data: LoginFormInputs) => {
  setErrorMessage("");

  try {
    const result = await AuthLogin({ payload: data });

    // Store auth token and userId
    localStorage.setItem("token", result.token);
    localStorage.setItem("userId", result.userId);

    console.log("Login successful:", result);

    // Navigate to dashboard or homepage
    navigate("/");
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Login failed";
    setErrorMessage(message);
  }
};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl text-start font-bold text-[#1f487c]">
          Login to your account
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 text-center">{errorMessage}</p>
        )}

        <Button type="submit" className="w-full bg-[#1f487c]" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
