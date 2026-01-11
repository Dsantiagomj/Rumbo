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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                Facilitará la importación de PDFs bancarios (generalmente protegidos con tu cédula)
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
        <Button type="submit" variant="brand" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </Form>
  );
}
