'use client'
import React from 'react';
import bg from '/public/couple_background.jpg';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function background() {
  return (
    <>
      <div className="h-screen">
        <Image
          alt="girl with a boy "
          src={bg}
          placeholder="blur"
          quality={100}
          fill
          sizes="100vw"
          style={{
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
        <div className="absolute sm:bottom-1/4 sm:right-12 bottom-6 flex flex-col gap-2 items-center sm:w-auto w-full">
          <Button
            className=" bg-pink-700 font-bold tracking-tight text-center rounded-full w-64 hover:bg-pink-700"
            onClick={() => signIn('', { callbackUrl: '/profileCompletion' })}
          >
            Create Account
          </Button>
          <Button className=" bg-pink-700 font-bold tracking-tight text-center rounded-full w-64 hover:bg-pink-700">
            Login
          </Button>
          {/* <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Border Magic
            </span>
          </button> */}
        </div>
      </div>
    </>
  );
}
