import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '../../utils/validation/auth.schema';
import type { ForgotPasswordFormData } from '../../utils/validation/auth.schema';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Forgot password data:', data);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-600 mb-6">
          We have sent a password reset link to your email address.
        </p>
        <Link
          to="/login"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Forgot password?
      </h3>
      <p className="text-sm text-gray-600 text-center mb-6">
        No worries, we'll send you reset instructions.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>
      </div>
    </div>
  );
};
