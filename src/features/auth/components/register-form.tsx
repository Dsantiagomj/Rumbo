'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';

import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { trpc } from '@/shared/lib/trpc/client';
import { registerSchema, type RegisterInput } from '../utils/validation';

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      preferredName: '',
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      setIsLoading(false);
      // Use window.location.href for context change (register → login)
      // This clears registration state and loads fresh login page
      window.location.href = '/login';
    },
    onError: (error) => {
      setIsLoading(false);
      form.setError('root', {
        message: error.message || 'Ocurrió un error al crear tu cuenta',
      });
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    // Only send required fields to backend (confirmPassword is client-side only)
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      name: data.name,
      preferredName: data.preferredName,
      dateOfBirth: data.dateOfBirth,
      identification: data.identification,
    });
  };

  return (
    <div className="space-y-6">
      {/* Social Login Buttons (UI only) - Show first for register */}
      <div className="grid grid-cols-3 gap-3">
        {/* Google */}
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full"
          title="Próximamente disponible"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </Button>

        {/* Apple */}
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full"
          title="Próximamente disponible"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        </Button>

        {/* X (Twitter) */}
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full"
          title="Próximamente disponible"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">O registrate con email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Daniel Santiago" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preferred Name */}
          <FormField
            control={form.control}
            name="preferredName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Cómo quieres que te llame?</FormLabel>
                <FormControl>
                  <Input placeholder="Dani" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>La IA usará este nombre cuando chatees con ella</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de nacimiento</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={dateInputValue}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Remove all non-digits
                        const digits = value.replace(/\D/g, '');

                        // Auto-format as DD/MM/YYYY
                        let formatted = '';
                        if (digits.length > 0) {
                          formatted = digits.substring(0, 2);
                          if (digits.length >= 3) {
                            formatted += '/' + digits.substring(2, 4);
                          }
                          if (digits.length >= 5) {
                            formatted += '/' + digits.substring(4, 8);
                          }
                        }

                        setDateInputValue(formatted);

                        // Try to parse DD/MM/YYYY format
                        if (formatted.length === 10) {
                          try {
                            const parsedDate = parse(formatted, 'dd/MM/yyyy', new Date());
                            if (!isNaN(parsedDate.getTime())) {
                              field.onChange(parsedDate);
                            }
                          } catch {
                            // Invalid date, ignore
                          }
                        }
                      }}
                      onBlur={() => {
                        // Format the date when losing focus if valid
                        if (field.value) {
                          setDateInputValue(format(field.value, 'dd/MM/yyyy'));
                        }
                      }}
                      disabled={isLoading}
                      className="pr-10"
                      maxLength={10}
                    />
                  </FormControl>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3"
                        disabled={isLoading}
                      >
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        month={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          if (date) {
                            setDateInputValue(format(date, 'dd/MM/yyyy'));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormDescription>Usamos esto para personalizar tu experiencia</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identification */}
          <FormField
            control={form.control}
            name="identification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula de Ciudadanía (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="1140890261"
                    {...field}
                    disabled={isLoading}
                    maxLength={15}
                  />
                </FormControl>
                <FormDescription>
                  Facilitará la importación de PDFs bancarios (generalmente protegidos con tu
                  cédula)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Mínimo 8 caracteres, con mayúscula, minúscula y número
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error message */}
          {form.formState.errors.root && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
