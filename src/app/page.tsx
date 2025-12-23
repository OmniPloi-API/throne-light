import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the Book site as the primary landing
  redirect('/book');
}
