import { Locale } from '@/lang/types';
import { useLang } from '@/lang/hooks';
import { FC, useEffect } from 'react'

const chatBoxDomain = 'https://message-hub-api.joyone.vn';

const chatBoxIds = {
  [Locale.VI]: '6743508b5bb500f629c4814e',
  [Locale.EN]: '677df010e4fefeb7768ea8e0',
}

// const chatBoxDomain = 'http://localhost:4200';

// const chatBoxIds = {
//   [Locale.VI]: '6779e167c8fa36c4b2e520d9',
//   [Locale.EN]: '67867331051ee4b75e1ec016',
// }

export const ChatBox: FC = () => {
  const { locale } = useLang();

  const chatBoxId = chatBoxIds[locale];

  useEffect(() => {
    if (chatBoxId) {
      const script = document.createElement('script');
      script.id = `joyone-chatbox-${chatBoxId}`;
      script.src = `${chatBoxDomain}/channels/sdk/${chatBoxId}/main.js`;
      document.body.appendChild(script);

      return () => {
        script.remove();
      }
    }
  }, [chatBoxId])

  return null;
}