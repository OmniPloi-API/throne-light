import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the Publisher site as the primary landing
  redirect('/publisher');
}
