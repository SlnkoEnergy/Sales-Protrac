
import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router';
 
export function NotificationCenter() {
  const navigate = useNavigate();
 
  return (
    <Inbox
      applicationIdentifier="vHKf6fc5ojnD"
      subscriber="6864c58da3a6f7ceca663d9d"
      routerPush={(path: string) => navigate(path)}
    />
  );
}