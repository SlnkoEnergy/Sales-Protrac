"use client";

import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header'; // Adjust path based on alias setup

export default function Layout(){
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

