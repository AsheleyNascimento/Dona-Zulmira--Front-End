'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FaUser, FaPencilAlt, FaFileAlt } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';

const col1 = [
  ['Moradores', <FaUser className="text-[1.5em] text-[#003d99]" />],
  [
    'Evoluções individuais',
    <FaPencilAlt className="text-[1.5em] text-[#003d99]" />,
  ],
  ['Evoluções gerais', <FaFileAlt className="text-[1.5em] text-[#003d99]" />],
];

export default function CuidadorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      <aside className="w-1/4 flex flex-col items-center justify-center bg-white p-6 border-r border-[#e9f1f9]">
        <div className="flex flex-col items-center">
          <img src="/logo-ssvp.png" alt="Logo" className="w-[8em] mb-4" />
          <h2 className="text-[#002c6c] text-[1em] font-bold uppercase text-center">
            CASA DONA ZULMIRA
          </h2>
        </div>
      </aside>

      <main className="flex-1 flex flex-col justify-center items-center py-10 px-8">
        <div className="w-full flex justify-end text-[#002c6c] text-[1em] font-semibold mb-6">
          <FaUser className="mr-2 text-[#003d99]" /> Cuidadores
        </div>

        <div className="flex justify-center">
          <Card className="flex flex-col gap-4 p-6 bg-white rounded-[1.5em] shadow-sm w-[18em] h-[20em] border border-[#e9f1f9]">
            {col1.map(([label, icon], i) => (
              <Button
                key={i}
                variant="ghost"
                className="flex items-center justify-start gap-4 text-[#002c6c] text-[1em] font-medium h-[33.33%] border-b border-[#003d99]/20 last:border-b-0 hover:bg-[#e9f1f9]/50 cursor-pointer"
              >
                {icon}
                <span>{label}</span>
              </Button>
            ))}
          </Card>
        </div>

        <div className="mt-8 w-full flex justify-start px-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="text-[#003d99] hover:underline text-[1.5em] cursor-pointer"
          >
            <BiLogOut />
          </Button>
        </div>
      </main>
    </div>
  );
}
