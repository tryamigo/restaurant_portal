// app/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /orders after the component mounts
    router.push('/orders');
  }, [router]);

  return null; // You can also render a loading state or message here if needed
}