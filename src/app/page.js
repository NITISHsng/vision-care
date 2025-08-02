'use client';
import AdminPanel from "@/components/AdminPanal";
import CheckInButtons from '@/components/CheckInButtons';
export default function Home() {
  return (
    <main style={{ padding: '2rem'  }}>
      <div className='w-full text-3xl font-bold flex justify-center'>
      <h1 >Vision Care</h1>
      </div>
      <CheckInButtons />
      <hr style={{ margin: '2rem 0' }} />
      <AdminPanel />
    </main>
  );
}

