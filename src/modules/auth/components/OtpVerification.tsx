import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { verifyOtp, finalizeBDlogin, getUserById } from "@/services/auth/Auth"; // Make sure these are correctly exported
import { useLocation, useNavigate } from "react-router-dom";

type OtpFormInputs = {
  otp: string;
};

export function OtpVerification({
  className,
  email,
  onSuccess,
}: {
  className?: string;
  email: string;
  onSuccess?: () => void;
}) {
  const { handleSubmit } = useForm<OtpFormInputs>();

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && value) inputRefs.current[index]?.blur();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const updated = [...otpDigits];
      updated[index - 1] = "";
      setOtpDigits(updated);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getLocation = (): Promise<{
    latitude: string;
    longitude: string;
    fullAddress: string;
  }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Geolocation is not supported"));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude.toString();
          const longitude = position.coords.longitude.toString();
          let fullAddress = "Unknown";

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await geoRes.json();
            fullAddress = data?.display_name || "Unknown";
          } catch {}

          resolve({ latitude, longitude, fullAddress });
        },
        (error) => reject(new Error("Location access denied or unavailable"))
      );
    });

  const onSubmit = async () => {
    if (!email) return toast.error("Missing email. Please try again.");
    const otp = otpDigits.join("");
    if (otp.length !== 6)
      return toast.error("Please enter the complete 6-digit OTP.");

    try {
      setSubmitting(true);

      // Get location first
      const { latitude, longitude, fullAddress } = await getLocation();

      await verifyOtp({ email, otp });

      // Finalize login with location
      const finalRes = await finalizeBDlogin({
        email,
        latitude,
        longitude,
        fullAddress,
      });

      if (!finalRes?.token || !finalRes?.userId) {
        throw new Error("Missing token or userId from finalize login");
      }

      localStorage.setItem("token", finalRes.token);
      localStorage.setItem("userId", finalRes.userId);

      // Optional: Fetch and store user details if needed
      const userData = await getUserById(finalRes.userId);
      localStorage.setItem("user", JSON.stringify(userData.user));

      toast.success("Login Successful");
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col items-center gap-6", className)}
    >
      <h1 className="text-center text-2xl font-bold text-[#1f487c]">
        Verify OTP
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Enter the OTP sent to your email
      </p>

      <div className="flex justify-center gap-2">
        {otpDigits.map((digit, index) => (
          <Input
            key={index}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            ref={(el) => el && (inputRefs.current[index] = el)}
            className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f487c]"
          />
        ))}
      </div>

      <Button type="submit" className="w-40 bg-[#214b7b]" disabled={submitting}>
        {submitting ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );
}
