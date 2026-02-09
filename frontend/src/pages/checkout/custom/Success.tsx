import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';

export function CustomPackageSuccessPage() {
  const params = useParams();
  const navigate = useNavigate();
  const locale = (params.locale as string) || 'en';
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
        <CardDescription className="text-green-600">
          Your purchase has been completed successfully
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">What Happens Next?</h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent your login credentials and account details to your email address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Log In to Your Account</p>
                <p className="text-sm text-muted-foreground">
                  Use the credentials from your email to access your author dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Create Your First Campaign</p>
                <p className="text-sm text-muted-foreground">
                  Your credits are ready to use! Start creating book review campaigns right away.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>First time user?</strong> You&apos;ll need to accept our Terms of Service when
            you first log in. After that, you can start using your credits immediately.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" size="lg" onClick={() => {
          setIsLoginLoading(true);
          navigate(`/${locale}/login`);
        }} disabled={isLoginLoading}>
          {isLoginLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Go to Login
          {!isLoginLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </p>
      </CardFooter>
    </Card>
  );
}
