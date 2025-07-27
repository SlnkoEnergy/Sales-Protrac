import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { AuthLogin, getUserById } from "@/services/auth/Auth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OtpVerification } from "./OtpVerification";
import { useNavigate, useLocation } from "react-router-dom";

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

  const [showPassword, setShowPassword] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [geoInfo, setGeoInfo] = useState<{
    latitude: number | null;
    longitude: number | null;
    fullAddress: string;
  }>({
    latitude: null,
    longitude: null,
    fullAddress: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Get Location and Address
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        let fullAddress = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          fullAddress = data.display_name || "";
        } catch (err) {
          toast.error("Reverse geocoding failed");
        }

        setGeoInfo({ latitude, longitude, fullAddress });
      },
      (error) => {
        toast.error("Location access denied. Enable location to login.");
      }
    );
  }, []);

  const onSubmit = async (data: LoginFormInputs) => {
    if (!geoInfo.latitude || !geoInfo.longitude || !geoInfo.fullAddress) {
      toast.error(
        "Location is required to login. Please enable location access."
      );
      return;
    }

    try {
      const payload = {
        ...data,
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        fullAddress: geoInfo.fullAddress,
      };

      const result = await AuthLogin({ payload });

      if (!result?.token || !result?.userId) {
        throw new Error("Missing token or userId from login response");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userId);

      const userData = await getUserById(result.userId);
      localStorage.setItem("user", JSON.stringify(userData.user));

      toast.success("Login Successful");
      navigate(from, { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Login failed";

      if (
        message === "Unrecognized device. OTP has been sent for verification."
      ) {
        setEmailForOtp(data.email);
        setOtpDialogOpen(true);
        toast.info(message);
        return;
      }

      toast.error(message);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col text-center text-2xl font-bold text-[#1f487c]">
          <h1>Sales Protrac</h1>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl text-start font-semibold text-[#1f487c]">
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1f487c] cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>

      {/* OTP Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OTP Verification</DialogTitle>
          </DialogHeader>
          <OtpVerification
            email={emailForOtp}
            onSuccess={() => setOtpDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
