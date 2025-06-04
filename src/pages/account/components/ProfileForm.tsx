
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-firebase-auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onCancel: () => void;
}

const ProfileForm = ({ onCancel }: ProfileFormProps) => {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await updateUserProfile(data.name, data.email);
      onCancel(); // Navigate back to dashboard
    } catch (error) {
      // Error handled in the auth service
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-brand-green"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-brand-green"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-black"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
