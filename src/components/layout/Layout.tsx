"use client";

import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { NotificationCenter } from '../../modules/dashboard/components/notification-center';

export default function Layout() {
  return (
    <>
      <Header />
      <nav>
        <NotificationCenter />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
