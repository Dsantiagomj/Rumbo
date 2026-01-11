'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { trpc } from '@/shared/lib/trpc/client';
import { updateProfileSchema, type UpdateProfileInput } from '../utils/validation';

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { data: profile, isLoading: isLoadingProfile } = trpc.auth.getProfile.useQuery();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      preferredName: '',
      email: '',
      currency: 'COP',
      language: 'es-CO',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/Bogota',
    },
  });

  // Load profile data into form (only when profile data changes)
  // Note: form.reset is stable and doesn't need to be in dependencies
  const profileRef = useRef(profile);
  useEffect(() => {
    // Only update if profile actually changed (not just reference)
    if (profile && profile !== profileRef.current) {
      profileRef.current = profile;
      form.reset({
        name: profile.name,
        preferredName: profile.preferredName,
        email: profile.email,
        currency: profile.currency as 'COP' | 'USD' | 'EUR',
        language: profile.language as 'es-CO' | 'en-US',
        dateFormat: profile.dateFormat as 'DD/MM/YYYY' | 'MM/DD/YYYY',
        timezone: profile.timezone,
      });
    }
  }, [profile, form]);

  // Memoize mutation callbacks to prevent re-renders
  const handleSuccess = useCallback((data: { message: string }) => {
    setIsLoading(false);
    setSuccessMessage(data.message);

    // Clear any existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    // Set new timeout and store reference for cleanup
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handleError = useCallback(
    (error: { message?: string }) => {
      setIsLoading(false);
      form.setError('root', {
        message: error.message || 'Ocurrió un error al actualizar tu perfil',
      });
    },
    [form],
  );

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Memoize submit handler to prevent unnecessary re-renders of form
  const onSubmit = useCallback(
    async (data: UpdateProfileInput) => {
      setIsLoading(true);
      setSuccessMessage('');
      updateMutation.mutate(data);
    },
    [updateMutation],
  );

  if (isLoadingProfile) {
    return <div>Cargando perfil...</div>;
  }

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
                <Input {...field} disabled={isLoading} />
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
              <FormLabel>¿Cómo querés que te llame?</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>La AI usará este nombre cuando chatees</FormDescription>
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
                <Input type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná tu moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COP">COP (Peso Colombiano)</SelectItem>
                  <SelectItem value="USD">USD (Dólar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Moneda principal para tus transacciones</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language */}
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná tu idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="es-CO">Español (Colombia)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Format */}
        <FormField
          control={form.control}
          name="dateFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato de fecha</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná el formato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (día/mes/año)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (mes/día/año)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timezone */}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona horaria</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná tu zona horaria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="America/Bogota">Colombia (UTC-5)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (UTC-5/UTC-4)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (UTC-8/UTC-7)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (UTC+1/UTC+2)</SelectItem>
                  <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Usada para mostrar fechas y recordatorios</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Success message */}
        {successMessage && (
          <div className="bg-financial-positive/10 text-financial-positive rounded-md p-3 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {form.formState.errors.root && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Submit button */}
        <Button type="submit" variant="brand" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Form>
  );
}
