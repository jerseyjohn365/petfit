import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (session) return <Redirect href="/(tabs)" />;

  return <Redirect href="/(auth)/login" />;
}
