import { LoginForm } from "@/modules/auth/components/Login_Form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto w-screen h-screen flex justify-center items-center">
      <Card className="h-fit">
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
