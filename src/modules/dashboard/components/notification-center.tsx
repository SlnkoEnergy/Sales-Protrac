
import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router';
 
export function NotificationCenter() {
  const navigate = useNavigate();
 
  return (
    <Inbox
      applicationIdentifier="vHKf6fc5ojnD"
      subscriber="6839a4086356310d4e15f6c7"
      routerPush={(path: string) => navigate(path)}
    />
  );
}